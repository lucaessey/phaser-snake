import { describe, expect, it } from 'vitest';
import { SKINS } from '../src/game/skins';
import { availableSkin, createProgressStore, isSkinUnlocked, unlockProgress } from '../src/game/skinProgress';

function savedStore(initial = null, previousBest = 0) {
    let saved = initial;
    const options = { read: () => saved, write: value => { saved = value; }, previousBest: () => previousBest };
    return { store: createProgressStore(options), reload: () => createProgressStore(options), saved: () => JSON.parse(saved) };
}
const round = { score: 1, speed: 5, rivalEnabled: false, difficulty: 'medium', spikes: false, teleport: false, colorShuffle: false };

describe('earned skins', () => {
    it('starts with only Classic and rejects locked or unknown equipped skins', () => {
        const { store } = savedStore();
        expect(store.get().unlocked).toEqual(['classic']);
        expect(availableSkin('galaxy', store.get())).toBe('classic');
        expect(availableSkin('missing', store.get())).toBe('classic');
        expect(SKINS).toHaveLength(21);
        expect(new Set(SKINS.map(skin => skin.id)).size).toBe(21);
        expect(SKINS.filter(skin => !skin.unlock).map(skin => skin.id)).toEqual(['classic']);
    });

    it.each(SKINS.filter(skin => skin.unlock))('earns $name at its exact requirement', skin => {
        const { metric, target } = skin.unlock;
        const { store } = savedStore(JSON.stringify({ version: 1, [metric]: target - 1 }));
        expect(isSkinUnlocked(skin.id, store.get())).toBe(false);
        const rewards = metric === 'fruitfulRuns' ? store.finishRun(1) : store.recordApple({
            ...round, score: target, speed: 10, rivalEnabled: true, difficulty: 'extraHard', spikes: true, teleport: true, colorShuffle: true
        });
        expect(rewards.map(reward => reward.id)).toContain(skin.id);
        expect(isSkinUnlocked(skin.id, store.get())).toBe(true);
    });

    it('combines apples across games, without turning a cumulative total into a high score', () => {
        const { store, reload } = savedStore();
        for (let game = 0; game < 5; game++) {
            store.recordApple(round);
            store.finishRun(1);
        }
        expect(store.get()).toMatchObject({ totalApples: 5, bestScore: 1, fruitfulRuns: 5 });
        expect(store.get().unlocked).toEqual(expect.arrayContaining(['slime', 'ttt']));
        expect(isSkinUnlocked('black', store.get())).toBe(false);
        expect(reload().get()).toEqual(store.get());
    });

    it('does not count empty games and only announces newly earned skins once', () => {
        const { store } = savedStore();
        for (let i = 0; i < 8; i++) store.finishRun(0);
        expect(store.get().fruitfulRuns).toBe(0);
        for (let score = 1; score < 5; score++) store.recordApple({ ...round, score });
        expect(store.recordApple({ ...round, score: 5 }).map(skin => skin.id)).toEqual(['slime']);
        expect(store.recordApple({ ...round, score: 6 })).toEqual([]);
        expect(store.finishRun(6)).toEqual([]);
        expect(store.get().totalApples).toBe(6);
    });

    it('requires the actual challenge settings in the same run', () => {
        const { store } = savedStore();
        store.recordApple({ ...round, score: 30, difficulty: 'extraHard' });
        expect(store.get()).toMatchObject({ hardBest: 0, extraHardBest: 0, speedBest: 0, spikesBest: 0, comboBest: 0 });
        store.recordApple({ ...round, score: 9, spikes: true });
        store.recordApple({ ...round, score: 9, teleport: true });
        expect(isSkinUnlocked('lava', store.get())).toBe(true);
        expect(isSkinUnlocked('watermelon', store.get())).toBe(true);
        expect(isSkinUnlocked('dragon', store.get())).toBe(false);
        store.recordApple({ ...round, score: 12, rivalEnabled: true, difficulty: 'hard' });
        expect(isSkinUnlocked('robot', store.get())).toBe(true);
        expect(isSkinUnlocked('circuit', store.get())).toBe(false);
        store.recordApple({ ...round, score: 10, speed: 10 });
        expect(isSkinUnlocked('bee', store.get())).toBe(true);
    });

    it('credits old high scores without inventing lifetime apples or old challenges', () => {
        const { store, reload } = savedStore(null, 20);
        expect(store.get()).toMatchObject({ bestScore: 20, totalApples: 0, comboBest: 0 });
        expect(store.get().unlocked).toEqual(expect.arrayContaining(['black', 'brainrot', 'neon', 'rainbow']));
        expect(isSkinUnlocked('galaxy', store.get())).toBe(false);
        expect(reload().get().unlocked).toEqual(store.get().unlocked);
    });

    it('keeps earned skins, repairs bad metrics, and discards unknown skin ids', () => {
        const { store } = savedStore(JSON.stringify({ version: 1, bestScore: -1, totalApples: '500', fruitfulRuns: 1.5, unlocked: ['lava', 'missing', 'lava'] }));
        expect(store.get()).toMatchObject({ totalApples: 0, bestScore: 0, fruitfulRuns: 0 });
        expect(store.get().unlocked).toEqual(['classic', 'lava']);
        expect(unlockProgress(SKINS.find(skin => skin.id === 'lava'), store.get()).unlocked).toBe(true);
    });

    it('recovers from corrupt storage and retains session progress when saving fails', () => {
        const { store } = savedStore('{bad json');
        expect(store.get().unlocked).toEqual(['classic']);
        const blocked = createProgressStore({ read: () => { throw new Error('Denied'); }, write: () => { throw new Error('Full'); }, previousBest: () => 0 });
        for (let score = 1; score <= 5; score++) blocked.recordApple({ ...round, score });
        expect(blocked.get().totalApples).toBe(5);
        expect(blocked.isPersistent()).toBe(false);
        expect(isSkinUnlocked('slime', blocked.get())).toBe(true);
    });
});

it('merges rewards and counts when alternating between two open games', () => {
    const { store, reload } = savedStore();
    const other = reload();
    store.get(); other.get();
    for (let i = 0; i < 5; i++) (i % 2 ? other : store).recordApple(round);
    expect(other.get().totalApples).toBe(5);
    expect(store.get().totalApples).toBe(5);
    expect(isSkinUnlocked('slime', other.get())).toBe(true);
});
