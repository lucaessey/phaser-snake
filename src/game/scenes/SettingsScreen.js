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
        const cx = w / 2;
        const cxL = Math.round(w * 0.27);   // left column (gameplay)
        const cxR = Math.round(w * 0.72);   // right column (opponent & modes)

        this.add.rectangle(0, 0, w, this.cameras.main.height, 0x000000, 0.85).setOrigin(0, 0);

        this.add.text(cx, 40, 'Settings', {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        // ===================== Left column: gameplay =====================

        // --- Snake speed (1 to 20 tiles per second) ---
        let currentSpeed = parseInt(safeGetItem('snakeSpeed')) || 5;

        this.add.text(cxL, 110, 'Snake Speed (Tiles/sec)', {
            fontFamily: 'Arial', fontSize: 22, color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        const speedValueText = this.add.text(cxL, 148, currentSpeed.toString(), {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffff00', align: 'center'
        }).setOrigin(0.5);

        this.add.text(cxL - 90, 148, '<', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff', align: 'center'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            if (currentSpeed > 1) {
                currentSpeed--;
                speedValueText.setText(currentSpeed.toString());
                safeSetItem('snakeSpeed', currentSpeed);
            }
        });

        this.add.text(cxL + 90, 148, '>', {
            fontFamily: 'Arial Black', fontSize: 36, color: '#ffffff', align: 'center'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            if (currentSpeed < 20) {
                currentSpeed++;
                speedValueText.setText(currentSpeed.toString());
                safeSetItem('snakeSpeed', currentSpeed);
            }
        });

        // --- Food type (tap to cycle) ---
        let currentFood = safeGetItem('foodType') || 'apple';
        const foodOptions = ['apple', 'banana', 'eggplant', 'jerry', 'sushi'];
        const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        this.add.text(cxL, 210, 'Food Type', {
            fontFamily: 'Arial', fontSize: 22, color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        const foodValueText = this.add.text(cxL, 245, label(currentFood), {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffff00', align: 'center'
        }).setOrigin(0.5).setInteractive();

        foodValueText.on('pointerdown', () => {
            const idx = (foodOptions.indexOf(currentFood) + 1) % foodOptions.length;
            currentFood = foodOptions[idx];
            foodValueText.setText(label(currentFood));
            safeSetItem('foodType', currentFood);
        });

        // --- Snake color (tap to cycle) ---
        let colorIndex = parseInt(safeGetItem('snakeColorIndex')) || 0;
        const cssColor = (tint) => '#' + tint.toString(16).padStart(6, '0');

        this.add.text(cxL, 305, 'Snake Color', {
            fontFamily: 'Arial', fontSize: 22, color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        const colorValueText = this.add.text(cxL, 340, SNAKE_COLORS[colorIndex].name, {
            fontFamily: 'Arial Black', fontSize: 30, color: cssColor(SNAKE_COLORS[colorIndex].tint), align: 'center'
        }).setOrigin(0.5).setInteractive();

        colorValueText.on('pointerdown', () => {
            colorIndex = (colorIndex + 1) % SNAKE_COLORS.length;
            colorValueText.setText(SNAKE_COLORS[colorIndex].name);
            colorValueText.setColor(cssColor(SNAKE_COLORS[colorIndex].tint));
            safeSetItem('snakeColorIndex', colorIndex);
        });

        // --- Grid size (tap to cycle) ---
        let gridIdx = GRID_SIZES.findIndex(g => g.tile === parseInt(safeGetItem('gridTileSize')));
        if (gridIdx < 0) gridIdx = GRID_SIZES.findIndex(g => g.tile === 32);

        this.add.text(cxL, 395, 'Grid Size', {
            fontFamily: 'Arial', fontSize: 22, color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        const gridValueText = this.add.text(cxL, 430, GRID_SIZES[gridIdx].name, {
            fontFamily: 'Arial Black', fontSize: 30, color: '#66f0e0', align: 'center'
        }).setOrigin(0.5).setInteractive();

        gridValueText.on('pointerdown', () => {
            gridIdx = (gridIdx + 1) % GRID_SIZES.length;
            gridValueText.setText(GRID_SIZES[gridIdx].name);
            safeSetItem('gridTileSize', GRID_SIZES[gridIdx].tile);
        });

        // ================= Right column: opponent & modes =================

        this.makeToggle(cxR, 112, 'AI Opponent', 'rivalEnabled', true);

        // --- AI difficulty (tap to cycle) ---
        let diffKey = safeGetItem('rivalDifficulty') || 'medium';
        if (!RIVAL_DIFFICULTY[diffKey]) diffKey = 'medium';

        const diffText = this.add.text(cxR, 156, 'Difficulty: ' + RIVAL_DIFFICULTY[diffKey].name, {
            fontFamily: 'Arial Black', fontSize: 26, color: '#ffcc66', align: 'center'
        }).setOrigin(0.5).setInteractive();

        diffText.on('pointerdown', () => {
            const order = RIVAL_DIFFICULTY_ORDER;
            diffKey = order[(order.indexOf(diffKey) + 1) % order.length];
            diffText.setText('Difficulty: ' + RIVAL_DIFFICULTY[diffKey].name);
            safeSetItem('rivalDifficulty', diffKey);
        });

        this.makeToggle(cxR, 208, 'Ghost (Best Run)', 'ghostEnabled', true);

        // --- Modes ---
        this.add.text(cxR, 262, 'Modes', {
            fontFamily: 'Arial', fontSize: 22, color: '#aaaaaa', align: 'center'
        }).setOrigin(0.5);

        this.makeToggle(cxR, 300, 'Spikes', 'modeSpikes', false);
        this.makeToggle(cxR, 338, 'Teleport on Eat', 'modeTeleport', false);
        this.makeToggle(cxR, 376, 'Color Shuffle', 'modeColorShuffle', false);

        // --- Snake skin (tap to cycle) ---
        let skinIdx = SKINS.findIndex(s => s.id === safeGetItem('snakeSkin'));
        if (skinIdx < 0) skinIdx = 0;

        this.add.text(cxR, 410, 'Skin', {
            fontFamily: 'Arial', fontSize: 20, color: '#aaaaaa', align: 'center'
        }).setOrigin(0.5);

        const skinValue = this.add.text(cxR, 440, SKINS[skinIdx].name, {
            fontFamily: 'Arial Black', fontSize: 22, color: '#d2a75e', align: 'center'
        }).setOrigin(0.5).setInteractive();

        skinValue.on('pointerdown', () => {
            skinIdx = (skinIdx + 1) % SKINS.length;
            skinValue.setText(SKINS[skinIdx].name);
            safeSetItem('snakeSkin', SKINS[skinIdx].id);
        });

        // ===================== Bottom: data + back =====================

        const clearBtn = this.add.text(cx, 470, 'Clear High Scores', {
            fontFamily: 'Arial Black', fontSize: 26, color: '#ff8888',
            stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5).setInteractive();

        clearBtn.on('pointerdown', () => {
            clearHighScores();            // all per-setup high scores
            safeRemoveItem('highScore');  // legacy single-score key
            safeRemoveItem('snakeGhost'); // best-run ghost recording
            clearBtn.setText('Cleared ✓');
            this.time.delayedCall(1200, () => clearBtn.setText('Clear High Scores'));
        });

        this.add.text(cx, 560, 'Back', {
            fontFamily: 'Arial Black', fontSize: 34, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('TitleScreen');
        });
    }

    // On/off toggle bound to a localStorage key. defaultOn controls the value
    // shown when the key has never been set.
    makeToggle(x, y, label, storageKey, defaultOn) {
        const stored = safeGetItem(storageKey);
        let on = stored === null ? !!defaultOn : stored === 'true';

        const text = this.add.text(x, y, `${label}: ${on ? 'ON' : 'OFF'}`, {
            fontFamily: 'Arial Black', fontSize: 26, align: 'center'
        }).setOrigin(0.5).setInteractive();
        text.setColor(on ? '#00ff00' : '#888888');

        text.on('pointerdown', () => {
            on = !on;
            safeSetItem(storageKey, on);
            text.setText(`${label}: ${on ? 'ON' : 'OFF'}`);
            text.setColor(on ? '#00ff00' : '#888888');
        });

        return text;
    }
}
