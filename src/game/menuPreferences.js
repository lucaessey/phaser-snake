import { safeGetItem } from './storage';
import { SKINS } from './skins';
import { SNAKE_COLORS } from './Snake';

const choice = (key, allowed, fallback) => {
    const value = safeGetItem(key);
    return allowed.includes(value) ? value : fallback;
};
const toggle = (key, fallback) => {
    const value = safeGetItem(key);
    return value === null ? fallback : value === 'true';
};

export function readMenuPreferences() {
    const speed = Number.parseInt(safeGetItem('snakeSpeed'), 10);
    const color = Number.parseInt(safeGetItem('snakeColorIndex'), 10);
    return {
        snakeSpeed: Number.isFinite(speed) ? Math.max(1, Math.min(20, speed)) : 5,
        snakeColorIndex: Number.isInteger(color) && color >= 0 && color < SNAKE_COLORS.length ? color : 0,
        snakeSkin: choice('snakeSkin', SKINS.map(skin => skin.id), 'classic'),
        foodType: choice('foodType', ['apple', 'banana', 'eggplant', 'jerry', 'sushi'], 'apple'),
        gridSize: choice('gridSize', ['auto', 'small', 'medium', 'large'], 'auto'),
        rivalDifficulty: choice('rivalDifficulty', ['easy', 'medium', 'hard', 'extraHard'], 'medium'),
        rivalEnabled: toggle('rivalEnabled', true),
        ghostEnabled: toggle('ghostEnabled', true),
        modeSpikes: toggle('modeSpikes', false),
        modeTeleport: toggle('modeTeleport', false),
        modeColorShuffle: toggle('modeColorShuffle', false)
    };
}
