import { afterEach, describe, expect, it, vi } from 'vitest';
import { readMenuPreferences } from '../src/game/menuPreferences';

afterEach(() => vi.unstubAllGlobals());
function stored(values) {
    vi.stubGlobal('localStorage', { getItem: key => values[key] ?? null });
}

describe('menu preferences', () => {
    it('preserves choices from the previous settings screen', () => {
        stored({ snakeSkin: 'lava', snakeColorIndex: '3', snakeSpeed: '12', rivalDifficulty: 'extraHard', rivalEnabled: 'false', modeSpikes: 'true', foodType: 'sushi' });
        expect(readMenuPreferences({ unlocked: ['classic', 'lava'] })).toMatchObject({ snakeSkin: 'lava', snakeColorIndex: 3, snakeSpeed: 12, rivalDifficulty: 'extraHard', rivalEnabled: false, modeSpikes: true, foodType: 'sushi' });
    });
    it('recovers from invalid saved options and clamps speed', () => {
        stored({ snakeSkin: 'missing', snakeColorIndex: '-2', snakeSpeed: '999', foodType: 'missing', gridSize: 'huge', rivalDifficulty: 'impossible' });
        expect(readMenuPreferences()).toMatchObject({ snakeSkin: 'classic', snakeColorIndex: 0, snakeSpeed: 20, foodType: 'apple', gridSize: 'auto', rivalDifficulty: 'medium' });
        stored({ snakeSpeed: '-5' });
        expect(readMenuPreferences().snakeSpeed).toBe(1);
    });
    it('provides usable defaults when browser storage is blocked', () => {
        vi.stubGlobal('localStorage', { getItem: () => { throw new Error('Storage denied'); } });
        expect(readMenuPreferences()).toMatchObject({ snakeSkin: 'classic', snakeColorIndex: 0, snakeSpeed: 5, rivalEnabled: true, ghostEnabled: true, modeSpikes: false });
    });
});
