import { SKINS } from './skins';
import { SNAKE_COLORS } from './Snake';
import { RIVAL_DIFFICULTY } from './rivalAI';
import { safeSetItem, safeRemoveItem } from './storage';
import { clearHighScores, getAllHighScores } from './highscores';
import { requestInstall, subscribeInstallState } from '../pwa';
import { readMenuPreferences } from './menuPreferences';
import { createMenuPreview } from './menuPreview';

const TAB_COPY = {
    home: ['ONE MORE ROUND', 'Ready, set, snake.', 'A little strategy. A lot of apples.', 'Your snake'],
    settings: ['YOUR RULES', 'Make it your game.', 'Set your pace. Pick your challenge.', 'Your setup'],
    skins: ['A FRESH LOOK', 'Find your favorite.', 'Tap a skin to see it in action above.', 'Skin preview']
};
const byId = id => document.getElementById(id);
const entries = () => Object.values(getAllHighScores())
    .filter(entry => entry && typeof entry.label === 'string' && Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score);

export function createMenu(scene, initialTab = 'home') {
    const shell = byId('menu-shell');
    const scroll = byId('menu-scroll');
    const controller = new AbortController();
    const on = (node, type, handler) => node.addEventListener(type, handler, { signal: controller.signal });
    const prefs = readMenuPreferences();
    const tabs = ['settings', 'home', 'skins'];
    let activeTab = 'home';
    shell.hidden = false;
    document.body.classList.add('menu-open');
    byId('game-container').inert = true;
    const preview = createMenuPreview(scene, byId('snake-preview'), () => prefs);

    function selectTab(tab, focus = false) {
        if (!tabs.includes(tab)) tab = 'home';
        activeTab = tab;
        for (const id of tabs) {
            const button = byId(`tab-${id}`);
            const selected = id === tab;
            button.setAttribute('aria-selected', String(selected));
            button.tabIndex = selected ? 0 : -1;
            byId(`panel-${id}`).hidden = !selected;
        }
        const copy = TAB_COPY[tab];
        ['menu-eyebrow', 'menu-title', 'menu-description', 'preview-label'].forEach((id, i) => { byId(id).textContent = copy[i]; });
        scroll.scrollTop = 0;
        if (focus) byId(`tab-${tab}`).focus();
        refresh();
    }

    function refresh() {
        const skin = SKINS.find(skin => skin.id === prefs.snakeSkin);
        byId('speed-value').value = prefs.snakeSpeed;
        byId('speed-down').disabled = prefs.snakeSpeed <= 1;
        byId('speed-up').disabled = prefs.snakeSpeed >= 20;
        byId('difficulty-select').disabled = !prefs.rivalEnabled;
        byId('home-challenge').textContent = prefs.rivalEnabled ? `${RIVAL_DIFFICULTY[prefs.rivalDifficulty].name} rival` : 'Solo run';
        const grid = prefs.gridSize[0].toUpperCase() + prefs.gridSize.slice(1);
        byId('home-setup').textContent = `Speed ${prefs.snakeSpeed} · ${grid} grid`;
        byId('home-best').textContent = entries()[0]?.score || 0;
        byId('preview-detail').textContent = activeTab === 'settings' ? `Speed ${prefs.snakeSpeed} · ${prefs.rivalEnabled ? RIVAL_DIFFICULTY[prefs.rivalDifficulty].name : 'Solo'}` : skin.name;
        for (const button of byId('skin-grid').children) {
            button.setAttribute('aria-pressed', String(button.dataset.skin === prefs.snakeSkin));
            if (button.dataset.skin === 'classic') preview.thumbnail(button.querySelector('canvas'), 'classic', prefs.snakeColorIndex);
        }
        const classic = prefs.snakeSkin === 'classic';
        byId('color-name').textContent = SNAKE_COLORS[prefs.snakeColorIndex].name;
        byId('color-help').textContent = classic ? 'Choose a tint for the Classic skin.' : 'Select Classic to use these colors. Other skins have their own colors.';
        for (const button of byId('color-grid').children) {
            button.disabled = !classic;
            button.setAttribute('aria-pressed', String(Number(button.dataset.color) === prefs.snakeColorIndex));
        }
        preview.draw();
    }

    function save(key, value) {
        prefs[key] = value;
        safeSetItem(key, value);
        refresh();
    }

    for (const tab of tabs) {
        on(byId(`tab-${tab}`), 'click', () => selectTab(tab));
        on(byId(`tab-${tab}`), 'keydown', event => {
            const index = tabs.indexOf(tab);
            const next = { ArrowRight: tabs[(index + 1) % tabs.length], ArrowLeft: tabs[(index + tabs.length - 1) % tabs.length], Home: tabs[0], End: tabs.at(-1) }[event.key];
            if (!next) return;
            event.preventDefault();
            selectTab(next, true);
        });
    }

    for (const control of shell.querySelectorAll('[data-preference]')) {
        const key = control.dataset.preference;
        if (control.type === 'checkbox') control.checked = prefs[key];
        else control.value = prefs[key];
        on(control, 'change', () => save(key, control.type === 'checkbox' ? control.checked : control.value));
    }
    on(byId('speed-down'), 'click', () => save('snakeSpeed', Math.max(1, prefs.snakeSpeed - 1)));
    on(byId('speed-up'), 'click', () => save('snakeSpeed', Math.min(20, prefs.snakeSpeed + 1)));

    byId('skin-grid').replaceChildren(...SKINS.map(skin => {
        const button = document.createElement('button');
        button.className = 'skin-card';
        button.dataset.skin = skin.id;
        button.setAttribute('aria-label', skin.name);
        const thumb = document.createElement('canvas');
        thumb.width = 148; thumb.height = 56;
        thumb.setAttribute('aria-hidden', 'true');
        const name = document.createElement('span');
        name.textContent = skin.name;
        const check = document.createElement('span');
        check.className = 'skin-check'; check.textContent = '✓'; check.setAttribute('aria-hidden', 'true');
        button.append(thumb, name, check);
        preview.thumbnail(thumb, skin.id, prefs.snakeColorIndex);
        on(button, 'click', () => {
            save('snakeSkin', skin.id);
            // Keep the live preview visible even when choosing a skin far down the list.
            scroll.scrollTo({ top: 0, behavior: 'instant' });
        });
        return button;
    }));
    byId('color-grid').replaceChildren(...SNAKE_COLORS.map((color, index) => {
        const button = document.createElement('button');
        button.className = 'color-swatch';
        button.dataset.color = index;
        button.setAttribute('aria-label', color.name);
        button.title = color.name;
        button.style.setProperty('--swatch', '#' + color.tint.toString(16).padStart(6, '0'));
        button.innerHTML = '<span aria-hidden="true">✓</span>';
        on(button, 'click', () => { save('snakeColorIndex', index); scroll.scrollTo({ top: 0, behavior: 'instant' }); });
        return button;
    }));

    on(byId('play-button'), 'click', () => {
        // Keep gameplay consistent with the validated values shown in the menu.
        for (const [key, value] of Object.entries(prefs)) safeSetItem(key, value);
        scene.scene.start('Game');
    });
    on(byId('settings-install'), 'click', () => { void requestInstall(); });
    const unsubscribe = subscribeInstallState(state => {
        const button = byId('settings-install');
        button.disabled = state === 'installed' || state === 'installing';
        button.textContent = state === 'installed' ? 'Installed' : state === 'installing' ? 'Installing…' : 'Install game';
    });
    on(byId('clear-scores'), 'click', () => {
        clearHighScores();
        safeRemoveItem('highScore');
        safeRemoveItem('snakeGhost');
        byId('settings-message').textContent = 'High scores and ghost replay cleared.';
        refresh();
    });
    byId('settings-message').textContent = '';
    on(byId('show-scores'), 'click', () => {
        const scores = entries();
        const list = byId('scores-list');
        list.replaceChildren();
        if (!scores.length) {
            const empty = document.createElement('p');
            empty.textContent = 'No high scores yet. Play a game to set one!';
            list.append(empty);
        }
        for (const entry of scores) {
            const row = document.createElement('div'); row.className = 'score-row';
            const label = document.createElement('span'); label.textContent = entry.label;
            const score = document.createElement('strong'); score.textContent = entry.score;
            row.append(label, score); list.append(row);
        }
        byId('scores-dialog').showModal();
    });
    on(byId('scores-close'), 'click', () => byId('scores-dialog').close());
    selectTab(initialTab);
    return () => {
        controller.abort();
        unsubscribe();
        preview.dispose();
        byId('scores-dialog').close();
        shell.hidden = true;
        document.body.classList.remove('menu-open');
        byId('game-container').inert = false;
        scene.game.canvas.tabIndex = 0;
        scene.game.canvas.focus({ preventScroll: true });
    };
}
