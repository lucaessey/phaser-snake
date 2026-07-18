// Pure swipe-gesture helper. Given a drag delta, returns the intended
// direction ('up' | 'down' | 'left' | 'right') or null if the swipe was too
// short to count. The dominant axis wins.
export function swipeToDirection(dx, dy, minDistance = 24) {
    if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) {
        return null;
    }
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'down' : 'up';
}
