// Responsive grid/canvas layout. `computeLayout` is pure (no DOM/storage) so it
// can be unit-tested; `currentLayout` reads the live window + settings.

// Target column counts. 'auto' picks by device; the named sizes are densities
// (more columns = smaller cells). Everything scales to the actual screen.
export const GRID_TARGET_COLS = {
    autoTouch: 13,     // phones: few, chunky cells that are easy to see + swipe
    autoDesktop: 30,
    small: 12,
    medium: 20,
    large: 32
};

export const MIN_TILE = 18;
export const MAX_TILE = 96;

// Given a viewport, returns a whole-tile grid that fills it as closely as
// possible: { tile, cols, rows, width, height } where width/height are exact
// multiples of tile (no partial cells).
export function computeLayout({ width, height, isTouch = false, gridId = 'auto' } = {}) {
    const vw = Math.max(240, Math.floor(width) || 1024);
    const vh = Math.max(320, Math.floor(height) || 768);

    let target;
    if (gridId === 'auto') {
        // Chunky grid on phones: either a touch device OR a narrow viewport
        // (covers narrow desktop windows and non-touch mobile emulation too).
        const phoneLike = isTouch || vw <= 700;
        target = phoneLike ? GRID_TARGET_COLS.autoTouch : GRID_TARGET_COLS.autoDesktop;
    } else {
        target = GRID_TARGET_COLS[gridId] || GRID_TARGET_COLS.medium;
    }

    let tile = Math.round(vw / target);
    tile = Math.max(MIN_TILE, Math.min(MAX_TILE, tile));

    const cols = Math.max(8, Math.floor(vw / tile));
    const rows = Math.max(10, Math.floor(vh / tile));

    return { tile, cols, rows, width: cols * tile, height: rows * tile };
}

// Is this a touch-first device?
export function isTouchDevice() {
    if (typeof window === 'undefined') return false;
    return (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
}

// Live layout from the current window + stored grid setting.
export function currentLayout() {
    let gridId = 'auto';
    try {
        gridId = localStorage.getItem('gridSize') || 'auto';
    } catch (e) {
        gridId = 'auto';
    }
    const width = (typeof window !== 'undefined' && window.innerWidth) || 1024;
    const height = (typeof window !== 'undefined' && window.innerHeight) || 768;
    return computeLayout({ width, height, isTouch: isTouchDevice(), gridId });
}
