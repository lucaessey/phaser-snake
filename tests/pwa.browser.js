import { test, expect, chromium, devices } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

async function observeGame(page) {
    await page.addInitScript(() => {
        window.installAvailable = false;
        window.addEventListener('beforeinstallprompt', () => { window.installAvailable = true; });
        Object.defineProperty(window, 'Phaser', { configurable: true, set(phaser) {
            Object.defineProperty(window, 'Phaser', { configurable: true, writable: true, value: phaser });
            const boot = phaser.Game.prototype.boot;
            phaser.Game.prototype.boot = function (...args) { window.__game = this; return boot.apply(this, args); };
        } });
    });
}
async function ready(page) {
    await observeGame(page);
    await page.goto('http://127.0.0.1:4175/phaser-snake/');
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScreen'));
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
}
async function clickSceneText(page, text) {
    const point = await page.evaluate(text => {
        const game = window.__game;
        const scene = game.scene.getScenes(true)[0];
        const item = scene.children.list.find(item => item.text === text);
        if (!item) throw new Error(`Missing scene text: ${text}`);
        const box = game.canvas.getBoundingClientRect();
        const bounds = item.getBounds();
        return { x: box.x + bounds.centerX / game.scale.width * box.width, y: box.y + bounds.centerY / game.scale.height * box.height };
    }, text);
    await page.mouse.click(point.x, point.y);
}

test('Android is installable at the Pages subfolder and plays after a cold offline reload', async () => {
    const profile = await mkdtemp(join(tmpdir(), 'snake-phone-'));
    let context;
    try {
        context = await chromium.launchPersistentContext(profile, {
            ...devices['Pixel 7'], headless: true,
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await ready(page);
        const cdp = await context.newCDPSession(page);
        expect((await cdp.send('Page.getInstallabilityErrors')).installabilityErrors).toEqual([]);
        const manifest = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
        expect(manifest.display).toBe('standalone');
        expect(manifest.icons.map(icon => icon.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
        await expect(page.getByRole('button', { name: 'Install game', exact: true })).toBeVisible();
        await page.screenshot({ path: 'test-results/android-title.png' });
        await context.setOffline(true);
        await page.reload();
        await page.waitForFunction(() => window.__game?.scene.isActive('TitleScreen'));
        await clickSceneText(page, '⚙️');
        await page.waitForFunction(() => window.__game.scene.isActive('SettingsScreen'));
        const labels = await page.evaluate(() => window.__game.scene.getScene('SettingsScreen').children.list.map(item => item.text).filter(Boolean));
        expect(labels).toContain('Install game');
        expect(labels.some(label => label.startsWith('AI Opponent:'))).toBe(true);
        expect(labels.some(label => label.startsWith('Skin:'))).toBe(true);
        await page.screenshot({ path: 'test-results/android-settings.png' });
        await clickSceneText(page, 'Back');
        await clickSceneText(page, 'Start Game');
        await page.waitForFunction(() => window.__game.scene.isActive('Game'));
        await expect(page.locator('#pwa-tools')).toBeHidden();
        expect(errors).toEqual([]);
    } finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
});

test('phone install help works when a browser does not offer a native prompt', async ({ browser }) => {
    const context = await browser.newContext(devices['Pixel 7']);
    const page = await context.newPage();
    await ready(page);
    await page.getByRole('button', { name: 'Install game', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Install on Android' })).toBeVisible();
    await expect(page.locator('#install-guide-steps')).toContainText('Chrome');
    await page.screenshot({ path: 'test-results/android-install-help.png' });
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
    await clickSceneText(page, '⚙️');
    await page.waitForFunction(() => window.__game.scene.isActive('SettingsScreen'));
    await clickSceneText(page, 'Install game');
    await expect(page.getByRole('dialog')).toBeVisible();
    await context.close();
});

test('updates wait for the player and can be applied explicitly', async ({ page, request }) => {
    await ready(page);
    await request.post('/__test/update');
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await expect(page.locator('#update-notice')).toBeVisible();
    await page.getByRole('button', { name: 'Later', exact: true }).click();
    await expect(page.locator('#update-notice')).toBeHidden();
    await page.reload();
    await expect(page.locator('#update-notice')).toBeVisible();
    await page.getByRole('button', { name: 'Update now', exact: true }).click();
    await expect(page.locator('#update-notice')).toBeHidden();
    await page.waitForFunction(() => window.__game?.scene.isActive('TitleScreen'));
});
