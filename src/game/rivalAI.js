// Rival snake AI. Pure grid logic with no Phaser dependency, so the strategy
// can be swapped or unit-tested without touching the game loop.
//
// The single entry point is chooseRivalDirection(gameState) -> direction
// (one of 'up' | 'down' | 'left' | 'right'), or null when no legal move exists
// (the caller should then kill the rival).
//
// gameState shape:
// {
//   bounds:          { xMin, xMax, yMin, yMax },   // inclusive playable grid range
//   food:            { col, row },
//   rivalCells:      [{col,row}, ...],             // head first, tail last
//   rivalDirection:  'up'|'down'|'left'|'right',
//   playerCells:     [{col,row}, ...],             // head first, tail last
//   playerDirection: 'up'|'down'|'left'|'right',   // used to avoid mutual death
//   ghostCells:      [{col,row}, ...],             // solid obstacle cells (may be empty)
//   spikeCells:      [{col,row}, ...],             // deadly terrain (may be empty)
//   difficulty:      one of RIVAL_DIFFICULTY values (falls back to Easy)
//   rng?:            () => number                  // optional, defaults to Math.random
// }

// Difficulty presets. Easy reproduces the original greedy behaviour exactly;
// the harder tiers are progressively more aggressive (they hunt the player and
// cut off space) and make fewer mistakes.
// speedFactor: how many cells the rival moves per one of the player's cells.
// Above 1 the rival is genuinely faster than the player, which is the main
// lever that makes the harder tiers threatening (it wins food races and can
// run the player down). Easy stays at parity and non-aggressive.
export const RIVAL_DIFFICULTY = {
    easy:      { key: 'easy',      name: 'Easy',       mistakeChance: 0.08, aggressive: false, killPriority: false, speedFactor: 1.0 },
    medium:    { key: 'medium',    name: 'Medium',     mistakeChance: 0.03, aggressive: true,  killPriority: false, speedFactor: 1.2 },
    hard:      { key: 'hard',      name: 'Hard',       mistakeChance: 0.0,  aggressive: true,  killPriority: true,  speedFactor: 1.45 },
    extraHard: { key: 'extraHard', name: 'Extra Hard', mistakeChance: 0.0,  aggressive: true,  killPriority: true,  speedFactor: 1.75 }
};

export const RIVAL_DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'extraHard'];

const DIRS = {
    up:    { dc: 0, dr: -1 },
    down:  { dc: 0, dr: 1 },
    left:  { dc: -1, dr: 0 },
    right: { dc: 1, dr: 0 }
};

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const key = (c) => `${c.col},${c.row}`;

function addBody(set, cells, excludeTail) {
    // Exclude the tail tip: that cell frees up on the next tick.
    const end = excludeTail ? cells.length - 1 : cells.length;
    for (let i = 0; i < end; i++) {
        set.add(key(cells[i]));
    }
}

function bfsFirstStep(head, food, blocked, inBounds) {
    if (head.col === food.col && head.row === food.row) {
        return null;
    }

    const start = key(head);
    const foodKey = key(food);
    const cameFrom = new Map();
    cameFrom.set(start, null);

    const queue = [head];
    let found = false;

    while (queue.length) {
        const cur = queue.shift();
        if (cur.col === food.col && cur.row === food.row) {
            found = true;
            break;
        }
        for (const dir of ['up', 'down', 'left', 'right']) {
            const nc = { col: cur.col + DIRS[dir].dc, row: cur.row + DIRS[dir].dr };
            const k = key(nc);
            if (cameFrom.has(k)) continue;
            if (!inBounds(nc)) continue;
            if (blocked.has(k) && k !== foodKey) continue;
            cameFrom.set(k, { cell: cur, dir });
            queue.push(nc);
        }
    }

    if (!found) {
        return null;
    }

    let curKey = foodKey;
    let firstDir = null;
    while (curKey !== start) {
        const info = cameFrom.get(curKey);
        if (!info) return null;
        firstDir = info.dir;
        curKey = key(info.cell);
    }
    return firstDir;
}

function bfsDistance(start, target, blocked, inBounds) {
    if (start.col === target.col && start.row === target.row) {
        return 0;
    }
    const targetKey = key(target);
    const seen = new Set([key(start)]);
    let frontier = [start];
    let dist = 0;

    while (frontier.length) {
        dist++;
        const next = [];
        for (const cur of frontier) {
            for (const dir of ['up', 'down', 'left', 'right']) {
                const nc = { col: cur.col + DIRS[dir].dc, row: cur.row + DIRS[dir].dr };
                const k = key(nc);
                if (k === targetKey) return dist;
                if (seen.has(k)) continue;
                if (!inBounds(nc)) continue;
                if (blocked.has(k)) continue;
                seen.add(k);
                next.push(nc);
            }
        }
        frontier = next;
    }
    return null;
}

// Reachable free cells from `start`, counting `start` itself even if it is a
// blocked cell (used for the rival's own safety check via floodFillArea, and
// for measuring how much room the player has left).
function floodFillArea(start, blocked, inBounds) {
    if (!inBounds(start) || blocked.has(key(start))) {
        return 0;
    }
    return countReachable(start, blocked, inBounds);
}

function countReachable(start, blocked, inBounds) {
    const seen = new Set([key(start)]);
    const stack = [start];
    let count = 0;
    while (stack.length) {
        const cur = stack.pop();
        count++;
        for (const dir of ['up', 'down', 'left', 'right']) {
            const nc = { col: cur.col + DIRS[dir].dc, row: cur.row + DIRS[dir].dr };
            const k = key(nc);
            if (seen.has(k)) continue;
            if (!inBounds(nc)) continue;
            if (blocked.has(k)) continue;
            seen.add(k);
            stack.push(nc);
        }
    }
    return count;
}

function survivalMove(moves, cellFor, blocked, inBounds) {
    let best = null;
    let bestArea = -1;
    for (const dir of moves) {
        const area = floodFillArea(cellFor(dir), blocked, inBounds);
        if (area > bestArea) {
            bestArea = area;
            best = dir;
        }
    }
    return best;
}

export function chooseRivalDirection(gameState) {
    const {
        bounds, food, rivalCells, rivalDirection,
        playerCells, playerDirection, ghostCells = [], spikeCells = []
    } = gameState;
    const rng = gameState.rng || Math.random;
    const diff = gameState.difficulty
        || { mistakeChance: gameState.mistakeChance || 0, aggressive: false };

    const head = rivalCells[0];

    const inBounds = (c) =>
        c.col >= bounds.xMin && c.col <= bounds.xMax &&
        c.row >= bounds.yMin && c.row <= bounds.yMax;

    // Blocked = walls (via bounds) + both snake bodies (minus their tail tips)
    // + ghost cells + spikes.
    const blocked = new Set();
    addBody(blocked, rivalCells, true);
    addBody(blocked, playerCells, true);
    ghostCells.forEach((c) => blocked.add(key(c)));
    spikeCells.forEach((c) => blocked.add(key(c)));

    const cellFor = (dir) => ({ col: head.col + DIRS[dir].dc, row: head.row + DIRS[dir].dr });

    const legal = ['up', 'down', 'left', 'right'].filter((dir) => {
        if (dir === OPPOSITE[rivalDirection]) return false;
        const nc = cellFor(dir);
        if (!inBounds(nc)) return false;
        if (blocked.has(key(nc))) return false;
        return true;
    });

    if (legal.length === 0) {
        return null; // trapped — the rival dies
    }

    // Difficulty: occasionally throw the game with a random legal move.
    if (rng() < (diff.mistakeChance || 0)) {
        return legal[Math.floor(rng() * legal.length)];
    }

    // ---- Easy: greedy path to food + flood-fill safety (legacy behaviour) ----
    if (!diff.aggressive) {
        const bfsDir = bfsFirstStep(head, food, blocked, inBounds);
        let chosen = bfsDir && legal.includes(bfsDir) ? bfsDir : null;
        if (chosen) {
            const area = floodFillArea(cellFor(chosen), blocked, inBounds);
            if (area < rivalCells.length) {
                chosen = null;
            }
        }
        if (!chosen) {
            chosen = survivalMove(legal, cellFor, blocked, inBounds);
        }
        return chosen;
    }

    // ---- Aggressive tiers (Medium / Hard / Extra Hard) ----
    const rivalLen = rivalCells.length;
    const playerLen = playerCells.length;
    const playerHead = playerCells[0];

    // Prefer moves that leave the rival with room to survive; if none exist,
    // we still have to move somewhere.
    const safeMoves = legal.filter((dir) => floodFillArea(cellFor(dir), blocked, inBounds) >= rivalLen);
    const pool = safeMoves.length ? safeMoves : legal;

    // How much room the player has left after the rival occupies `nc`.
    const playerAreaAfter = (nc) => {
        const pb = new Set(blocked);
        pb.delete(key(playerHead)); // the player can start from its own head
        pb.add(key(nc));            // the rival now sits here
        return countReachable(playerHead, pb, inBounds);
    };

    // 1) Kill priority: any safe move that traps the player in a pocket smaller
    //    than its own length (it will crash before escaping).
    if (diff.killPriority) {
        let killMove = null;
        let killArea = Infinity;
        for (const dir of pool) {
            const pa = playerAreaAfter(cellFor(dir));
            if (pa < playerLen && pa < killArea) {
                killArea = pa;
                killMove = dir;
            }
        }
        if (killMove) {
            return killMove;
        }
    }

    // The rival covers `speedFactor` cells per player cell, so it can win a
    // race even when it is somewhat farther away by grid distance.
    const speedFactor = gameState.speedFactor || 1;
    const rivalDist = bfsDistance(head, food, blocked, inBounds);
    const greedyDir = rivalDist != null ? bfsFirstStep(head, food, blocked, inBounds) : null;
    const playerDist = bfsDistance(playerHead, food, blocked, inBounds);
    const foodWinnable = rivalDist != null &&
        (playerDist == null || rivalDist <= playerDist * speedFactor + 1e-6);
    const greedySafe = greedyDir && pool.includes(greedyDir);

    // 2) Contest the food whenever it can win the race.
    if (foodWinnable && greedySafe) {
        return greedyDir;
    }

    // 3) Aggression: minimise the player's reachable area; tie-break by closing
    //    in on the player (intercept). Never step into the player's predicted
    //    next cell — that would be a mutual (both-heads) death for the rival too.
    const playerNext = playerDirection
        ? { col: playerHead.col + DIRS[playerDirection].dc, row: playerHead.row + DIRS[playerDirection].dr }
        : null;

    let best = null;
    let bestArea = Infinity;
    let bestTie = Infinity;
    for (const dir of pool) {
        const nc = cellFor(dir);
        if (playerNext && nc.col === playerNext.col && nc.row === playerNext.row) continue;
        const pa = playerAreaAfter(nc);
        const tie = Math.abs(nc.col - playerHead.col) + Math.abs(nc.row - playerHead.row);
        if (pa < bestArea || (pa === bestArea && tie < bestTie)) {
            best = dir;
            bestArea = pa;
            bestTie = tie;
        }
    }
    if (best) {
        return best;
    }

    // 4) Fallbacks: winnable food, then pure survival.
    if (foodWinnable && greedySafe) {
        return greedyDir;
    }
    return survivalMove(pool, cellFor, blocked, inBounds);
}
