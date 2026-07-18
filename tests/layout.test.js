import { describe, it, expect } from 'vitest';
import { computeLayout, MIN_TILE, MAX_TILE } from '../src/game/layout.js';

describe('computeLayout', () => {
    it('produces a whole-tile grid with no partial cells', () => {
        const L = computeLayout({ width: 1280, height: 800, isTouch: false, gridId: 'auto' });
        expect(L.width).toBe(L.cols * L.tile);
        expect(L.height).toBe(L.rows * L.tile);
    });

    it('gives phones a chunkier grid than desktops (auto)', () => {
        const phone = computeLayout({ width: 390, height: 780, isTouch: true, gridId: 'auto' });
        const desktop = computeLayout({ width: 1280, height: 800, isTouch: false, gridId: 'auto' });
        expect(phone.cols).toBeLessThan(desktop.cols);
        expect(phone.cols).toBeGreaterThanOrEqual(10);
        expect(phone.cols).toBeLessThanOrEqual(16);
    });

    it('uses the chunky grid on a narrow viewport even without touch', () => {
        const narrow = computeLayout({ width: 375, height: 812, isTouch: false, gridId: 'auto' });
        expect(narrow.cols).toBeGreaterThanOrEqual(10);
        expect(narrow.cols).toBeLessThanOrEqual(16);
        expect(narrow.rows).toBeGreaterThan(narrow.cols); // portrait
    });

    it('fills a portrait phone (more rows than columns)', () => {
        const L = computeLayout({ width: 390, height: 780, isTouch: true, gridId: 'auto' });
        expect(L.rows).toBeGreaterThan(L.cols);
        expect(L.width).toBeLessThanOrEqual(390);
        expect(L.height).toBeLessThanOrEqual(780);
        // fills most of the viewport (within one tile of the edges)
        expect(390 - L.width).toBeLessThan(L.tile);
        expect(780 - L.height).toBeLessThan(L.tile);
    });

    it('orders the named densities small < medium < large by column count', () => {
        const vp = { width: 1024, height: 768, isTouch: false };
        const small = computeLayout({ ...vp, gridId: 'small' });
        const medium = computeLayout({ ...vp, gridId: 'medium' });
        const large = computeLayout({ ...vp, gridId: 'large' });
        expect(small.cols).toBeLessThan(medium.cols);
        expect(medium.cols).toBeLessThan(large.cols);
    });

    it('clamps the tile to a sane range on extreme viewports', () => {
        const tiny = computeLayout({ width: 200, height: 320, isTouch: true, gridId: 'large' });
        expect(tiny.tile).toBeGreaterThanOrEqual(MIN_TILE);
        const huge = computeLayout({ width: 4000, height: 3000, isTouch: false, gridId: 'small' });
        expect(huge.tile).toBeLessThanOrEqual(MAX_TILE);
    });

    it('always leaves room for the play area (min columns/rows)', () => {
        const L = computeLayout({ width: 240, height: 320, isTouch: true, gridId: 'auto' });
        expect(L.cols).toBeGreaterThanOrEqual(8);
        expect(L.rows).toBeGreaterThanOrEqual(10);
    });

    it('is defensive about missing/zero inputs', () => {
        const L = computeLayout({});
        expect(L.width).toBe(L.cols * L.tile);
        expect(L.tile).toBeGreaterThanOrEqual(MIN_TILE);
    });
});
