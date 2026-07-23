import { Scene } from 'phaser';
import { Snake, SNAKE_COLORS } from '../Snake';
import { chooseRivalDirection, RIVAL_DIFFICULTY } from '../rivalAI';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../storage';
import { getHighScore, saveHighScore } from '../highscores';
import { currentLayout } from '../layout';
import { swipeToDirection } from '../input';

// Grid tile size (in pixels). Computed each game from the device size and the
// chosen grid density (see layout.js) so the grid fills any screen cleanly.
let TILE_SIZE = 32;

// Selectable grid densities. 'auto' adapts to the device (chunkier on phones);
// the named sizes are relative densities. The pixel tile is derived per screen.
export const GRID_SIZES = [
    { id: 'auto', name: 'Auto' },
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
];

// Selectable snake skins. 'classic' uses the loaded PNG sprites; other skins
// generate their own texture set at runtime (see createSkinTextures).
export const SKINS = [
    { id: 'classic', name: 'Classic' },
    { id: 'ttt', name: 'Tung Tung Sahur' },
    { id: 'black', name: 'Black 6/7' },
    { id: 'brainrot', name: 'Numbers' },
    { id: 'slime', name: 'Slime' },
    { id: 'pixel', name: 'Pixel 8-bit' }
];

// The 'brainrot' skin puts one of these character images on each white block,
// chosen at random per block. Drop the PNGs in public/assets/ with these names;
// until then each block shows a numbered placeholder tile.
const BRAINROT_IMAGES = ['brainrot_1', 'brainrot_2', 'brainrot_3', 'brainrot_4', 'brainrot_5'];

// Rival tuning
const RIVAL_TINT = 0xff2fd0;          // magenta — distinct from the player palette
const RIVAL_START_LENGTH = 3;
const RIVAL_RESPAWN_MS = 5000;        // delay before a new rival spawns

// Ghost (best-run replay) tuning
const GHOST_KEY = 'snakeGhost';
const GHOST_VERSION = 1;               // bump to invalidate incompatible recordings
const GHOST_MAX_TICKS = 5000;          // cap on recorded ticks
const GHOST_EXPIRE_WARN = 40;          // ticks-remaining threshold for the HUD warning

// Checkerboard palettes the Color Shuffle mode picks from on each apple
const BOARD_COLORS = [
    0x4caf50, 0x388e3c, 0x2196f3, 0x1565c0,
    0xff9800, 0xef6c00, 0x9c27b0, 0x6a1b9a,
    0xf44336, 0x00bcd4, 0x795548, 0x607d8b
];

const FOOD_TYPES = ['apple', 'banana', 'eggplant', 'jerry', 'sushi'];

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload() {
        this.load.image('head_up', 'assets/head_up.png');
        this.load.image('head_down', 'assets/head_down.png');
        this.load.image('head_left', 'assets/head_left.png');
        this.load.image('head_right', 'assets/head_right.png');
        this.load.image('body_vertical', 'assets/body_vertical.png');
        this.load.image('body_horizontal', 'assets/body_horizontal.png');
        this.load.image('body_topleft', 'assets/body_topleft.png');
        this.load.image('body_topright', 'assets/body_topright.png');
        this.load.image('body_bottomleft', 'assets/body_bottomleft.png');
        this.load.image('body_bottomright', 'assets/body_bottomright.png');
        this.load.image('tail_up', 'assets/tail_up.png');
        this.load.image('tail_down', 'assets/tail_down.png');
        this.load.image('tail_left', 'assets/tail_left.png');
        this.load.image('tail_right', 'assets/tail_right.png');
        this.load.image('apple', 'assets/apple.png');
        this.load.image('banana', 'assets/Banana.png');
        this.load.image('eggplant', 'assets/Eggplant.png');
        this.load.image('jerry', 'assets/Jerry.png');
        this.load.image('sushi', 'assets/Sushi.png');

        // Brainrot skin images (optional). Missing files just fall back to
        // numbered placeholder tiles; ignore load errors for them.
        if (safeGetItem('snakeSkin') === 'brainrot') {
            this.load.once('loaderror', () => {}); // keep console from erroring out the boot
            BRAINROT_IMAGES.forEach(key => this.load.image(key, `assets/${key}.png`));
        }
    }

    create ()
    {
        // --- Responsive grid --- size the canvas to the device and derive the
        // tile size, before anything reads TILE_SIZE.
        const layout = currentLayout();
        if (this.scale.width !== layout.width || this.scale.height !== layout.height) {
            this.scale.setGameSize(layout.width, layout.height);
        }
        TILE_SIZE = layout.tile;

        // --- Feature flags (one place; each independently toggleable) ---
        // Default ON; disabled only when explicitly stored as 'false'.
        this.rivalEnabled = safeGetItem('rivalEnabled') !== 'false';
        this.ghostEnabled = safeGetItem('ghostEnabled') !== 'false';

        // Mode toggles (independent — any combination can be on)
        this.modeSpikes = localStorage.getItem('modeSpikes') === 'true';
        this.modeTeleport = localStorage.getItem('modeTeleport') === 'true';
        this.modeColorShuffle = localStorage.getItem('modeColorShuffle') === 'true';
        this.spikes = [];

        // Player skin (cosmetic; rival always uses the classic set).
        this.playerSkin = SKINS.some(s => s.id === safeGetItem('snakeSkin'))
            ? safeGetItem('snakeSkin') : 'classic';

        // Rival state
        this.rival = null;
        this.rivalSpawnLength = RIVAL_START_LENGTH;  // grows by 1 each spawn
        this.rivalDifficultyKey = safeGetItem('rivalDifficulty') || 'medium';
        if (!RIVAL_DIFFICULTY[this.rivalDifficultyKey]) {
            this.rivalDifficultyKey = 'medium';
        }
        // The rival runs on its own movement clock so it can be faster than the
        // player (the main difficulty lever). speedFactor comes from the tier.
        this.rivalSpeedFactor = RIVAL_DIFFICULTY[this.rivalDifficultyKey].speedFactor || 1;
        this.rivalMoveAccum = 0;

        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });

        // High score is per-setup (see buildConfig). The in-game readout shows a
        // crown + the best for THIS exact configuration.
        this.config = this.buildConfig();
        this.highScore = getHighScore(this.config.key);
        this.highScoreText = this.add.text(this.cameras.main.width - 20, 10, `👑 ${this.highScore}`, {
            fontFamily: 'Arial', fontSize: 24, color: '#ffd700', align: 'right'
        }).setOrigin(1, 0);

        // Ghost (best-run replay). Recording always happens so a new best can be
        // saved; playback/collision only run when the ghost is enabled.
        this.initialHighScore = this.highScore;      // beat THIS to save a new ghost
        this.ghostRecording = [];                    // this run's per-tick body cells
        this.ghostTruncated = false;
        this.ghostFrames = this.ghostEnabled ? this.loadGhost() : null;
        this.ghostIndex = 0;
        this.currentGhostCells = [];
        this.ghostGraphics = this.add.graphics().setDepth(1);
        this.ghostText = this.add.text(this.cameras.main.width / 2, 12, '', {
            fontFamily: 'Arial', fontSize: 18, color: '#cfefff'
        }).setOrigin(0.5, 0).setDepth(5);

        this.boardGraphics = this.add.graphics();
        this.drawBoard(0x4caf50, 0x388e3c);

        this.walls = this.physics.add.staticGroup();

        const topWallY = 2 * TILE_SIZE;

        // Top wall
        this.walls.create(0, topWallY, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, TILE_SIZE).refreshBody();
        // Bottom wall
        this.walls.create(0, this.cameras.main.height - TILE_SIZE, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, TILE_SIZE).refreshBody();
        // Left wall
        this.walls.create(0, topWallY, null).setOrigin(0, 0).setDisplaySize(TILE_SIZE, this.cameras.main.height - topWallY).refreshBody();
        // Right wall
        this.walls.create(this.cameras.main.width - TILE_SIZE, topWallY, null).setOrigin(0, 0).setDisplaySize(TILE_SIZE, this.cameras.main.height - topWallY).refreshBody();

        // The player fires the single game tick that drives everything else.
        // Start near the middle of the playfield so it fits any grid size.
        if (this.playerSkin !== 'classic') {
            this.createSkinTextures(this.playerSkin);
        }
        const pb = this.playBounds();
        this.snake = new Snake(this, TILE_SIZE, {
            onTick: () => this.onGameTick(),
            skin: this.playerSkin,
            startCol: Math.floor((pb.xMin + pb.xMax) / 2),
            startRow: Math.floor((pb.yMin + pb.yMax) / 2),
            direction: 'right'
        });

        this.physics.add.collider(this.snake.getHead(), this.walls, () => {
            this.snake.dead = true;
        });

        const foodType = localStorage.getItem('foodType') || 'apple';
        this.apple = this.add.sprite(0, 0, foodType);
        this.apple.setDisplaySize(TILE_SIZE, TILE_SIZE);
        this.spawnApple();

        // Spikes mode: start with a few, add one per apple (see eatApple)
        if (this.modeSpikes) {
            this.createSpikeTexture();
            for (let i = 0; i < 3; i++) {
                this.addSpike();
            }
        }

        // Rival snake
        if (this.rivalEnabled) {
            this.createRivalMarkerTexture();
            this.spawnRival();
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.setupSwipeInput();
    }

    // Touch/mouse swipe -> change direction (works alongside the keyboard).
    setupSwipeInput() {
        // Threshold scales a little with tile size so it feels right on any grid.
        const minSwipe = Math.max(20, TILE_SIZE * 0.6);
        this.input.on('pointerdown', (p) => {
            this.swipeStart = { x: p.x, y: p.y };
        });
        this.input.on('pointerup', (p) => {
            if (!this.swipeStart) return;
            const dir = swipeToDirection(p.x - this.swipeStart.x, p.y - this.swipeStart.y, minSwipe);
            this.swipeStart = null;
            if (dir && this.snake && !this.snake.dead) {
                this.snake.changeDirection(dir);
            }
        });
    }

    drawBoard(colorA, colorB) {
        const g = this.boardGraphics;
        g.clear();

        const cols = this.cameras.main.width / TILE_SIZE;
        const rows = this.cameras.main.height / TILE_SIZE;

        for (let row = 3; row < rows - 1; row++) {
            for (let col = 1; col < cols - 1; col++) {
                g.fillStyle((row + col) % 2 === 0 ? colorA : colorB, 1);
                g.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    createSpikeTexture() {
        // Key includes the tile size so each grid size gets a crisp texture.
        this.spikeKey = `spike_${TILE_SIZE}`;
        if (this.textures.exists(this.spikeKey)) {
            return;
        }

        const g = this.make.graphics({ x: 0, y: 0 }, false);

        // Metallic spike triangle filling the tile
        g.fillStyle(0x9e9e9e, 1);
        g.beginPath();
        g.moveTo(TILE_SIZE / 2, 3);
        g.lineTo(TILE_SIZE - 4, TILE_SIZE - 4);
        g.lineTo(4, TILE_SIZE - 4);
        g.closePath();
        g.fillPath();

        // Lighter highlight down the middle
        g.fillStyle(0xd6d6d6, 1);
        g.beginPath();
        g.moveTo(TILE_SIZE / 2, 3);
        g.lineTo(TILE_SIZE / 2 + 3, TILE_SIZE / 2);
        g.lineTo(TILE_SIZE / 2 - 3, TILE_SIZE / 2);
        g.closePath();
        g.fillPath();

        g.lineStyle(2, 0x424242, 1);
        g.beginPath();
        g.moveTo(TILE_SIZE / 2, 3);
        g.lineTo(TILE_SIZE - 4, TILE_SIZE - 4);
        g.lineTo(4, TILE_SIZE - 4);
        g.closePath();
        g.strokePath();

        g.generateTexture(this.spikeKey, TILE_SIZE, TILE_SIZE);
        g.destroy();
    }

    spawnApple() {
        const xMin = 1;
        const xMax = (this.cameras.main.width / TILE_SIZE) - 2;
        const yMin = 3;
        const yMax = (this.cameras.main.height / TILE_SIZE) - 2;

        // Grid cells currently occupied by a snake or spikes
        const occupied = new Set();
        this.snake.gridCoords.forEach(coord => {
            const col = Math.floor(coord.x / TILE_SIZE);
            const row = Math.floor(coord.y / TILE_SIZE);
            occupied.add(`${col},${row}`);
        });
        this.spikes.forEach(spike => occupied.add(`${spike.col},${spike.row}`));
        if (this.rival) {
            this.rival.gridCoords.forEach(coord => occupied.add(this.cellKey(coord)));
        }

        // Only spawn on free cells so food never lands on a snake or a spike
        const freeCells = [];
        for (let col = xMin; col <= xMax; col++) {
            for (let row = yMin; row <= yMax; row++) {
                if (!occupied.has(`${col},${row}`)) {
                    freeCells.push({ col, row });
                }
            }
        }

        if (freeCells.length === 0) {
            return; // Board is full — nowhere left to place food
        }

        const cell = Phaser.Utils.Array.GetRandom(freeCells);
        const x = cell.col * TILE_SIZE + TILE_SIZE / 2;
        const y = cell.row * TILE_SIZE + TILE_SIZE / 2;

        this.apple.setPosition(x, y);
    }

    addSpike() {
        const cols = this.cameras.main.width / TILE_SIZE;
        const rows = this.cameras.main.height / TILE_SIZE;
        const xMin = 1;
        const xMax = cols - 2;
        const yMin = 3;
        const yMax = rows - 2;

        // Avoid the snake, existing spikes, and the current apple
        const occupied = new Set();
        this.snake.gridCoords.forEach(coord => {
            occupied.add(`${Math.floor(coord.x / TILE_SIZE)},${Math.floor(coord.y / TILE_SIZE)}`);
        });
        this.spikes.forEach(spike => occupied.add(`${spike.col},${spike.row}`));
        occupied.add(`${Math.floor(this.apple.x / TILE_SIZE)},${Math.floor(this.apple.y / TILE_SIZE)}`);

        const freeCells = [];
        for (let col = xMin; col <= xMax; col++) {
            for (let row = yMin; row <= yMax; row++) {
                if (!occupied.has(`${col},${row}`)) {
                    freeCells.push({ col, row });
                }
            }
        }

        if (freeCells.length === 0) {
            return;
        }

        const cell = Phaser.Utils.Array.GetRandom(freeCells);
        const sprite = this.add.image(
            cell.col * TILE_SIZE + TILE_SIZE / 2,
            cell.row * TILE_SIZE + TILE_SIZE / 2,
            this.spikeKey
        ).setDisplaySize(TILE_SIZE, TILE_SIZE).setDepth(1);

        this.spikes.push({ col: cell.col, row: cell.row, sprite });
    }

    teleportSnake() {
        const placement = this.findSnakePlacement(this.snake.gridCoords.length);
        if (placement) {
            this.snake.relocate(placement.cells, placement.direction);
        }
    }

    findSnakePlacement(length) {
        const cols = this.cameras.main.width / TILE_SIZE;
        const rows = this.cameras.main.height / TILE_SIZE;
        const xMin = 1;
        const xMax = cols - 2;
        const yMin = 3;
        const yMax = rows - 2;

        // Cells the snake must not be placed on
        const blocked = new Set();
        this.spikes.forEach(spike => blocked.add(`${spike.col},${spike.row}`));
        blocked.add(`${Math.floor(this.apple.x / TILE_SIZE)},${Math.floor(this.apple.y / TILE_SIZE)}`);
        if (this.rival) {
            this.rival.gridCoords.forEach(coord => blocked.add(this.cellKey(coord)));
        }

        // dc/dr: offset from head to each trailing body cell.
        // fc/fr: the cell directly ahead of the head (kept clear so the
        //        snake doesn't teleport into an instant death).
        const dirs = [
            { name: 'right', dc: -1, dr: 0, fc: 1, fr: 0 },
            { name: 'left',  dc: 1,  dr: 0, fc: -1, fr: 0 },
            { name: 'down',  dc: 0,  dr: -1, fc: 0, fr: 1 },
            { name: 'up',    dc: 0,  dr: 1, fc: 0, fr: -1 }
        ];

        const inBounds = (col, row) => col >= xMin && col <= xMax && row >= yMin && row <= yMax;

        for (let attempt = 0; attempt < 200; attempt++) {
            const dir = Phaser.Utils.Array.GetRandom(dirs);
            const headCol = Phaser.Math.Between(xMin, xMax);
            const headRow = Phaser.Math.Between(yMin, yMax);

            // The cell ahead of the head must be safe
            if (!inBounds(headCol + dir.fc, headRow + dir.fr) ||
                blocked.has(`${headCol + dir.fc},${headRow + dir.fr}`)) {
                continue;
            }

            const cells = [];
            let ok = true;
            for (let i = 0; i < length; i++) {
                const col = headCol + dir.dc * i;
                const row = headRow + dir.dr * i;
                if (!inBounds(col, row) || blocked.has(`${col},${row}`)) {
                    ok = false;
                    break;
                }
                cells.push({ x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 });
            }

            if (ok) {
                return { cells, direction: dir.name };
            }
        }

        return null; // No valid spot found — leave the snake where it is
    }

    shuffleColors() {
        // Board: two distinct random colors
        const colorA = Phaser.Utils.Array.GetRandom(BOARD_COLORS);
        let colorB = Phaser.Utils.Array.GetRandom(BOARD_COLORS);
        while (colorB === colorA) {
            colorB = Phaser.Utils.Array.GetRandom(BOARD_COLORS);
        }
        this.drawBoard(colorA, colorB);

        // Apple: change its look
        const food = Phaser.Utils.Array.GetRandom(FOOD_TYPES);
        this.apple.setTexture(food);
        this.apple.setDisplaySize(TILE_SIZE, TILE_SIZE);

        // Snake: recolor (skip index 0 so it's always a visible color)
        const snakeTint = SNAKE_COLORS[Phaser.Math.Between(1, SNAKE_COLORS.length - 1)].tint;
        this.snake.setColor(snakeTint);
    }

    addScore(points) {
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText('👑 ' + this.highScore);
            saveHighScore(this.config.key, this.config.label, this.highScore);
        }
    }

    // Builds the canonical key + human label identifying this exact setup, so
    // each distinct configuration keeps its own high score. Every gameplay
    // setting participates, including snake speed.
    buildConfig() {
        const gridId = safeGetItem('gridSize') || 'auto';
        const gridEntry = GRID_SIZES.find(g => g.id === gridId) || GRID_SIZES[0];
        const gridName = gridEntry.name;
        const speed = parseInt(safeGetItem('snakeSpeed')) || 5;
        const ai = this.rivalEnabled;
        const diffName = (RIVAL_DIFFICULTY[this.rivalDifficultyKey] || {}).name || this.rivalDifficultyKey;

        const key = [
            `grid:${gridId}`,
            `speed:${speed}`,
            `ai:${ai ? this.rivalDifficultyKey : 'off'}`,
            `ghost:${this.ghostEnabled ? 1 : 0}`,
            `spikes:${this.modeSpikes ? 1 : 0}`,
            `teleport:${this.modeTeleport ? 1 : 0}`,
            `color:${this.modeColorShuffle ? 1 : 0}`
        ].join('|');

        const parts = [`${gridName} grid`, `Speed ${speed}`];
        if (ai) parts.push(`AI (${diffName})`);
        if (this.ghostEnabled) parts.push('Ghost');
        if (this.modeSpikes) parts.push('Spikes');
        if (this.modeTeleport) parts.push('Teleport');
        if (this.modeColorShuffle) parts.push('Color Shuffle');

        return { key, label: parts.join(' · ') };
    }

    eatApple() {
        this.addScore(1);
        this.snake.grow();

        if (this.modeTeleport) {
            this.teleportSnake();
        }
        if (this.modeSpikes) {
            this.addSpike();
        }

        this.spawnApple();

        if (this.modeColorShuffle) {
            this.shuffleColors();
        }
    }

    // --- Grid helpers -------------------------------------------------------

    cellOf(coord) {
        return { col: Math.floor(coord.x / TILE_SIZE), row: Math.floor(coord.y / TILE_SIZE) };
    }

    cellKey(coord) {
        return `${Math.floor(coord.x / TILE_SIZE)},${Math.floor(coord.y / TILE_SIZE)}`;
    }

    playBounds() {
        const cols = this.cameras.main.width / TILE_SIZE;
        const rows = this.cameras.main.height / TILE_SIZE;
        return { xMin: 1, xMax: cols - 2, yMin: 3, yMax: rows - 2 };
    }

    // --- Rival: textures ----------------------------------------------------

    createRivalMarkerTexture() {
        // Key includes the tile size so each grid size gets a crisp marker.
        this.rivalMarkerKey = `rival_marker_${TILE_SIZE}`;
        if (this.textures.exists(this.rivalMarkerKey)) {
            return;
        }
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        const c = TILE_SIZE / 2;
        const r = TILE_SIZE * 0.36;
        const diamond = () => {
            g.beginPath();
            g.moveTo(c, c - r); g.lineTo(c + r, c); g.lineTo(c, c + r); g.lineTo(c - r, c);
            g.closePath();
        };
        // Hollow diamond so the head's eyes still show through: dark backing
        // stroke for contrast on light tiles, bright inner stroke on top.
        g.lineStyle(6, 0x000000, 0.9); diamond(); g.strokePath();
        g.lineStyle(3, 0xffffff, 1);  diamond(); g.strokePath();
        g.generateTexture(this.rivalMarkerKey, TILE_SIZE, TILE_SIZE);
        g.destroy();
    }

    // The 'black' skin: separate black tiles, each with a 7-segment '6' or '7'.
    // Only two textures are needed (the snake alternates between them by index).
    createBlockSkinTextures(skinId) {
        const R = 64;
        const p = `${skinId}_`;
        if (this.textures.exists(p + 'tile_6')) {
            return;
        }

        const m = 6; // gap margin so adjacent blocks are visibly separate
        const drawDigit = (g, d) => {
            g.fillStyle(0xffffff, 1);
            g.fillRect(22, 15, 20, 5);            // top bar (both digits)
            if (d === 7) {
                g.fillRect(37, 15, 5, 34);        // full right side
            } else {                              // 6
                g.fillRect(22, 15, 5, 34);        // full left side
                g.fillRect(22, 29, 20, 5);        // middle bar
                g.fillRect(22, 44, 20, 5);        // bottom bar
                g.fillRect(37, 32, 5, 17);        // bottom-right
            }
        };

        [6, 7].forEach(d => {
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            g.fillStyle(0x141414, 1); g.fillRoundedRect(m, m, R - 2 * m, R - 2 * m, 10);
            g.fillStyle(0x2a2d33, 1); g.fillRect(m + 5, m + 5, R - 2 * m - 10, 4); // top sheen
            g.lineStyle(3, 0x3c3f45, 1); g.strokeRoundedRect(m, m, R - 2 * m, R - 2 * m, 10);
            drawDigit(g, d);
            g.generateTexture(p + 'tile_' + d, R, R);
            g.destroy();
        });
    }

    // The 'brainrot' skin: white tiles, each showing one of the character images
    // (or a numbered placeholder if the image file isn't present yet). Produces
    // one texture per image; the snake assigns them to blocks at random.
    createImageSkinTextures(skinId) {
        const R = 64;
        const p = `${skinId}_`;
        if (this.textures.exists(p + 'tile_0')) {
            return;
        }
        const m = 5;
        // 7-segment digits 1..5 for the placeholders.
        const SEG = {
            a: [22, 15, 20, 5], f: [22, 15, 5, 17], b: [37, 15, 5, 17], g: [22, 29, 20, 5],
            e: [22, 32, 5, 17], c: [37, 32, 5, 17], d: [22, 44, 20, 5]
        };
        const DIGITS = { 1: ['b', 'c'], 2: ['a', 'b', 'g', 'e', 'd'], 3: ['a', 'b', 'g', 'c', 'd'], 4: ['f', 'b', 'g', 'c'], 5: ['a', 'f', 'g', 'c', 'd'] };
        const COLORS = [0xe53935, 0x8e24aa, 0x1e88e5, 0x00897b, 0xf9a825];

        const whiteTile = (g) => {
            g.fillStyle(0xffffff, 1); g.fillRoundedRect(m, m, R - 2 * m, R - 2 * m, 10);
            g.lineStyle(2, 0xcccccc, 1); g.strokeRoundedRect(m, m, R - 2 * m, R - 2 * m, 10);
        };

        for (let i = 0; i < 5; i++) {
            const key = p + 'tile_' + i;
            const imgKey = BRAINROT_IMAGES[i];

            // Real image present -> composite it (fit, centered) onto a white tile.
            if (this.textures.exists(imgKey)) {
                try {
                    const rt = this.make.renderTexture({ x: 0, y: 0, width: R, height: R }, false);
                    const g = this.make.graphics({ x: 0, y: 0 }, false);
                    whiteTile(g);
                    rt.draw(g, 0, 0);
                    g.destroy();
                    const src = this.textures.get(imgKey).getSourceImage();
                    const maxDim = R - 2 * m - 4;
                    const scale = Math.min(maxDim / src.width, maxDim / src.height);
                    const tmp = this.make.image({ x: 0, y: 0, key: imgKey }, false)
                        .setOrigin(0.5).setDisplaySize(src.width * scale, src.height * scale);
                    rt.draw(tmp, R / 2, R / 2);
                    tmp.destroy();
                    rt.saveTexture(key);
                    (this._brainrotRT = this._brainrotRT || []).push(rt); // keep alive
                    continue;
                } catch (e) {
                    // fall through to placeholder
                }
            }

            // Placeholder: white tile + a colored number (i+1).
            const g = this.make.graphics({ x: 0, y: 0 }, false);
            whiteTile(g);
            g.fillStyle(COLORS[i], 1);
            DIGITS[i + 1].forEach(s => g.fillRect(SEG[s][0], SEG[s][1], SEG[s][2], SEG[s][3]));
            g.generateTexture(key, R, R);
            g.destroy();
        }
    }

    // Dispatches to the right code-drawn texture generator for the skin. Each
    // directional generator draws at a fixed 64px reference, scaled per tile.
    createSkinTextures(skinId) {
        if (skinId === 'black') { this.createBlockSkinTextures(skinId); return; }
        if (skinId === 'brainrot') { this.createImageSkinTextures(skinId); return; }
        if (skinId === 'slime') { this.createSlimeSkinTextures(skinId); return; }
        if (skinId === 'pixel') { this.createPixelSkinTextures(skinId); return; }
        this.createWoodSkinTextures(skinId);
    }

    // Tung Tung Sahur — a wooden bat with a face.
    createWoodSkinTextures(skinId) {
        const R = 64;
        const p = `${skinId}_`;
        if (this.textures.exists(p + 'head_right')) {
            return;
        }

        const WOOD = 0xce9e5b, WOOD_MID = 0xb07f3f, WOOD_DARK = 0x7a5127;
        const OUTLINE = 0x4a2f16, HILITE = 0xe8cb92;
        const EYE_W = 0xffffff, EYE_D = 0x161009, BROW = 0x2a1a0c, MOUTH = 0x3a1810;
        const m = 6;

        const g = this.make.graphics({ x: 0, y: 0 }, false);
        const gen = (name) => { g.generateTexture(p + name, R, R); g.clear(); };

        // ---- Straight body (connects the two long edges) ----
        g.fillStyle(OUTLINE, 1); g.fillRect(0, m - 2, R, R - 2 * m + 4);
        g.fillStyle(WOOD, 1);    g.fillRect(0, m, R, R - 2 * m);
        g.fillStyle(HILITE, 1);  g.fillRect(0, m + 3, R, 5);
        g.fillStyle(WOOD_MID, 1);g.fillRect(0, R - m - 8, R, 6);
        g.fillStyle(WOOD_DARK, 1);[9, 22, 35, 48, 58].forEach(x => g.fillRect(x, m + 2, 2, R - 2 * m - 4));
        gen('body_horizontal');

        g.fillStyle(OUTLINE, 1); g.fillRect(m - 2, 0, R - 2 * m + 4, R);
        g.fillStyle(WOOD, 1);    g.fillRect(m, 0, R - 2 * m, R);
        g.fillStyle(HILITE, 1);  g.fillRect(m + 3, 0, 5, R);
        g.fillStyle(WOOD_MID, 1);g.fillRect(R - m - 8, 0, 6, R);
        g.fillStyle(WOOD_DARK, 1);[9, 22, 35, 48, 58].forEach(y => g.fillRect(m + 2, y, R - 2 * m - 4, 2));
        gen('body_vertical');

        // ---- Corners (connect two adjacent edges) ----
        const corner = (leftC, rightC, topC, botC, ox, oy) => {
            g.fillStyle(WOOD, 1);
            g.fillRect(m, m, R - 2 * m, R - 2 * m);
            if (leftC)  g.fillRect(0, m, R / 2, R - 2 * m);
            if (rightC) g.fillRect(R / 2, m, R / 2, R - 2 * m);
            if (topC)   g.fillRect(m, 0, R - 2 * m, R / 2);
            if (botC)   g.fillRect(m, R / 2, R - 2 * m, R / 2);
            g.fillRect(ox, oy, m, m); // close the outer-corner notch
            g.fillStyle(WOOD_DARK, 1);
            g.fillRect(R / 2 - 1, m + 3, 2, R - 2 * m - 6);
            g.fillRect(m + 3, R / 2 - 1, R - 2 * m - 6, 2);
            g.fillStyle(HILITE, 1); g.fillCircle(R / 2, R / 2, 5);
        };
        corner(true, false, false, true, 0, R - m);      gen('body_bottomleft');
        corner(true, false, true, false, 0, 0);          gen('body_topleft');
        corner(false, true, false, true, R - m, R - m);  gen('body_bottomright');
        corner(false, true, true, false, R - m, 0);      gen('body_topright');

        // ---- Head (the bat's face; connects on the back edge) ----
        const face = (fx, fy) => {
            const cx = R / 2, cy = R / 2;
            const sx = -fy, sy = fx; // perpendicular (side) axis
            const eye = (d) => {
                const ex = cx + fx * 8 + sx * 12 * d;
                const ey = cy + fy * 8 + sy * 12 * d;
                g.fillStyle(EYE_W, 1); g.fillCircle(ex, ey, 9);
                g.lineStyle(2, OUTLINE, 1); g.strokeCircle(ex, ey, 9);
                g.fillStyle(EYE_D, 1); g.fillCircle(ex + fx * 3, ey + fy * 3, 4);
                g.lineStyle(5, BROW, 1);
                g.lineBetween(ex + sx * 8 * d + fx * 4, ey + sy * 8 * d + fy * 4,
                              ex - sx * 8 * d + fx * 10, ey - sy * 8 * d + fy * 10);
            };
            eye(1); eye(-1);
            g.fillStyle(MOUTH, 1); g.fillCircle(cx + fx * 16, cy + fy * 16, 6);
        };
        const headH = (s) => {
            if (s > 0) {
                g.fillStyle(OUTLINE, 1); g.fillRoundedRect(0, m - 2, R - 2, R - 2 * m + 4, { tl: 2, bl: 2, tr: 24, br: 24 });
                g.fillStyle(WOOD, 1);    g.fillRoundedRect(0, m, R - 6, R - 2 * m, { tl: 2, bl: 2, tr: 22, br: 22 });
            } else {
                g.fillStyle(OUTLINE, 1); g.fillRoundedRect(2, m - 2, R - 2, R - 2 * m + 4, { tl: 24, bl: 24, tr: 2, br: 2 });
                g.fillStyle(WOOD, 1);    g.fillRoundedRect(6, m, R - 6, R - 2 * m, { tl: 22, bl: 22, tr: 2, br: 2 });
            }
            g.fillStyle(HILITE, 1); g.fillRect(s > 0 ? 4 : 10, m + 3, R - 14, 4);
            face(s, 0);
        };
        const headV = (s) => {
            if (s > 0) {
                g.fillStyle(OUTLINE, 1); g.fillRoundedRect(m - 2, 0, R - 2 * m + 4, R - 2, { tl: 2, tr: 2, bl: 24, br: 24 });
                g.fillStyle(WOOD, 1);    g.fillRoundedRect(m, 0, R - 2 * m, R - 6, { tl: 2, tr: 2, bl: 22, br: 22 });
            } else {
                g.fillStyle(OUTLINE, 1); g.fillRoundedRect(m - 2, 2, R - 2 * m + 4, R - 2, { tl: 24, tr: 24, bl: 2, br: 2 });
                g.fillStyle(WOOD, 1);    g.fillRoundedRect(m, 6, R - 2 * m, R - 6, { tl: 22, tr: 22, bl: 2, br: 2 });
            }
            g.fillStyle(HILITE, 1); g.fillRect(m + 3, s > 0 ? 4 : 10, 4, R - 14);
            face(0, s);
        };
        headH(1);  gen('head_right');
        headH(-1); gen('head_left');
        headV(1);  gen('head_down');
        headV(-1); gen('head_up');

        // ---- Tail (tapers to a point in the named direction) ----
        const tail = (dir) => {
            if (dir === 'left')  { g.fillStyle(OUTLINE, 1); g.fillTriangle(R, m - 2, R, R - m + 2, 1, R / 2);   g.fillStyle(WOOD, 1); g.fillTriangle(R, m + 1, R, R - m - 1, 7, R / 2); }
            if (dir === 'right') { g.fillStyle(OUTLINE, 1); g.fillTriangle(0, m - 2, 0, R - m + 2, R - 1, R / 2); g.fillStyle(WOOD, 1); g.fillTriangle(0, m + 1, 0, R - m - 1, R - 7, R / 2); }
            if (dir === 'up')    { g.fillStyle(OUTLINE, 1); g.fillTriangle(m - 2, R, R - m + 2, R, R / 2, 1);   g.fillStyle(WOOD, 1); g.fillTriangle(m + 1, R, R - m - 1, R, R / 2, 7); }
            if (dir === 'down')  { g.fillStyle(OUTLINE, 1); g.fillTriangle(m - 2, 0, R - m + 2, 0, R / 2, R - 1); g.fillStyle(WOOD, 1); g.fillTriangle(m + 1, 0, R - m - 1, 0, R / 2, R - 7); }
        };
        tail('up');    gen('tail_up');
        tail('down');  gen('tail_down');
        tail('left');  gen('tail_left');
        tail('right'); gen('tail_right');

        g.destroy();
    }

    // Slime — a glossy green blob with a big highlight shine and cute eyes.
    createSlimeSkinTextures(skinId) {
        const R = 64, m = 6, p = `${skinId}_`;
        if (this.textures.exists(p + 'head_right')) {
            return;
        }
        const BODY = 0x37cf4e, EDGE = 0x1c8a30, SHADE = 0x27a83c, SHEEN = 0xc9f7cf, SHINE = 0xffffff;
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        const gen = (n) => { g.generateTexture(p + n, R, R); g.clear(); };

        // ---- straight body ----
        g.fillStyle(EDGE, 1);  g.fillRect(0, m - 2, R, R - 2 * m + 4);
        g.fillStyle(BODY, 1);  g.fillRect(0, m, R, R - 2 * m);
        g.fillStyle(SHADE, 1); g.fillRect(0, R - m - 7, R, 6);
        g.fillStyle(SHEEN, 0.8); g.fillRect(0, m + 3, R, 4);
        g.fillStyle(SHINE, 0.6); g.fillCircle(16, m + 9, 4); g.fillCircle(44, m + 9, 3);
        gen('body_horizontal');

        g.fillStyle(EDGE, 1);  g.fillRect(m - 2, 0, R - 2 * m + 4, R);
        g.fillStyle(BODY, 1);  g.fillRect(m, 0, R - 2 * m, R);
        g.fillStyle(SHADE, 1); g.fillRect(R - m - 7, 0, 6, R);
        g.fillStyle(SHEEN, 0.8); g.fillRect(m + 3, 0, 4, R);
        g.fillStyle(SHINE, 0.6); g.fillCircle(m + 9, 16, 4); g.fillCircle(m + 9, 44, 3);
        gen('body_vertical');

        // ---- corners ----
        const corner = (leftC, rightC, topC, botC, ox, oy) => {
            g.fillStyle(BODY, 1);
            g.fillRect(m, m, R - 2 * m, R - 2 * m);
            if (leftC)  g.fillRect(0, m, R / 2, R - 2 * m);
            if (rightC) g.fillRect(R / 2, m, R / 2, R - 2 * m);
            if (topC)   g.fillRect(m, 0, R - 2 * m, R / 2);
            if (botC)   g.fillRect(m, R / 2, R - 2 * m, R / 2);
            g.fillRect(ox, oy, m, m);
            g.fillStyle(SHINE, 0.5); g.fillCircle(R / 2, R / 2 - 4, 5);
        };
        corner(true, false, false, true, 0, R - m);      gen('body_bottomleft');
        corner(true, false, true, false, 0, 0);          gen('body_topleft');
        corner(false, true, false, true, R - m, R - m);  gen('body_bottomright');
        corner(false, true, true, false, R - m, 0);      gen('body_topright');

        // ---- head (blob + eyes + big shine) ----
        const face = (fx, fy) => {
            const cx = R / 2, cy = R / 2, sx = -fy, sy = fx;
            [1, -1].forEach(d => {
                const ex = cx + fx * 11 + sx * 7 * d, ey = cy + fy * 11 + sy * 7 * d;
                g.fillStyle(0x08320f, 1); g.fillCircle(ex, ey, 4.5);
                g.fillStyle(SHINE, 0.9); g.fillCircle(ex - 1.5, ey - 1.5, 1.6);
            });
            // big glossy highlight (consistent top-left light source)
            g.fillStyle(SHINE, 0.65); g.fillCircle(R * 0.34, R * 0.30, 10);
            g.fillStyle(SHINE, 0.4);  g.fillCircle(R * 0.5, R * 0.42, 5);
        };
        const headH = (s) => {
            g.fillStyle(EDGE, 1);
            if (s > 0) g.fillRoundedRect(0, m - 2, R - 2, R - 2 * m + 4, { tl: 4, bl: 4, tr: 26, br: 26 });
            else       g.fillRoundedRect(2, m - 2, R - 2, R - 2 * m + 4, { tl: 26, bl: 26, tr: 4, br: 4 });
            g.fillStyle(BODY, 1);
            if (s > 0) g.fillRoundedRect(0, m, R - 6, R - 2 * m, { tl: 4, bl: 4, tr: 24, br: 24 });
            else       g.fillRoundedRect(6, m, R - 6, R - 2 * m, { tl: 24, bl: 24, tr: 4, br: 4 });
            face(s, 0);
        };
        const headV = (s) => {
            g.fillStyle(EDGE, 1);
            if (s > 0) g.fillRoundedRect(m - 2, 0, R - 2 * m + 4, R - 2, { tl: 4, tr: 4, bl: 26, br: 26 });
            else       g.fillRoundedRect(m - 2, 2, R - 2 * m + 4, R - 2, { tl: 26, tr: 26, bl: 4, br: 4 });
            g.fillStyle(BODY, 1);
            if (s > 0) g.fillRoundedRect(m, 0, R - 2 * m, R - 6, { tl: 4, tr: 4, bl: 24, br: 24 });
            else       g.fillRoundedRect(m, 6, R - 2 * m, R - 6, { tl: 24, tr: 24, bl: 4, br: 4 });
            face(0, s);
        };
        headH(1);  gen('head_right');
        headH(-1); gen('head_left');
        headV(1);  gen('head_down');
        headV(-1); gen('head_up');

        // ---- tail ----
        const tail = (dir) => {
            g.fillStyle(EDGE, 1);
            if (dir === 'left')  g.fillTriangle(R, m - 2, R, R - m + 2, 2, R / 2);
            if (dir === 'right') g.fillTriangle(0, m - 2, 0, R - m + 2, R - 2, R / 2);
            if (dir === 'up')    g.fillTriangle(m - 2, R, R - m + 2, R, R / 2, 2);
            if (dir === 'down')  g.fillTriangle(m - 2, 0, R - m + 2, 0, R / 2, R - 2);
            g.fillStyle(BODY, 1);
            if (dir === 'left')  g.fillTriangle(R, m + 1, R, R - m - 1, 8, R / 2);
            if (dir === 'right') g.fillTriangle(0, m + 1, 0, R - m - 1, R - 8, R / 2);
            if (dir === 'up')    g.fillTriangle(m + 1, R, R - m - 1, R, R / 2, 8);
            if (dir === 'down')  g.fillTriangle(m + 1, 0, R - m - 1, 0, R / 2, R - 8);
            g.fillStyle(SHINE, 0.5);
            if (dir === 'left' || dir === 'right') g.fillCircle(R / 2, m + 9, 3);
            else g.fillCircle(m + 9, R / 2, 3);
        };
        tail('up');    gen('tail_up');
        tail('down');  gen('tail_down');
        tail('left');  gen('tail_left');
        tail('right'); gen('tail_right');

        g.destroy();
    }

    // Pixel / 8-bit — chunky beveled blocks with a dark outline and pixel eyes.
    createPixelSkinTextures(skinId) {
        const R = 64, m = 4, px = 4, p = `${skinId}_`;
        if (this.textures.exists(p + 'head_right')) {
            return;
        }
        const PIX = 0x7bd332, LT = 0xb6ef6a, DK = 0x3f7f18, OUT = 0x122b06;
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        const gen = (n) => { g.generateTexture(p + n, R, R); g.clear(); };

        // ---- straight body (beveled block) ----
        g.fillStyle(OUT, 1); g.fillRect(0, m - 2, R, R - 2 * m + 4);
        g.fillStyle(PIX, 1); g.fillRect(0, m, R, R - 2 * m);
        g.fillStyle(LT, 1);  g.fillRect(0, m, R, px);
        g.fillStyle(DK, 1);  g.fillRect(0, R - m - px, R, px);
        gen('body_horizontal');

        g.fillStyle(OUT, 1); g.fillRect(m - 2, 0, R - 2 * m + 4, R);
        g.fillStyle(PIX, 1); g.fillRect(m, 0, R - 2 * m, R);
        g.fillStyle(LT, 1);  g.fillRect(m, 0, px, R);
        g.fillStyle(DK, 1);  g.fillRect(R - m - px, 0, px, R);
        gen('body_vertical');

        // ---- corners ----
        const corner = (leftC, rightC, topC, botC, ox, oy) => {
            g.fillStyle(PIX, 1);
            g.fillRect(m, m, R - 2 * m, R - 2 * m);
            if (leftC)  g.fillRect(0, m, R / 2, R - 2 * m);
            if (rightC) g.fillRect(R / 2, m, R / 2, R - 2 * m);
            if (topC)   g.fillRect(m, 0, R - 2 * m, R / 2);
            if (botC)   g.fillRect(m, R / 2, R - 2 * m, R / 2);
            g.fillRect(ox, oy, m, m);
            g.fillStyle(LT, 1);
            if (topC)  g.fillRect(m, 0, R - 2 * m, px);
            if (leftC) g.fillRect(0, m, px, R - 2 * m);
            g.fillStyle(DK, 1);
            if (botC)   g.fillRect(m, R - px, R - 2 * m, px);
            if (rightC) g.fillRect(R - px, m, px, R - 2 * m);
        };
        corner(true, false, false, true, 0, R - m);      gen('body_bottomleft');
        corner(true, false, true, false, 0, 0);          gen('body_topleft');
        corner(false, true, false, true, R - m, R - m);  gen('body_bottomright');
        corner(false, true, true, false, R - m, 0);      gen('body_topright');

        // ---- head (blocky, pixel eyes) ----
        const face = (fx, fy) => {
            const cx = R / 2, cy = R / 2, sx = -fy, sy = fx;
            [1, -1].forEach(d => {
                const ex = Math.round(cx + fx * 12 + sx * 8 * d) - 4;
                const ey = Math.round(cy + fy * 12 + sy * 8 * d) - 4;
                g.fillStyle(OUT, 1); g.fillRect(ex, ey, 8, 8);
                g.fillStyle(0xffffff, 1); g.fillRect(ex + 1, ey + 1, 3, 3);
            });
        };
        const head = (fx, fy) => {
            g.fillStyle(OUT, 1); g.fillRect(m - 2, m - 2, R - 2 * m + 4, R - 2 * m + 4);
            g.fillStyle(PIX, 1); g.fillRect(m, m, R - 2 * m, R - 2 * m);
            g.fillStyle(LT, 1); g.fillRect(m, m, R - 2 * m, px); g.fillRect(m, m, px, R - 2 * m);
            g.fillStyle(DK, 1); g.fillRect(m, R - m - px, R - 2 * m, px); g.fillRect(R - m - px, m, px, R - 2 * m);
            // connect the back edge to the body
            g.fillStyle(PIX, 1);
            if (fx === 1)  g.fillRect(0, m, m, R - 2 * m);
            if (fx === -1) g.fillRect(R - m, m, m, R - 2 * m);
            if (fy === 1)  g.fillRect(m, 0, R - 2 * m, m);
            if (fy === -1) g.fillRect(m, R - m, R - 2 * m, m);
            face(fx, fy);
        };
        head(1, 0);  gen('head_right');
        head(-1, 0); gen('head_left');
        head(0, 1);  gen('head_down');
        head(0, -1); gen('head_up');

        // ---- tail (stepped pixel taper) ----
        const tail = (dir) => {
            g.fillStyle(PIX, 1);
            if (dir === 'right') {
                g.fillRect(0, m, 22, R - 2 * m); g.fillRect(22, m + 8, 16, R - 2 * m - 16); g.fillRect(38, m + 16, 12, R - 2 * m - 32);
            } else if (dir === 'left') {
                g.fillRect(R - 22, m, 22, R - 2 * m); g.fillRect(R - 38, m + 8, 16, R - 2 * m - 16); g.fillRect(R - 50, m + 16, 12, R - 2 * m - 32);
            } else if (dir === 'down') {
                g.fillRect(m, 0, R - 2 * m, 22); g.fillRect(m + 8, 22, R - 2 * m - 16, 16); g.fillRect(m + 16, 38, R - 2 * m - 32, 12);
            } else if (dir === 'up') {
                g.fillRect(m, R - 22, R - 2 * m, 22); g.fillRect(m + 8, R - 38, R - 2 * m - 16, 16); g.fillRect(m + 16, R - 50, R - 2 * m - 32, 12);
            }
        };
        tail('up');    gen('tail_up');
        tail('down');  gen('tail_down');
        tail('left');  gen('tail_left');
        tail('right'); gen('tail_right');

        g.destroy();
    }

    // --- Rival: spawn -------------------------------------------------------

    spawnRival() {
        const length = this.rivalSpawnLength;
        const placement = this.findRivalSpawn(length);
        if (!placement) {
            // No room right now; try again shortly.
            this.time.delayedCall(1000, () => {
                if (this.rivalEnabled && !this.rival) {
                    this.spawnRival();
                }
            });
            return;
        }

        this.rival = new Snake(this, TILE_SIZE, {
            startCol: placement.startCol,
            startRow: placement.startRow,
            direction: placement.direction,
            length,
            color: RIVAL_TINT,
            isRival: true,
            headMarker: this.rivalMarkerKey
        });
        this.rivalMoveAccum = 0;

        // Next rival will be one segment longer than this one.
        this.rivalSpawnLength += 1;
    }

    findRivalSpawn(length) {
        const { xMin, xMax, yMin, yMax } = this.playBounds();

        const blocked = new Set();
        this.snake.gridCoords.forEach(coord => blocked.add(this.cellKey(coord)));
        this.spikes.forEach(spike => blocked.add(`${spike.col},${spike.row}`));
        this.getGhostCells().forEach(c => blocked.add(`${c.col},${c.row}`));
        blocked.add(this.cellKey(this.apple));

        // Spawn on the side opposite the player's head.
        const playerHeadCol = Math.floor(this.snake.gridCoords[0].x / TILE_SIZE);
        const center = (xMin + xMax) / 2;
        const dir = playerHeadCol <= center ? 'left' : 'right';
        const back = dir === 'left' ? { dc: 1, dr: 0 } : { dc: -1, dr: 0 };

        // Candidate head columns near the far edge, working inward.
        const headCols = [];
        if (dir === 'left') {
            for (let col = xMax - (length - 1); col >= Math.floor(center); col--) headCols.push(col);
        } else {
            for (let col = xMin + (length - 1); col <= Math.ceil(center); col++) headCols.push(col);
        }

        // Candidate rows from the middle outward.
        const midRow = Math.floor((yMin + yMax) / 2);
        const rowsOrder = [midRow];
        for (let d = 1; d <= (yMax - yMin); d++) {
            if (midRow - d >= yMin) rowsOrder.push(midRow - d);
            if (midRow + d <= yMax) rowsOrder.push(midRow + d);
        }

        for (const row of rowsOrder) {
            for (const headCol of headCols) {
                let ok = true;
                for (let i = 0; i < length; i++) {
                    const col = headCol + back.dc * i;
                    const r = row + back.dr * i;
                    if (col < xMin || col > xMax || r < yMin || r > yMax || blocked.has(`${col},${r}`)) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    return { startCol: headCol, startRow: row, direction: dir };
                }
            }
        }
        return null;
    }

    // --- Rival: death, respawn ----------------------------------------------

    killRival() {
        if (!this.rival) {
            return;
        }

        // The rival simply vanishes — no corpse, no score.
        this.rival.destroy();
        this.rival = null;

        this.time.delayedCall(RIVAL_RESPAWN_MS, () => {
            if (this.rivalEnabled && !this.rival) {
                this.spawnRival();
            }
        });
    }

    // --- Rival: per-tick AI + collision -------------------------------------

    buildRivalState() {
        return {
            bounds: this.playBounds(),
            food: this.cellOf(this.apple),
            rivalCells: this.rival.gridCoords.map(c => this.cellOf(c)),
            rivalDirection: this.rival.direction,
            playerCells: this.snake.gridCoords.map(c => this.cellOf(c)),
            playerDirection: this.snake.direction,
            ghostCells: this.getGhostCells(),
            spikeCells: this.modeSpikes ? this.spikes.map(s => ({ col: s.col, row: s.row })) : [],
            difficulty: RIVAL_DIFFICULTY[this.rivalDifficultyKey] || RIVAL_DIFFICULTY.medium,
            speedFactor: this.rivalSpeedFactor
        };
    }

    // The ghost's solid cells for the current tick (empty when inactive). The
    // rival AI treats these as blocked, same as any other body.
    getGhostCells() {
        return this.currentGhostCells;
    }

    // Fired once per logical player tick (from Snake.onTick). Handles the
    // player side of the tick: the ghost, player collisions, and food. The
    // rival moves separately on its own clock (see stepRival / update).
    onGameTick() {
        this.advanceGhost();              // sets currentGhostCells for this tick
        this.resolveSnakeCollisions();
        this.resolvePlayerHazards();
        this.resolveGhostCollision();     // ghost is a solid obstacle for the player
        this.resolveFood();
        this.recordTick();                // record the player's body for a future ghost
        this.ghostIndex++;                // consume this tick's ghost frame
    }

    // --- Ghost: load / record / playback ------------------------------------

    loadGhost() {
        const raw = safeGetItem(GHOST_KEY);
        if (!raw) {
            return null;
        }
        try {
            const data = JSON.parse(raw);
            // Discard on a version mismatch, bad shape, or a different grid
            // (cells recorded on another grid size/shape don't line up here).
            const cols = Math.round(this.cameras.main.width / TILE_SIZE);
            const rows = Math.round(this.cameras.main.height / TILE_SIZE);
            if (!data || data.v !== GHOST_VERSION || !Array.isArray(data.frames) ||
                data.tile !== TILE_SIZE || data.cols !== cols || data.rows !== rows) {
                return null;
            }
            return data.frames;
        } catch (e) {
            return null;
        }
    }

    advanceGhost() {
        if (this.ghostEnabled && this.ghostFrames && this.ghostIndex < this.ghostFrames.length) {
            // Frames are stored compactly as [col, row] pairs.
            this.currentGhostCells = this.ghostFrames[this.ghostIndex].map(([col, row]) => ({ col, row }));
        } else {
            this.currentGhostCells = [];
        }
        this.renderGhost();
        this.updateGhostHud();
    }

    renderGhost() {
        const g = this.ghostGraphics;
        g.clear();
        this.currentGhostCells.forEach(c => {
            const x = c.col * TILE_SIZE;
            const y = c.row * TILE_SIZE;
            g.fillStyle(0xbfefff, 0.32);
            g.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            g.lineStyle(2, 0xffffff, 0.55);
            g.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        });
    }

    updateGhostHud() {
        if (this.ghostEnabled && this.ghostFrames && this.ghostIndex < this.ghostFrames.length) {
            const remaining = this.ghostFrames.length - this.ghostIndex;
            this.ghostText.setText('👻 ' + remaining);
            this.ghostText.setColor(remaining <= GHOST_EXPIRE_WARN ? '#ff6b6b' : '#cfefff');
            this.ghostText.setVisible(true);
        } else {
            this.ghostText.setVisible(false);
        }
    }

    resolveGhostCollision() {
        if (this.snake.dead || this.currentGhostCells.length === 0) {
            return;
        }
        const head = this.cellOf(this.snake.gridCoords[0]);
        // Skip index 0 (the ghost's head): matching your own best line — and the
        // shared spawn cells — must never be an unavoidable death.
        for (let i = 1; i < this.currentGhostCells.length; i++) {
            const c = this.currentGhostCells[i];
            if (c.col === head.col && c.row === head.row) {
                this.snake.dead = true;
                return;
            }
        }
    }

    recordTick() {
        if (this.ghostRecording.length >= GHOST_MAX_TICKS) {
            if (!this.ghostTruncated) {
                this.ghostTruncated = true;
                console.warn(`Ghost recording capped at ${GHOST_MAX_TICKS} ticks; the rest of this run is not recorded.`);
            }
            return;
        }
        this.ghostRecording.push(
            this.snake.gridCoords.map(c => [Math.floor(c.x / TILE_SIZE), Math.floor(c.y / TILE_SIZE)])
        );
    }

    saveGhostIfBest() {
        if (this.score > this.initialHighScore && this.ghostRecording.length > 0) {
            const cols = Math.round(this.cameras.main.width / TILE_SIZE);
            const rows = Math.round(this.cameras.main.height / TILE_SIZE);
            const data = JSON.stringify({ v: GHOST_VERSION, tile: TILE_SIZE, cols, rows, score: this.score, frames: this.ghostRecording });
            if (!safeSetItem(GHOST_KEY, data)) {
                console.warn('Ghost: could not save best-run recording (storage unavailable or full).');
            }
        }
    }

    // Advance the rival one cell (on its own clock) and resolve everything that
    // its move can trigger. Called from update() as often as the rival's speed
    // demands, independently of the player's tick.
    stepRival() {
        if (!this.rival || this.rival.dead) {
            return;
        }

        const dir = chooseRivalDirection(this.buildRivalState());
        if (!dir) {
            // Trapped — the rival dies.
            this.killRival();
            return;
        }

        this.rival.nextDirection = dir;
        this.rival.tick();

        // Post-move death checks: self-collision (set inside tick), walls, spikes.
        const head = this.cellOf(this.rival.gridCoords[0]);
        const { xMin, xMax, yMin, yMax } = this.playBounds();
        const outOfBounds = head.col < xMin || head.col > xMax || head.row < yMin || head.row > yMax;
        const onSpike = this.modeSpikes && this.spikes.some(s => s.col === head.col && s.row === head.row);

        if (this.rival.dead || outOfBounds || onSpike) {
            this.killRival();
            return;
        }

        // The rival just moved, so re-check snake-vs-snake and the food race.
        this.resolveSnakeCollisions();
        this.resolveFood();
    }

    resolveSnakeCollisions() {
        if (!this.rival || this.rival.dead || this.snake.dead) {
            return;
        }

        const pHead = this.cellOf(this.snake.gridCoords[0]);
        const rHead = this.cellOf(this.rival.gridCoords[0]);
        const pBody = new Set(this.snake.gridCoords.slice(1).map(c => this.cellKey(c)));
        const rBody = new Set(this.rival.gridCoords.slice(1).map(c => this.cellKey(c)));
        const k = (c) => `${c.col},${c.row}`;

        // 1. Rival head into the player's body -> rival dies (no score).
        if (pBody.has(k(rHead))) {
            this.killRival();
            return;
        }

        // 2. Player head into the rival's body -> player dies.
        if (rBody.has(k(pHead))) {
            this.snake.dead = true;
            return;
        }

        // 3. Both heads in the same cell -> both die.
        if (pHead.col === rHead.col && pHead.row === rHead.row) {
            this.snake.dead = true;
            this.killRival();
        }
    }

    resolvePlayerHazards() {
        if (this.snake.dead || !this.modeSpikes) {
            return;
        }
        const head = this.cellOf(this.snake.gridCoords[0]);
        if (this.spikes.some(s => s.col === head.col && s.row === head.row)) {
            this.snake.dead = true;
        }
    }

    resolveFood() {
        // Player wins the food if its head is on the apple cell.
        if (!this.snake.dead &&
            this.snake.gridCoords[0].x === this.apple.x &&
            this.snake.gridCoords[0].y === this.apple.y) {
            this.eatApple();
        } else if (this.rival && !this.rival.dead &&
            this.rival.gridCoords[0].x === this.apple.x &&
            this.rival.gridCoords[0].y === this.apple.y) {
            // Rival reached it first — it grows, a fresh apple spawns, no score.
            this.rival.grow();
            this.spawnApple();
        }
    }

    gameOver() {
        this.saveGhostIfBest();
        this.scene.start('TitleScreen');
    }

    update(time, delta) {
        if (this.snake.dead) {
            this.gameOver();
            return;
        }

        if (this.cursors.left.isDown) {
            this.snake.changeDirection('left');
        } else if (this.cursors.right.isDown) {
            this.snake.changeDirection('right');
        } else if (this.cursors.up.isDown) {
            this.snake.changeDirection('up');
        } else if (this.cursors.down.isDown) {
            this.snake.changeDirection('down');
        }

        // Advancing the player may fire onGameTick() (ghost, player collisions,
        // food) whenever the player crosses into a new cell.
        this.snake.update(time, delta);

        // Advance the rival on its own (faster) clock. It can take more than one
        // step per player cell, which is what makes the harder tiers threatening.
        if (this.rival && !this.rival.dead) {
            this.rivalMoveAccum += (this.snake.speed * this.rivalSpeedFactor * delta) / 1000;
            let steps = 0;
            while (this.rivalMoveAccum >= TILE_SIZE && steps < 4) {
                this.rivalMoveAccum -= TILE_SIZE;
                this.stepRival();
                steps++;
                if (this.snake.dead || !this.rival || this.rival.dead) {
                    break;
                }
            }
            if (this.rival && !this.rival.dead) {
                this.rival.updateVisuals(this.rivalMoveAccum / TILE_SIZE);
            }
        }
    }
}

