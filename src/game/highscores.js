// Per-configuration high scores. Each distinct game setup (grid size, speed,
// AI + difficulty, ghost, and each mode) is its own bucket, keyed by a
// canonical config string. Stored as { [key]: { label, score } } under one
// localStorage key. All access is guarded so the game works with storage off.

import { safeGetItem, safeSetItem, safeRemoveItem } from './storage';

const KEY = 'highScores';

export function getAllHighScores() {
    const raw = safeGetItem(KEY);
    if (!raw) {
        return {};
    }
    try {
        const data = JSON.parse(raw);
        return (data && typeof data === 'object') ? data : {};
    } catch (e) {
        return {};
    }
}

export function getHighScore(configKey) {
    const entry = getAllHighScores()[configKey];
    return entry ? entry.score : 0;
}

// Records `score` for `configKey` if it beats the stored best. Returns true if
// a new record was saved.
export function saveHighScore(configKey, label, score) {
    const all = getAllHighScores();
    if (!all[configKey] || score > all[configKey].score) {
        all[configKey] = { label, score };
        safeSetItem(KEY, JSON.stringify(all));
        return true;
    }
    return false;
}

export function clearHighScores() {
    safeRemoveItem(KEY);
}
