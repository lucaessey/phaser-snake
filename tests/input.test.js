import { describe, it, expect } from 'vitest';
import { swipeToDirection } from '../src/game/input.js';

describe('swipeToDirection', () => {
    it('maps a horizontal-dominant swipe to left/right', () => {
        expect(swipeToDirection(80, 5)).toBe('right');
        expect(swipeToDirection(-80, -5)).toBe('left');
    });

    it('maps a vertical-dominant swipe to up/down', () => {
        expect(swipeToDirection(5, 80)).toBe('down');
        expect(swipeToDirection(-5, -80)).toBe('up');
    });

    it('returns null for a swipe below the threshold (a tap)', () => {
        expect(swipeToDirection(5, 5)).toBeNull();
        expect(swipeToDirection(23, 0, 24)).toBeNull();
        expect(swipeToDirection(0, 0)).toBeNull();
    });

    it('counts a swipe once either axis crosses the threshold', () => {
        expect(swipeToDirection(24, 0, 24)).toBe('right');
        expect(swipeToDirection(0, 24, 24)).toBe('down');
    });

    it('breaks diagonal ties in favor of the horizontal axis', () => {
        expect(swipeToDirection(50, 50)).toBe('right');
        expect(swipeToDirection(-50, 50)).toBe('left');
    });

    it('respects a custom minimum distance', () => {
        expect(swipeToDirection(30, 0, 40)).toBeNull();
        expect(swipeToDirection(50, 0, 40)).toBe('right');
    });
});
