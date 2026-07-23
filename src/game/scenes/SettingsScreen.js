import { Scene } from 'phaser';
import { SNAKE_COLORS } from '../Snake';
import { RIVAL_DIFFICULTY, RIVAL_DIFFICULTY_ORDER } from '../rivalAI';
import { GRID_SIZES, SKINS } from './Game';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../storage';
import { clearHighScores } from '../highscores';

export class SettingsScreen extends Scene
{
    constructor ()
    {
        super('SettingsScreen');
    }

    create ()
    {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const cx = w / 2;
        const portrait = h >= w;          // phones (portrait) get a single column
        this.fs = portrait ? 20 : 22;     // control font size

        this.add.rectangle(0, 0, w, h, 0x000000, 0.9).setOrigin(0, 0);

        const titleY = Math.round(h * 0.055) + 18;
        this.add.text(cx, titleY, 'Settings', {
            fontFamily: 'Arial Black', fontSize: portrait ? 30 : 40, color: '#ffffff'
        }).setOrigin(0.5);

        const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        const css = (t) => '#' + t.toString(16).padStart(6, '0');

        // ---- Each control is a single tappable line, laid out below ----
        const controls = [];

        controls.push((x, y) => this.makeStepper(x, y, 'Speed', 'snakeSpeed', 5, 1, 20));

        const foods = ['apple', 'banana', 'eggplant', 'jerry', 'sushi'];
        controls.push((x, y) => this.makeCycle(x, y, 'Food',
            () => cap(safeGetItem('foodType') || 'apple'),
            () => {
                const cur = safeGetItem('foodType') || 'apple';
                const n = foods[(foods.indexOf(cur) + 1) % foods.length];
                safeSetItem('foodType', n);
                return cap(n);
            }));

        controls.push((x, y) => {
            let i = parseInt(safeGetItem('snakeColorIndex')) || 0;
            this.makeCycle(x, y, 'Color',
                () => SNAKE_COLORS[i].name,
                () => { i = (i + 1) % SNAKE_COLORS.length; safeSetItem('snakeColorIndex', i); return SNAKE_COLORS[i].name; },
                () => css(SNAKE_COLORS[i].tint));
        });

        controls.push((x, y) => {
            let gi = Math.max(0, GRID_SIZES.findIndex(g => g.id === (safeGetItem('gridSize') || 'auto')));
            this.makeCycle(x, y, 'Grid',
                () => GRID_SIZES[gi].name,
                () => { gi = (gi + 1) % GRID_SIZES.length; safeSetItem('gridSize', GRID_SIZES[gi].id); return GRID_SIZES[gi].name; });
        });

        controls.push((x, y) => {
            let si = Math.max(0, SKINS.findIndex(s => s.id === safeGetItem('snakeSkin')));
            this.makeCycle(x, y, 'Skin',
                () => SKINS[si].name,
                () => { si = (si + 1) % SKINS.length; safeSetItem('snakeSkin', SKINS[si].id); return SKINS[si].name; });
        });

        controls.push((x, y) => this.makeToggle(x, y, 'AI Opponent', 'rivalEnabled', true));

        controls.push((x, y) => {
            let di = Math.max(0, RIVAL_DIFFICULTY_ORDER.indexOf(safeGetItem('rivalDifficulty') || 'medium'));
            this.makeCycle(x, y, 'Difficulty',
                () => RIVAL_DIFFICULTY[RIVAL_DIFFICULTY_ORDER[di]].name,
                () => { di = (di + 1) % RIVAL_DIFFICULTY_ORDER.length; safeSetItem('rivalDifficulty', RIVAL_DIFFICULTY_ORDER[di]); return RIVAL_DIFFICULTY[RIVAL_DIFFICULTY_ORDER[di]].name; });
        });

        controls.push((x, y) => this.makeToggle(x, y, 'Ghost', 'ghostEnabled', true));
        controls.push((x, y) => this.makeToggle(x, y, 'Spikes', 'modeSpikes', false));
        controls.push((x, y) => this.makeToggle(x, y, 'Teleport', 'modeTeleport', false));
        controls.push((x, y) => this.makeToggle(x, y, 'Color Shuffle', 'modeColorShuffle', false));

        // ---- Flow the controls into 1 (portrait) or 2 (landscape) columns ----
        const numCols = portrait ? 1 : 2;
        const top = titleY + (portrait ? 34 : 46);
        const bottom = h - (portrait ? 128 : 104);
        const perCol = Math.ceil(controls.length / numCols);
        const rowH = Math.min(portrait ? 52 : 54, (bottom - top) / perCol);
        controls.forEach((build, idx) => {
            const col = Math.floor(idx / perCol);
            const rowInCol = idx % perCol;
            const x = numCols === 1 ? cx : (col === 0 ? Math.round(w * 0.27) : Math.round(w * 0.73));
            const y = Math.round(top + rowInCol * rowH + rowH / 2);
            build(x, y);
        });

        // ---- Clear + Back ----
        const clearY = h - (portrait ? 86 : 66);
        const backY = h - (portrait ? 38 : 30);

        const clearBtn = this.add.text(cx, clearY, 'Clear High Scores', {
            fontFamily: 'Arial Black', fontSize: portrait ? 20 : 24, color: '#ff8888',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setInteractive();
        clearBtn.on('pointerdown', () => {
            clearHighScores();
            safeRemoveItem('highScore');
            safeRemoveItem('snakeGhost');
            clearBtn.setText('Cleared ✓');
            this.time.delayedCall(1200, () => clearBtn.setText('Clear High Scores'));
        });

        this.add.text(cx, backY, 'Back', {
            fontFamily: 'Arial Black', fontSize: portrait ? 28 : 34, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => this.scene.start('TitleScreen'));
    }

    makeToggle(x, y, label, key, defaultOn) {
        const stored = safeGetItem(key);
        let on = stored === null ? !!defaultOn : stored === 'true';
        const t = this.add.text(x, y, `${label}: ${on ? 'ON' : 'OFF'}`, {
            fontFamily: 'Arial Black', fontSize: this.fs, align: 'center'
        }).setOrigin(0.5).setInteractive();
        t.setColor(on ? '#00ff00' : '#888888');
        t.on('pointerdown', () => {
            on = !on;
            safeSetItem(key, on);
            t.setText(`${label}: ${on ? 'ON' : 'OFF'}`);
            t.setColor(on ? '#00ff00' : '#888888');
        });
        return t;
    }

    // A single tappable "Label: Value" line that cycles. colorFn (optional)
    // tints the line to reflect the current value (used by the color picker).
    makeCycle(x, y, label, getText, onTap, colorFn) {
        const t = this.add.text(x, y, `${label}: ${getText()}`, {
            fontFamily: 'Arial Black', fontSize: this.fs, color: '#ffcc66', align: 'center'
        }).setOrigin(0.5).setInteractive();
        if (colorFn) t.setColor(colorFn());
        t.on('pointerdown', () => {
            const v = onTap();
            t.setText(`${label}: ${v}`);
            if (colorFn) t.setColor(colorFn());
        });
        return t;
    }

    // "Label: N" with ‹ › steppers on the same line.
    makeStepper(x, y, label, key, def, min, max) {
        let val = parseInt(safeGetItem(key)) || def;
        val = Math.min(max, Math.max(min, val));
        const mid = this.add.text(x, y, `${label}: ${val}`, {
            fontFamily: 'Arial Black', fontSize: this.fs, color: '#ffff00', align: 'center'
        }).setOrigin(0.5);
        const half = mid.width / 2;
        const dec = this.add.text(x - half - 24, y, '‹', {
            fontFamily: 'Arial Black', fontSize: this.fs + 10, color: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        const inc = this.add.text(x + half + 24, y, '›', {
            fontFamily: 'Arial Black', fontSize: this.fs + 10, color: '#ffffff'
        }).setOrigin(0.5).setInteractive();
        dec.on('pointerdown', () => { if (val > min) { val--; safeSetItem(key, val); mid.setText(`${label}: ${val}`); } });
        inc.on('pointerdown', () => { if (val < max) { val++; safeSetItem(key, val); mid.setText(`${label}: ${val}`); } });
        return mid;
    }
}
