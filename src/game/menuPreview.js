import { SNAKE_COLORS } from './Snake';
import { SKINS } from './skins';

// Read the same textures used by the game, including generated skins and tint.
export function createMenuPreview(scene, canvas, getPreferences) {
    const ctx = canvas.getContext('2d');
    const tinted = new Map();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    function source(key, tint = 0xffffff) {
        const original = scene.textures.get(key).getSourceImage();
        if (tint === 0xffffff) return original;
        const id = `${key}:${tint}`;
        if (tinted.has(id)) return tinted.get(id);
        const tile = document.createElement('canvas');
        tile.width = original.width;
        tile.height = original.height;
        const brush = tile.getContext('2d');
        brush.drawImage(original, 0, 0);
        const pixels = brush.getImageData(0, 0, tile.width, tile.height);
        for (let i = 0; i < pixels.data.length; i += 4) {
            pixels.data[i] *= ((tint >> 16) & 255) / 255;
            pixels.data[i + 1] *= ((tint >> 8) & 255) / 255;
            pixels.data[i + 2] *= (tint & 255) / 255;
        }
        brush.putImageData(pixels, 0, 0);
        tinted.set(id, tile);
        return tile;
    }

    function drawSnake(context, skin, color, x, y, size, length = 5) {
        const prefix = skin === 'classic' ? '' : `${skin}_`;
        const tint = skin === 'classic' ? SNAKE_COLORS[color].tint : 0xffffff;
        for (let i = 0; i < length; i++) {
            let part = i === 0 ? 'tail_left' : i === length - 1 ? 'head_right' : 'body_horizontal';
            if (skin === 'black') part = `tile_${(length - 1 - i) % 2 === 0 ? 6 : 7}`;
            if (skin === 'brainrot') part = `tile_${i % 5}`;
            context.drawImage(source(prefix + part, tint), x + i * size, y, size, size);
        }
    }

    function draw(time = 0) {
        const prefs = getPreferences();
        const w = canvas.width, h = canvas.height, tile = 40;
        ctx.clearRect(0, 0, w, h);
        for (let y = 0; y < h; y += tile) {
            for (let x = 0; x < w; x += tile) {
                ctx.fillStyle = ((x + y) / tile) % 2 ? '#294b35' : '#2d513a';
                ctx.fillRect(x, y, tile, tile);
            }
        }
        const offset = reducedMotion.matches ? 0 : Math.sin(time * prefs.snakeSpeed / 10000) * 18;
        drawSnake(ctx, prefs.snakeSkin, prefs.snakeColorIndex, w / 2 - 160 + offset, h / 2 - 28, 56);
        ctx.drawImage(source(prefs.foodType), w / 2 + 165, h / 2 - 25, 50, 50);
        if (canvas.dataset.skin !== prefs.snakeSkin) {
            canvas.dataset.skin = prefs.snakeSkin;
            canvas.setAttribute('aria-label', `${SKINS.find(skin => skin.id === prefs.snakeSkin).name} snake preview`);
        }
    }

    function animate(time) {
        if (!document.hidden) draw(time);
        frame = requestAnimationFrame(animate);
    }
    draw();
    frame = requestAnimationFrame(animate);
    return {
        draw,
        thumbnail(target, skin, color = 0) {
            const context = target.getContext('2d');
            context.clearRect(0, 0, target.width, target.height);
            drawSnake(context, skin, color, 10, 12, 32, 4);
        },
        dispose() { cancelAnimationFrame(frame); tinted.clear(); }
    };
}
