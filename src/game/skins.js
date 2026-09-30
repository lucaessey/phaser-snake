// Selectable snake skins. 'classic' uses the loaded PNG sprites; other skins
// generate their own texture set at runtime (see createSkinTextures).
export const SKINS = [
    {
        "id": "classic",
        "name": "Classic"
    },
    {
        "id": "slime",
        "name": "Slime",
        "unlock": {
            "metric": "totalApples",
            "target": 5,
            "description": "Collect 5 apples across any games.",
            "short": "5 apples total",
            "category": "Collector"
        }
    },
    {
        "id": "black",
        "name": "Black 6/7",
        "unlock": {
            "metric": "bestScore",
            "target": 7,
            "description": "Score 7 in a single game.",
            "short": "Score 7",
            "category": "High score"
        }
    },
    {
        "id": "pixel",
        "name": "Pixel 8-bit",
        "unlock": {
            "metric": "totalApples",
            "target": 15,
            "description": "Collect 15 apples across any games.",
            "short": "15 apples total",
            "category": "Collector"
        }
    },
    {
        "id": "brainrot",
        "name": "Numbers",
        "unlock": {
            "metric": "bestScore",
            "target": 10,
            "description": "Score 10 in a single game.",
            "short": "Score 10",
            "category": "High score"
        }
    },
    {
        "id": "ttt",
        "name": "Tung Tung Sahur",
        "unlock": {
            "metric": "fruitfulRuns",
            "target": 3,
            "description": "Finish 3 games with at least 1 apple in each.",
            "short": "3 fruitful games",
            "category": "Challenge"
        }
    },
    {
        "id": "candy",
        "name": "Candy Cane",
        "unlock": {
            "metric": "totalApples",
            "target": 30,
            "description": "Collect 30 apples across any games.",
            "short": "30 apples total",
            "category": "Collector"
        }
    },
    {
        "id": "watermelon",
        "name": "Watermelon",
        "unlock": {
            "metric": "teleportBest",
            "target": 8,
            "description": "Score 8 in one game with Teleport turned on.",
            "short": "Teleport · Score 8",
            "category": "Challenge"
        }
    },
    {
        "id": "lava",
        "name": "Lava",
        "unlock": {
            "metric": "spikesBest",
            "target": 8,
            "description": "Score 8 in one game with Spikes turned on.",
            "short": "Spikes · Score 8",
            "category": "Challenge"
        }
    },
    {
        "id": "neon",
        "name": "Neon",
        "unlock": {
            "metric": "bestScore",
            "target": 15,
            "description": "Score 15 in a single game.",
            "short": "Score 15",
            "category": "High score"
        }
    },
    {
        "id": "ice",
        "name": "Ice",
        "unlock": {
            "metric": "totalApples",
            "target": 60,
            "description": "Collect 60 apples across any games.",
            "short": "60 apples total",
            "category": "Collector"
        }
    },
    {
        "id": "bee",
        "name": "Bumblebee",
        "unlock": {
            "metric": "speedBest",
            "target": 10,
            "description": "Score 10 in one game at speed 10 or higher.",
            "short": "Speed 10+ · Score 10",
            "category": "Challenge"
        }
    },
    {
        "id": "robot",
        "name": "Robot",
        "unlock": {
            "metric": "hardBest",
            "target": 12,
            "description": "Score 12 with a Hard or Extra Hard AI opponent.",
            "short": "Hard rival · Score 12",
            "category": "Challenge"
        }
    },
    {
        "id": "rainbow",
        "name": "Rainbow",
        "unlock": {
            "metric": "bestScore",
            "target": 20,
            "description": "Score 20 in a single game.",
            "short": "Score 20",
            "category": "High score"
        }
    },
    {
        "id": "bubblegum",
        "name": "Bubblegum",
        "unlock": {
            "metric": "totalApples",
            "target": 100,
            "description": "Collect 100 apples across any games.",
            "short": "100 apples total",
            "category": "Collector"
        }
    },
    {
        "id": "aurora",
        "name": "Aurora",
        "unlock": {
            "metric": "colorBest",
            "target": 12,
            "description": "Score 12 in one game with Color shuffle turned on.",
            "short": "Color shuffle · Score 12",
            "category": "Challenge"
        }
    },
    {
        "id": "tiger",
        "name": "Tiger",
        "unlock": {
            "metric": "bestScore",
            "target": 25,
            "description": "Score 25 in a single game.",
            "short": "Score 25",
            "category": "High score"
        }
    },
    {
        "id": "gold",
        "name": "Gold",
        "unlock": {
            "metric": "totalApples",
            "target": 150,
            "description": "Collect 150 apples across any games.",
            "short": "150 apples total",
            "category": "Collector"
        }
    },
    {
        "id": "circuit",
        "name": "Cyber Circuit",
        "unlock": {
            "metric": "extraHardBest",
            "target": 12,
            "description": "Score 12 with an Extra Hard AI opponent.",
            "short": "Extra Hard · Score 12",
            "category": "Challenge"
        }
    },
    {
        "id": "dragon",
        "name": "Jade Dragon",
        "unlock": {
            "metric": "comboBest",
            "target": 15,
            "description": "Score 15 with both Spikes and Teleport turned on.",
            "short": "Spikes + Teleport · 15",
            "category": "Challenge"
        }
    },
    {
        "id": "galaxy",
        "name": "Galaxy",
        "unlock": {
            "metric": "totalApples",
            "target": 250,
            "description": "Collect 250 apples across any games.",
            "short": "250 apples total",
            "category": "Collector"
        }
    }
];

const FANCY_SKINS = ['neon', 'candy', 'rainbow', 'lava', 'ice', 'gold', 'robot', 'watermelon', 'bee', 'bubblegum', 'aurora', 'tiger', 'circuit', 'dragon', 'galaxy'];

// The 'brainrot' skin puts one of these character images on each white block,
// chosen at random per block. Drop the PNGs in public/assets/ with these names;
// until then each block shows a numbered placeholder tile.
export const BRAINROT_IMAGES = ['brainrot_1', 'brainrot_2', 'brainrot_3', 'brainrot_4', 'brainrot_5'];

class SkinTextureFactory {
    constructor(scene) {
        this.make = scene.make;
        this.textures = scene.textures;
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
                    // A canvas texture can be shared by Phaser and the HTML preview.
                    const texture = this.textures.createCanvas(key, R, R);
                    const context = texture.getContext();
                    context.fillStyle = '#ffffff';
                    context.strokeStyle = '#cccccc';
                    context.lineWidth = 2;
                    context.beginPath();
                    context.roundRect(m, m, R - 2 * m, R - 2 * m, 10);
                    context.fill();
                    context.stroke();
                    const src = this.textures.get(imgKey).getSourceImage();
                    const maxDim = R - 2 * m - 4;
                    const scale = Math.min(maxDim / src.width, maxDim / src.height);
                    const width = src.width * scale, height = src.height * scale;
                    context.drawImage(src, (R - width) / 2, (R - height) / 2, width, height);
                    texture.refresh();
                    continue;
                } catch (e) {
                    this.textures.remove(key);
                    // Fall through to the numbered tile.
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
        if (FANCY_SKINS.includes(skinId)) { this.createFancySkin(skinId); return; }
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

    // ---- Shared building blocks for the "fancy" directional skins ----

    // Solid L-shape that connects two adjacent edges (used for corner tiles).
    _cornerL(g, R, m, color, l, r, t, b, ox, oy) {
        g.fillStyle(color, 1);
        g.fillRect(m, m, R - 2 * m, R - 2 * m);
        if (l) g.fillRect(0, m, R / 2, R - 2 * m);
        if (r) g.fillRect(R / 2, m, R / 2, R - 2 * m);
        if (t) g.fillRect(m, 0, R - 2 * m, R / 2);
        if (b) g.fillRect(m, R / 2, R - 2 * m, R / 2);
        g.fillRect(ox, oy, m, m);
    }

    // Outlined tapered triangle that points in `dir`.
    _tailTri(g, R, m, dir, outline, color) {
        g.fillStyle(outline, 1);
        if (dir === 'left')  g.fillTriangle(R, m - 2, R, R - m + 2, 2, R / 2);
        if (dir === 'right') g.fillTriangle(0, m - 2, 0, R - m + 2, R - 2, R / 2);
        if (dir === 'up')    g.fillTriangle(m - 2, R, R - m + 2, R, R / 2, 2);
        if (dir === 'down')  g.fillTriangle(m - 2, 0, R - m + 2, 0, R / 2, R - 2);
        g.fillStyle(color, 1);
        if (dir === 'left')  g.fillTriangle(R, m + 1, R, R - m - 1, 8, R / 2);
        if (dir === 'right') g.fillTriangle(0, m + 1, 0, R - m - 1, R - 8, R / 2);
        if (dir === 'up')    g.fillTriangle(m + 1, R, R - m - 1, R, R / 2, 8);
        if (dir === 'down')  g.fillTriangle(m + 1, 0, R - m - 1, 0, R / 2, R - 8);
    }

    // Rounded head block that connects on the back edge (front rounded).
    _headShape(g, R, m, fx, fy, fill, outline) {
        if (fx === 1) {
            g.fillStyle(outline, 1); g.fillRoundedRect(0, m - 2, R - 2, R - 2 * m + 4, { tl: 4, bl: 4, tr: 26, br: 26 });
            g.fillStyle(fill, 1);    g.fillRoundedRect(0, m, R - 6, R - 2 * m, { tl: 4, bl: 4, tr: 24, br: 24 });
        } else if (fx === -1) {
            g.fillStyle(outline, 1); g.fillRoundedRect(2, m - 2, R - 2, R - 2 * m + 4, { tl: 26, bl: 26, tr: 4, br: 4 });
            g.fillStyle(fill, 1);    g.fillRoundedRect(6, m, R - 6, R - 2 * m, { tl: 24, bl: 24, tr: 4, br: 4 });
        } else if (fy === 1) {
            g.fillStyle(outline, 1); g.fillRoundedRect(m - 2, 0, R - 2 * m + 4, R - 2, { tl: 4, tr: 4, bl: 26, br: 26 });
            g.fillStyle(fill, 1);    g.fillRoundedRect(m, 0, R - 2 * m, R - 6, { tl: 4, tr: 4, bl: 24, br: 24 });
        } else {
            g.fillStyle(outline, 1); g.fillRoundedRect(m - 2, 2, R - 2 * m + 4, R - 2, { tl: 26, tr: 26, bl: 4, br: 4 });
            g.fillStyle(fill, 1);    g.fillRoundedRect(m, 6, R - 2 * m, R - 6, { tl: 24, tr: 24, bl: 4, br: 4 });
        }
    }

    // Two eyes on the front of the head (optional glow halo).
    _eyes(g, R, fx, fy, whiteC, pupilC, glowC) {
        const cx = R / 2, cy = R / 2, sx = -fy, sy = fx;
        [1, -1].forEach(d => {
            const ex = cx + fx * 11 + sx * 7 * d, ey = cy + fy * 11 + sy * 7 * d;
            if (glowC !== undefined) { g.fillStyle(glowC, 0.45); g.fillCircle(ex, ey, 7); }
            g.fillStyle(whiteC, 1); g.fillCircle(ex, ey, 4.5);
            g.fillStyle(pupilC, 1); g.fillCircle(ex + fx * 1.5, ey + fy * 1.5, 2.2);
        });
    }

    // Coloured lanes running along the body length (gradient / rainbow feel).
    _bandsBar(g, R, m, orient, colors, outline) {
        g.fillStyle(outline, 1);
        if (orient === 'h') g.fillRect(0, m - 2, R, R - 2 * m + 4); else g.fillRect(m - 2, 0, R - 2 * m + 4, R);
        const bw = (R - 2 * m) / colors.length;
        colors.forEach((c, i) => {
            g.fillStyle(c, 1);
            if (orient === 'h') g.fillRect(0, Math.round(m + i * bw), R, Math.ceil(bw) + 1);
            else g.fillRect(Math.round(m + i * bw), 0, Math.ceil(bw) + 1, R);
        });
    }

    // Generates the 14 directional textures for a fancy skin from a config.
    _makeDirSkin(skinId, cfg) {
        const R = 64, m = cfg.m || 6, p = `${skinId}_`;
        if (this.textures.exists(p + 'head_right')) {
            return;
        }
        const g = this.make.graphics({ x: 0, y: 0 }, false);
        const gen = (n) => { g.generateTexture(p + n, R, R); g.clear(); };
        const body = cfg.body || ((gg, RR, mm, or) => this._bandsBar(gg, RR, mm, or, cfg.bands, cfg.outline));

        body(g, R, m, 'h'); gen('body_horizontal');
        body(g, R, m, 'v'); gen('body_vertical');

        [['body_bottomleft', 1, 0, 0, 1, 0, R - m], ['body_topleft', 1, 0, 1, 0, 0, 0],
         ['body_bottomright', 0, 1, 0, 1, R - m, R - m], ['body_topright', 0, 1, 1, 0, R - m, 0]]
            .forEach(([n, l, r, t, b, ox, oy]) => {
                this._cornerL(g, R, m, cfg.cornerColor || cfg.base, l, r, t, b, ox, oy);
                if (cfg.cornerExtra) cfg.cornerExtra(g, R, m);
                gen(n);
            });

        [[1, 0, 'head_right'], [-1, 0, 'head_left'], [0, 1, 'head_down'], [0, -1, 'head_up']]
            .forEach(([fx, fy, n]) => {
                this._headShape(g, R, m, fx, fy, cfg.headFill || cfg.base, cfg.outline);
                if (cfg.headExtra) cfg.headExtra(g, R, m, fx, fy);
                else this._eyes(g, R, fx, fy, cfg.eyeW || 0xffffff, cfg.eyeP || 0x111111, cfg.eyeGlow);
                gen(n);
            });

        ['up', 'down', 'left', 'right'].forEach(d => {
            this._tailTri(g, R, m, d, cfg.outline, cfg.tailColor || cfg.base);
            gen('tail_' + d);
        });

        g.destroy();
    }

    // Pattern skins share directional geometry so previews match gameplay.
    createFancySkin(skinId) {
        const pattern = (base, outline, paint) => (g, R, m, orientation) => {
            this._bandsBar(g, R, m, orientation, [base], outline);
            const point = (x, y) => orientation === 'h' ? [x, y] : [y, x];
            const dot = (x, y, radius, color) => { g.fillStyle(color, 1); g.fillCircle(...point(x, y), radius); };
            const rect = (x, y, width, height, color) => {
                g.fillStyle(color, 1);
                if (orientation === 'h') g.fillRect(x, y, width, height);
                else g.fillRect(y, x, height, width);
            };
            const triangle = (x1, y1, x2, y2, x3, y3, color) => {
                g.fillStyle(color, 1); g.fillTriangle(...point(x1, y1), ...point(x2, y2), ...point(x3, y3));
            };
            paint({ dot, rect, triangle, R, m });
        };
        const configs = {
            tiger: {
                base: 0xffa231, outline: 0x372117, cornerColor: 0xdf7922, eyeW: 0xffedbb, eyeP: 0x261c14,
                body: pattern(0xffa231, 0x372117, ({ triangle, m, R }) => {
                    for (const x of [3, 30, 57]) {
                        triangle(x, m, x + 13, m, x + 5, 30, 0x302320);
                        triangle(x + 5, R - m, x + 18, R - m, x + 14, 34, 0x302320);
                    }
                })
            },
            bubblegum: {
                base: 0xf787c6, outline: 0x8e3f82, cornerColor: 0xe86fad, eyeP: 0x77345e,
                body: pattern(0xf787c6, 0x8e3f82, ({ dot }) => {
                    [[14, 20, 8], [43, 42, 11], [59, 19, 5]].forEach(([x,y,r]) => {
                        dot(x,y,r,0x9aebef); dot(x-2,y-3,2.5,0xeeffff);
                    });
                    dot(20,45,4,0xffc3e7);
                })
            },
            circuit: {
                base: 0x142e36, outline: 0x57f5aa, cornerColor: 0x1f4450, eyeP: 0x47ffc2, eyeGlow: 0x47ffc2,
                body: pattern(0x142e36, 0x57f5aa, ({ dot, rect }) => {
                    rect(0,19,25,3,0x57f5aa); rect(23,19,3,15,0x57f5aa); rect(23,32,41,3,0x57f5aa);
                    rect(0,45,45,2,0x47bbd9); rect(43,40,2,7,0x47bbd9);
                    [[9,20],[25,33],[53,33],[43,45]].forEach(([x,y]) => { dot(x,y,4,0x8bffcc); dot(x,y,1.5,0x1b4948); });
                })
            },
            galaxy: {
                base: 0x392971, outline: 0x9b81ef, cornerColor: 0x503081, eyeP: 0xc9e9ff, eyeGlow: 0x9673ff,
                body: pattern(0x392971, 0x9b81ef, ({ dot, rect }) => {
                    dot(18,29,17,0x52358b); dot(42,38,14,0x354688); dot(56,19,10,0x6750a6);
                    [[8,17],[25,43],[48,17],[59,46]].forEach(([x,y]) => dot(x,y,1.6,0xf4edff));
                    rect(33,16,2,12,0xffe4a1); rect(28,21,12,2,0xffe4a1);
                })
            },
            dragon: {
                base: 0x379b74, outline: 0x143d37, cornerColor: 0x287c60, headFill: 0x64ba80, eyeW: 0xffdc78, eyeP: 0x3d2920,
                body: pattern(0x379b74, 0x143d37, ({ dot, triangle }) => {
                    for (const x of [4,25,46]) for (const y of [19,41]) {
                        dot(x,y,9,0x1d6555); dot(x,y-2,7,0x65bf81);
                    }
                    for (const x of [9,37]) triangle(x,8,x+13,8,x+7,21,0xf4cf6c);
                }),
                headExtra: (g,R,m,fx,fy) => {
                    this._eyes(g,R,fx,fy,0xffdc78,0x3d2920);
                    const point = (forward, side) => [R/2 + fx*forward - fy*side, R/2 + fy*forward + fx*side];
                    g.fillStyle(0xf4cf6c,1);
                    for (const side of [-1,1]) g.fillTriangle(...point(-14,side*10),...point(-22,side*26),...point(-2,side*17));
                }
            },
            watermelon: {
                base: 0xf4777c, outline: 0x267647, cornerColor: 0xef7b80, eyeP: 0x3c2630,
                body: (g,R,m,orientation) => {
                    this._bandsBar(g,R,m,orientation,[0x49b561,0xe4efb0,0xf4777c,0xf4777c,0xe4efb0,0x49b561],0x267647);
                    g.fillStyle(0x462933,1);
                    [[13,28],[34,37],[55,28]].forEach(([x,y]) => g.fillEllipse(orientation === 'h' ? x : y, orientation === 'h' ? y : x, orientation === 'h' ? 4 : 7, orientation === 'h' ? 7 : 4));
                }
            },
            bee: {
                base: 0xffd858, outline: 0x3a2c22, cornerColor: 0xf3b83f, eyeP: 0x332b24,
                body: pattern(0xffd858,0x3a2c22,({ rect, dot, m, R }) => {
                    for (const x of [11,41]) rect(x,m,13,R-2*m,0x332b24);
                    dot(15,15,5,0xaee6ee); dot(45,15,5,0xaee6ee);
                })
            },
            aurora: {
                base: 0xa18cf1, outline: 0x44376b, cornerColor: 0x6ebfae, eyeP: 0x524174, eyeGlow: 0x7bffe2,
                body: (g,R,m,orientation) => {
                    this._bandsBar(g,R,m,orientation,[0x89f2cd,0x58cbb8,0x70a4de,0xa18cf1,0xe8a3df],0x44376b);
                    g.fillStyle(0xd8fff1,0.7);
                    if (orientation === 'h') { g.fillTriangle(9,m,18,m,5,R-m); g.fillTriangle(42,m,49,m,37,R-m); }
                    else { g.fillTriangle(m,9,m,18,R-m,5); g.fillTriangle(m,42,m,49,R-m,37); }
                }
            },
            // Dark segments with a glowing cyan outline; glowing eyes.
            neon: {
                m: 6, base: 0x0b0b1a, cornerColor: 0x0b0b1a, outline: 0x00e6ff,
                body: (g, R, m, or) => {
                    g.fillStyle(0x00e6ff, 1); if (or === 'h') g.fillRect(0, m - 2, R, R - 2 * m + 4); else g.fillRect(m - 2, 0, R - 2 * m + 4, R);
                    g.fillStyle(0x0b0b1a, 1); if (or === 'h') g.fillRect(0, m + 2, R, R - 2 * m - 4); else g.fillRect(m + 2, 0, R - 2 * m - 4, R);
                    g.fillStyle(0x8af7ff, 0.6); if (or === 'h') g.fillRect(0, m, R, 2); else g.fillRect(m, 0, 2, R);
                },
                cornerExtra: (g, R) => { g.fillStyle(0x00e6ff, 1); g.fillCircle(R / 2, R / 2, 5); g.fillStyle(0x0b0b1a, 1); g.fillCircle(R / 2, R / 2, 2.5); },
                headExtra: (g, R, m, fx, fy) => this._eyes(g, R, fx, fy, 0xe6ffff, 0x00e6ff, 0x00e6ff)
            },
            // Red diagonal stripes on white.
            candy: {
                m: 6, base: 0xffffff, cornerColor: 0xffffff, outline: 0xd62828, eyeW: 0xffffff, eyeP: 0xd62828,
                body: (g, R, m, or) => {
                    const h = R - 2 * m;
                    g.fillStyle(0xffffff, 1); if (or === 'h') g.fillRect(0, m, R, h); else g.fillRect(m, 0, h, R);
                    g.fillStyle(0xe23c3c, 1);
                    if (or === 'h') { for (let x = -h; x < R; x += 22) { g.fillTriangle(x, m, x + 11, m, x + 11 - h, R - m); g.fillTriangle(x, m, x + 11 - h, R - m, x - h, R - m); } }
                    else { for (let y = -h; y < R; y += 22) { g.fillTriangle(m, y, m, y + 11, R - m, y + 11 - h); g.fillTriangle(m, y, R - m, y + 11 - h, R - m, y - h); } }
                }
            },
            // Rainbow lanes.
            rainbow: {
                m: 6, base: 0x5e5ce6, bands: [0xff3b30, 0xff9500, 0xffd60a, 0x34c759, 0x0a84ff, 0x5e5ce6, 0xbf5af2],
                cornerColor: 0x5e5ce6, outline: 0x141425, headFill: 0xff3b30, eyeW: 0xffffff, eyeP: 0x222222
            },
            // Orange→red gradient with ember flecks.
            lava: {
                m: 6, base: 0xff5a1f, cornerColor: 0xd83010, outline: 0x3a0a00, headFill: 0xff7a1f,
                eyeW: 0xfff2b0, eyeP: 0x5a0f00, eyeGlow: 0xff7a1f,
                body: (g, R, m, or) => {
                    this._bandsBar(g, R, m, or, [0xffd23f, 0xff8c1a, 0xff4d0f, 0xcc1a00], 0x3a0a00);
                    g.fillStyle(0xffe680, 0.95);
                    const flecks = [[14, m + 6], [40, m + 10], [52, R - m - 8], [22, R - m - 5]];
                    (or === 'h' ? flecks : flecks.map(([a, b]) => [b, a])).forEach(([x, y]) => g.fillCircle(x, y, 2));
                }
            },
            // Pale translucent blue with white facets.
            ice: {
                m: 6, base: 0x9fdcff, cornerColor: 0x86cdf5, outline: 0x2f6a9a, headFill: 0xbfe9ff, eyeW: 0xffffff, eyeP: 0x2f6a9a,
                body: (g, R, m, or) => {
                    g.fillStyle(0x2f6a9a, 1); if (or === 'h') g.fillRect(0, m - 2, R, R - 2 * m + 4); else g.fillRect(m - 2, 0, R - 2 * m + 4, R);
                    g.fillStyle(0xaee4ff, 0.85); if (or === 'h') g.fillRect(0, m, R, R - 2 * m); else g.fillRect(m, 0, R - 2 * m, R);
                    g.fillStyle(0xffffff, 0.7);
                    if (or === 'h') { g.fillTriangle(12, m, 20, m, 8, R - m); g.fillTriangle(40, m, 46, m, 34, R - m); }
                    else { g.fillTriangle(m, 12, m, 20, R - m, 8); g.fillTriangle(m, 40, m, 46, R - m, 34); }
                }
            },
            // Metallic gold with a bright specular strip.
            gold: {
                m: 6, base: 0xd4af37, cornerColor: 0xc9a230, outline: 0x6e5210, headFill: 0xd4af37, eyeW: 0xfff6cf, eyeP: 0x6e5210,
                body: (g, R, m, or) => {
                    g.fillStyle(0x6e5210, 1); if (or === 'h') g.fillRect(0, m - 2, R, R - 2 * m + 4); else g.fillRect(m - 2, 0, R - 2 * m + 4, R);
                    g.fillStyle(0xd4af37, 1); if (or === 'h') g.fillRect(0, m, R, R - 2 * m); else g.fillRect(m, 0, R - 2 * m, R);
                    g.fillStyle(0xfff2b0, 1); if (or === 'h') g.fillRect(0, m + 4, R, 4); else g.fillRect(m + 4, 0, 4, R);
                    g.fillStyle(0x9c7a1e, 1); if (or === 'h') g.fillRect(0, R - m - 6, R, 4); else g.fillRect(R - m - 6, 0, 4, R);
                }
            },
            // Riveted metal plates with a single glowing eye.
            robot: {
                m: 6, base: 0x6b7280, cornerColor: 0x5a616e, outline: 0x24272e,
                body: (g, R, m, or) => {
                    g.fillStyle(0x24272e, 1); if (or === 'h') g.fillRect(0, m - 2, R, R - 2 * m + 4); else g.fillRect(m - 2, 0, R - 2 * m + 4, R);
                    g.fillStyle(0x6b7280, 1); if (or === 'h') g.fillRect(0, m, R, R - 2 * m); else g.fillRect(m, 0, R - 2 * m, R);
                    g.fillStyle(0x8b93a3, 1); if (or === 'h') g.fillRect(0, m + 3, R, 3); else g.fillRect(m + 3, 0, 3, R);
                    g.fillStyle(0x3a3f47, 1);
                    const riv = (or === 'h') ? [[9, m + 7], [55, m + 7], [9, R - m - 7], [55, R - m - 7]] : [[m + 7, 9], [m + 7, 55], [R - m - 7, 9], [R - m - 7, 55]];
                    riv.forEach(([x, y]) => g.fillCircle(x, y, 2.5));
                },
                headExtra: (g, R, m, fx, fy) => {
                    const ex = R / 2 + fx * 10, ey = R / 2 + fy * 10;
                    g.fillStyle(0xff3b30, 0.4); g.fillCircle(ex, ey, 9);
                    g.fillStyle(0xff3b30, 1); g.fillCircle(ex, ey, 5);
                    g.fillStyle(0xffd7d2, 1); g.fillCircle(ex - 1, ey - 1, 1.6);
                }
            }
        };
        const cfg = configs[skinId];
        if (cfg) this._makeDirSkin(skinId, cfg);
    }

}

export function createSkinTextures(scene, skinId) {
    if (skinId === 'classic') return;
    scene.skinTextureFactory ??= new SkinTextureFactory(scene);
    scene.skinTextureFactory.createSkinTextures(skinId);
}
