import { SKINS } from './skins';
import { safeGetItem, safeSetItem } from './storage';
import { getAllHighScores } from './highscores';

export const PROGRESS_KEY = 'snakeSkinProgressV1';
const METRICS = ['totalApples', 'bestScore', 'fruitfulRuns', 'spikesBest', 'teleportBest', 'colorBest', 'hardBest', 'extraHardBest', 'speedBest', 'comboBest'];
const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const empty = () => ({ version: 1, ...Object.fromEntries(METRICS.map(key => [key, 0])), unlocked: ['classic'] });

function award(progress) {
    for (const skin of SKINS) {
        if ((!skin.unlock || progress[skin.unlock.metric] >= skin.unlock.target) && !progress.unlocked.includes(skin.id)) progress.unlocked.push(skin.id);
    }
    return progress;
}

function normalize(value) {
    if (!value || value.version !== 1 || typeof value !== 'object') return null;
    const progress = empty();
    for (const key of METRICS) progress[key] = count(value[key]);
    if (Array.isArray(value.unlocked)) {
        progress.unlocked = [...new Set(['classic', ...value.unlocked.filter(id => SKINS.some(skin => skin.id === id))])];
    }
    return award(progress);
}

function legacyBest() {
    return Math.max(0, ...Object.values(getAllHighScores()).map(entry => count(entry?.score)), count(Number(safeGetItem('highScore'))));
}

// Keep progress usable for this session if storage is unavailable. Each apple
// is saved immediately; ending/reloading a run never counts the apples twice.
export function createProgressStore({ read = () => safeGetItem(PROGRESS_KEY), write = value => safeSetItem(PROGRESS_KEY, value), previousBest = legacyBest } = {}) {
    let current;
    let persistent = true;
    function persist() {
        try { persistent = write(JSON.stringify(current)) !== false; } catch { persistent = false; }
    }
    function load() {
        let saved;
        try { saved = normalize(JSON.parse(read())); } catch { /* Invalid or unavailable storage. */ }
        if (!current) {
            current = saved || empty();
            if (!saved) {
                // Old saves know single-game records, not lifetime apple totals.
                current.bestScore = count(previousBest());
                award(current);
            }
            persist();
        } else if (saved) {
            // Another open game may have earned rewards since our last update.
            for (const key of METRICS) current[key] = Math.max(current[key], saved[key]);
            current.unlocked = [...new Set([...current.unlocked, ...saved.unlocked])];
            award(current);
        }
        return current;
    }
    function update(change) {
        const progress = load();
        const before = new Set(progress.unlocked);
        change(progress);
        award(progress);
        persist();
        return SKINS.filter(skin => progress.unlocked.includes(skin.id) && !before.has(skin.id));
    }
    return {
        isPersistent() { load(); return persistent; },
        get() { const progress = load(); return { ...progress, unlocked: [...progress.unlocked] }; },
        recordApple(run) {
            return update(progress => {
                progress.totalApples = Math.min(Number.MAX_SAFE_INTEGER, progress.totalApples + 1);
                const score = count(run.score);
                const best = key => { progress[key] = Math.max(progress[key], score); };
                best('bestScore');
                if (run.spikes) best('spikesBest');
                if (run.teleport) best('teleportBest');
                if (run.colorShuffle) best('colorBest');
                if (run.spikes && run.teleport) best('comboBest');
                if (run.speed >= 10) best('speedBest');
                if (run.rivalEnabled && ['hard', 'extraHard'].includes(run.difficulty)) best('hardBest');
                if (run.rivalEnabled && run.difficulty === 'extraHard') best('extraHardBest');
            });
        },
        finishRun(score) {
            return update(progress => {
                if (count(score) > 0) progress.fruitfulRuns = Math.min(Number.MAX_SAFE_INTEGER, progress.fruitfulRuns + 1);
            });
        }
    };
}

const store = createProgressStore();
export const getSkinProgress = () => store.get();
export const canSaveSkinProgress = () => store.isPersistent();
export const recordSkinApple = run => store.recordApple(run);
export const finishSkinRun = score => store.finishRun(score);
export function isSkinUnlocked(id, progress = getSkinProgress()) {
    return SKINS.some(skin => skin.id === id) && progress.unlocked.includes(id);
}
export function availableSkin(id, progress = getSkinProgress()) {
    return isSkinUnlocked(id, progress) ? id : 'classic';
}
export function unlockProgress(skin, progress = getSkinProgress()) {
    const requirement = skin.unlock;
    return {
        unlocked: isSkinUnlocked(skin.id, progress),
        value: requirement ? Math.min(progress[requirement.metric], requirement.target) : 1,
        target: requirement?.target || 1,
        description: requirement?.description || 'Your first snake. Ready to play from the start.',
        category: requirement?.category || 'Starter'
    };
}
