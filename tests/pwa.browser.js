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
        await page.getByRole('tab', { name: 'Settings', exact: true }).click();
        await expect(page.locator('#settings-install')).toBeVisible();
        await expect(page.getByRole('switch', { name: 'AI opponent', exact: false })).toBeChecked();
        await page.screenshot({ path: 'test-results/android-settings.png' });
        await page.getByRole('tab', { name: 'Home', exact: true }).click();
        await page.getByRole('button', { name: 'Play', exact: true }).click();
        await page.waitForFunction(() => window.__game.scene.isActive('Game'));
        await expect(page.locator('#menu-shell')).toBeHidden();
        expect(errors).toEqual([]);
    } finally { await context?.close(); await rm(profile, { recursive: true, force: true }); }
});

test('phone install help works when a browser does not offer a native prompt', async ({ browser }) => {
    const context = await browser.newContext(devices['Pixel 7']);
    const page = await context.newPage();
    await ready(page);
    await page.getByRole('button', { name: 'Install game', exact: true }).click();
    await expect(page.locator('#install-guide')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Install on Android' })).toBeVisible();
    await expect(page.locator('#install-guide-steps')).toContainText('Chrome');
    await page.screenshot({ path: 'test-results/android-install-help.png' });
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.locator('#install-guide')).toBeHidden();
    await page.getByRole('tab', { name: 'Settings', exact: true }).click();
    await page.locator('#settings-install').click();
    await expect(page.locator('#install-guide')).toBeVisible();
    await page.getByRole('button', { name: 'Got it' }).click();
    await page.getByRole('tab', { name: 'Home', exact: true }).click();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(() => window.__game.scene.isActive('Game'));
    // Closing install help must not leave Phaser paused by a synthetic blur.
    expect(await page.evaluate(() => window.__game.isRunning && !window.__game.isPaused)).toBe(true);
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

test('phone tabs separate settings and skins, preview selections, and preserve choices', async ({ browser }) => {
    const context = await browser.newContext(devices['Pixel 7']);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await ready(page);
    await expect(page.getByRole('tab')).toHaveText(['Settings', 'Home', 'Skins']);
    await expect(page.getByRole('tab', { name: 'Home', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Settings', exact: true }).click();
    await expect(page.locator('#skin-grid')).toBeHidden();
    await page.getByRole('button', { name: 'Increase speed' }).click();
    await page.getByLabel('Food', { exact: true }).selectOption('sushi');
    await page.getByLabel('Difficulty', { exact: true }).selectOption('hard');
    await page.getByRole('switch', { name: 'Spikes', exact: false }).check();
    await expect(page.locator('#preview-detail')).toHaveText('Speed 6 · Hard');
    await page.getByRole('switch', { name: 'AI opponent', exact: false }).uncheck();
    await expect(page.getByLabel('Difficulty', { exact: true })).toBeDisabled();
    await page.getByRole('switch', { name: 'AI opponent', exact: false }).check();
    await page.getByRole('tab', { name: 'Skins', exact: true }).click();
    await expect(page.locator('#skin-grid button')).toHaveCount(21);
    await page.getByRole('button', { name: 'Lava', exact: true }).click();
    await expect(page.locator('#snake-preview')).toHaveAttribute('data-skin', 'lava');
    await expect(page.locator('#preview-detail')).toHaveText('Lava');
    await expect(page.locator('#color-grid button:disabled')).toHaveCount(8);
    await page.screenshot({ path: 'test-results/android-skins.png' });
    await page.setViewportSize({ width: 851, height: 393 });
    await expect(page.getByRole('tab', { name: 'Skins', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#preview-detail')).toHaveText('Lava');
    await page.screenshot({ path: 'test-results/android-landscape.png' });
    await page.setViewportSize({ width: 320, height: 568 });
    const fit = await page.evaluate(() => {
        const nav = document.querySelector('.bottom-nav').getBoundingClientRect();
        return { width: document.documentElement.scrollWidth, viewport: innerWidth, bottom: nav.bottom, height: innerHeight };
    });
    expect(fit.width).toBe(fit.viewport);
    expect(fit.bottom).toBe(fit.height);
    await page.getByRole('button', { name: 'Classic', exact: true }).first().click();
    await page.locator('#color-grid').getByRole('button', { name: 'Purple', exact: true }).click();
    await page.screenshot({ path: 'test-results/small-phone-skins.png' });
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Home', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#home-setup')).toContainText('Speed 6');
    await expect(page.locator('#home-challenge')).toHaveText('Hard rival');
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(() => window.__game.scene.isActive('Game'));
    const state = await page.evaluate(() => {
        const game = window.__game.scene.getScene('Game');
        return { skin: game.playerSkin, color: game.snake.color, food: localStorage.getItem('foodType'), speed: localStorage.getItem('snakeSpeed'), spikes: localStorage.getItem('modeSpikes') };
    });
    expect(state).toEqual({ skin: 'classic', color: 0xc77dff, food: 'sushi', speed: '6', spikes: 'true' });
    await expect(page.getByRole('tab')).toHaveCount(0);
    await page.evaluate(() => window.__game.scene.getScene('Game').gameOver());
    await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
    await context.close();
});

test('all skin previews match gameplay and keyboard navigation survives a game', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => localStorage.setItem('snakeSkinProgressV1', JSON.stringify({
        version: 1, totalApples: 250, bestScore: 25, fruitfulRuns: 3, spikesBest: 15,
        teleportBest: 15, colorBest: 12, hardBest: 12, extraHardBest: 12, speedBest: 10, comboBest: 15
    })));
    await ready(page);
    await page.getByRole('tab', { name: 'Home', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Skins', exact: true })).toBeFocused();
    const skins = await page.locator('#skin-grid button').evaluateAll(buttons => buttons.map(button => button.dataset.skin));
    for (const skin of skins) {
        await page.locator(`#skin-grid button[data-skin="${skin}"]`).click();
        await expect(page.locator('#snake-preview')).toHaveAttribute('data-skin', skin);
        if (['tiger', 'watermelon', 'bee', 'bubblegum', 'aurora', 'circuit', 'dragon', 'galaxy'].includes(skin)) {
            await page.locator('#snake-preview').screenshot({ path: 'test-results/skin-' + skin + '.png' });
        }
        // A nonempty canvas thumbnail verifies the shared texture set rendered.
        expect(await page.locator(`#skin-grid button[data-skin="${skin}"] canvas`).evaluate(canvas => {
            const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            return data.some((value, i) => i % 4 === 3 && value > 0);
        })).toBe(true);
        if (await page.locator('#equip-skin').isEnabled()) await page.locator('#equip-skin').click();
        await page.getByRole('tab', { name: 'Home', exact: true }).click();
        await page.getByRole('button', { name: 'Play', exact: true }).click();
        await page.waitForFunction(() => window.__game.scene.isActive('Game'));
        expect(await page.evaluate(() => window.__game.scene.getScene('Game').playerSkin)).toBe(skin);
        await page.evaluate(() => window.__game.scene.getScene('Game').gameOver());
        await page.getByRole('tab', { name: 'Home', exact: true }).focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.getByRole('tab', { name: 'Skins', exact: true })).toBeFocused();
    }
    await page.getByRole('tab', { name: 'Home', exact: true }).click();
    await page.getByRole('button', { name: 'High scores', exact: true }).click();
    await expect(page.locator('#scores-dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(page.locator('#scores-dialog')).toBeHidden();
    await page.screenshot({ path: 'test-results/desktop-home.png' });
    expect(errors).toEqual([]);
});

test('menus and gameplay remain usable when browser storage is blocked', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage denied', 'SecurityError'); } });
    });
    await ready(page);
    await page.getByRole('tab', { name: 'Skins', exact: true }).click();
    await expect(page.locator('#collection-hint')).toContainText('Progress lasts for this session');
    await page.getByRole('tab', { name: 'Settings', exact: true }).click();
    await expect(page.locator('#speed-value')).toHaveText('5');
    await page.getByRole('tab', { name: 'Home', exact: true }).click();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(() => window.__game.scene.isActive('Game'));
    expect(await page.evaluate(() => !!window.__game.scene.getScene('Game').snake)).toBe(true);
    expect(errors).toEqual([]);
});

async function collectFood(page, apples) {
    await page.evaluate(apples => {
        const game = window.__game.scene.getScene('Game');
        game.scene.pause(); // Advance food collisions deterministically, without racing animation frames.
        for (let i = 0; i < apples; i++) {
            const head = game.snake.gridCoords[0];
            game.apple.setPosition(head.x, head.y);
            game.resolveFood();
        }
    }, apples);
}

test('locked skins preview safely and apples earn permanent skins across offline reloads', async ({ browser }) => {
    const context = await browser.newContext(devices['Pixel 7']);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await ready(page);
    await page.getByRole('tab', { name: 'Skins', exact: true }).click();
    await expect(page.locator('#collection-count')).toHaveText('1 / 21 unlocked');
    await page.getByRole('button', { name: 'Galaxy', exact: true }).click();
    await expect(page.locator('#snake-preview')).toHaveAttribute('data-skin', 'galaxy');
    await expect(page.locator('#skin-requirement')).toContainText('250 apples');
    await expect(page.locator('#equip-skin')).toBeDisabled();
    await expect(page.locator('#skin-ownership')).toContainText('Locked');
    await page.screenshot({ path: 'test-results/android-locked-galaxy.png' });
    // An old selected-skin preference cannot bypass the gameplay gate.
    await page.evaluate(() => {
        localStorage.setItem('snakeSkin', 'galaxy');
        localStorage.setItem('foodType', 'sushi');
        localStorage.setItem('rivalEnabled', 'false');
        localStorage.setItem('ghostEnabled', 'false');
        window.__game.scene.getScene('TitleScreen').scene.start('Game');
    });
    await page.waitForFunction(() => window.__game.scene.isActive('Game'));
    expect(await page.evaluate(() => window.__game.scene.getScene('Game').playerSkin)).toBe('classic');
    await collectFood(page, 3);
    await page.evaluate(() => window.__game.scene.getScene('Game').gameOver());
    await page.getByRole('tab', { name: 'Skins', exact: true }).click();
    await page.getByRole('button', { name: 'Slime', exact: true }).click();
    await expect(page.locator('#skin-progress-text')).toHaveText('3 / 5 apples');
    await expect(page.locator('#equip-skin')).toBeDisabled();
    await context.setOffline(true);
    await page.reload();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(() => window.__game.scene.isActive('Game'));
    await collectFood(page, 2);
    await expect(page.locator('#skin-unlock-toast')).toContainText('Slime');
    // A cold reload mid-run keeps the collected apples; it does not count them again.
    await page.reload();
    await page.getByRole('tab', { name: 'Skins', exact: true }).click();
    await page.getByRole('button', { name: 'Slime', exact: true }).click();
    await expect(page.locator('#collection-apples')).toHaveText('5');
    await expect(page.locator('#equip-skin')).toBeEnabled();
    await page.locator('#equip-skin').click();
    await expect(page.locator('#skin-ownership')).toHaveText('Equipped');
    await page.screenshot({ path: 'test-results/android-earned-slime.png' });
    await page.getByRole('tab', { name: 'Home', exact: true }).click();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(() => window.__game.scene.isActive('Game'));
    expect(await page.evaluate(() => window.__game.scene.getScene('Game').playerSkin)).toBe('slime');
    await page.evaluate(() => {
        const game = window.__game.scene.getScene('Game');
        game.gameOver(); game.gameOver();
    });
    await page.getByRole('tab', { name: 'Settings', exact: true }).click();
    await page.getByRole('button', { name: 'Clear high scores', exact: true }).click();
    await page.reload();
    await page.getByRole('tab', { name: 'Skins', exact: true }).click();
    await page.getByRole('button', { name: 'Slime', exact: true }).click();
    await expect(page.locator('#skin-ownership')).toHaveText('Equipped');
    await expect(page.locator('#collection-apples')).toHaveText('5');
    expect(errors).toEqual([]);
    await context.close();
});

test('mixed challenges use the run settings and celebrate earned skins after a game', async ({ page }) => {
    await ready(page);
    await page.getByRole('tab', { name: 'Settings', exact: true }).click();
    await page.getByLabel('Difficulty', { exact: true }).selectOption('extraHard');
    for (const mode of ['Spikes', 'Teleport', 'Color shuffle']) await page.getByRole('switch', { name: mode, exact: false }).check();
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Increase speed' }).click();
    await page.getByRole('tab', { name: 'Home', exact: true }).click();
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForFunction(() => window.__game.scene.isActive('Game'));
    // The rival eating food must not earn player rewards.
    expect(await page.evaluate(() => {
        const game = window.__game.scene.getScene('Game');
        game.scene.pause();
        const rivalHead = game.rival.gridCoords[0];
        game.apple.setPosition(rivalHead.x, rivalHead.y);
        game.resolveFood();
        return JSON.parse(localStorage.getItem('snakeSkinProgressV1')).totalApples;
    })).toBe(0);
    await collectFood(page, 15);
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('snakeSkinProgressV1')));
    expect(progress).toMatchObject({ totalApples: 15, bestScore: 15, comboBest: 15, extraHardBest: 15, speedBest: 15 });
    expect(progress.unlocked).toEqual(expect.arrayContaining(['slime', 'black', 'brainrot', 'pixel', 'neon', 'lava', 'watermelon', 'bee', 'robot', 'circuit', 'aurora', 'dragon']));
    expect(progress.unlocked).not.toContain('tiger');
    expect(progress.unlocked).not.toContain('galaxy');
    await page.evaluate(() => window.__game.scene.getScene('Game').gameOver());
    await expect(page.locator('#earned-notice')).toContainText('Jade Dragon');
    await page.getByRole('tab', { name: 'Skins', exact: true }).click();
    await page.getByRole('button', { name: 'Jade Dragon', exact: true }).click();
    await expect(page.locator('#equip-skin')).toBeEnabled();
    await page.locator('#equip-skin').click();
    await page.reload();
    await expect(page.locator('#preview-detail')).toHaveText('Jade Dragon');
});
