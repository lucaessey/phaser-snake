import { Scene } from 'phaser';

// Selectable snake colors. Applied as a tint over the green sprite art;
// index 0 ('Classic') uses white, which leaves the original art untouched.
export const SNAKE_COLORS = [
    { name: 'Classic', tint: 0xffffff },
    { name: 'Blue',    tint: 0x66b3ff },
    { name: 'Red',     tint: 0xff6b6b },
    { name: 'Purple',  tint: 0xc77dff },
    { name: 'Orange',  tint: 0xffb347 },
    { name: 'Pink',    tint: 0xff9ff3 },
    { name: 'Gold',    tint: 0xffe066 },
    { name: 'Cyan',    tint: 0x66f0e0 },
];

export class Snake {
    // options (all optional — defaults reproduce the original player snake):
    //   startCol, startRow : head cell (grid coords). Default ~ (400, 300).
    //   direction          : initial travel direction. Default 'right'.
    //   length             : starting segment count. Default 3.
    //   color              : tint override. Default = player's saved color.
    //   isRival            : marks this as the AI snake.
    //   headMarker         : texture key drawn over the head (visual distinction).
    //   onTick             : callback fired at the end of every logical tick.
    constructor(scene, tileSize, options = {}) {
        this.scene = scene;
        this.tileSize = tileSize;

        const speedInTiles = parseInt(localStorage.getItem('snakeSpeed')) || 5;
        this.speed = speedInTiles * this.tileSize; // Pixels per second

        if (options.color !== undefined) {
            this.color = options.color;
        } else {
            const colorIndex = parseInt(localStorage.getItem('snakeColorIndex')) || 0;
            this.color = (SNAKE_COLORS[colorIndex] || SNAKE_COLORS[0]).tint;
        }

        // Skin selects an alternate texture set via a key prefix. '' is the
        // classic green sprite art; other skins (e.g. 'ttt') supply their own
        // textures and render in their natural colors (the tint is ignored).
        const skin = options.skin || 'classic';
        this.skinPrefix = skin === 'classic' ? '' : `${skin}_`;
        // The 'black' skin is a chain of separate numbered tiles: no directional
        // shapes, no corner pieces — every block is a square that alternates
        // between a '6' and a '7' by its position from the head.
        this.blockSkin = skin === 'black';
        // The 'brainrot' skin is also separate tiles, but each block shows a
        // random one of 5 images (fixed once assigned). Uses tiles 'tile_0..4'.
        this.imageSkin = skin === 'brainrot';

        this.isRival = !!options.isRival;
        this.onTick = options.onTick || null;

        const length = Math.max(2, options.length || 3);
        const direction = options.direction || 'right';

        // Head cell, grid-aligned to the tile center.
        const startCol = options.startCol !== undefined
            ? options.startCol : Math.floor(400 / this.tileSize);
        const startRow = options.startRow !== undefined
            ? options.startRow : Math.floor(300 / this.tileSize);
        const startX = startCol * this.tileSize + this.tileSize / 2;
        const startY = startRow * this.tileSize + this.tileSize / 2;

        // Body trails opposite to the travel direction.
        const back = {
            right: { dx: -1, dy: 0 }, left: { dx: 1, dy: 0 },
            up: { dx: 0, dy: 1 }, down: { dx: 0, dy: -1 }
        }[direction];

        // Logical state (Grid Coordinates). Index 0 is Head, last is Tail.
        this.gridCoords = [];
        for (let i = 0; i < length; i++) {
            this.gridCoords.push({
                x: startX + back.dx * i * this.tileSize,
                y: startY + back.dy * i * this.tileSize
            });
        }

        // Visual Sprites
        this.body = []; // Stores body segments (excluding head)
        this.corners = this.scene.add.group(); // Group for static corner sprites

        let headKey;
        if (this.imageSkin) headKey = this.randomImgKey();
        else if (this.blockSkin) headKey = this.blockTex(0);
        else headKey = this.tex('head_right');
        this.head = this.scene.physics.add.image(startX, startY, headKey);
        this.head.setDisplaySize(this.tileSize, this.tileSize);
        this.head.setDepth(2); // Head always on top

        // Create body sprites for gridCoords[1..end]; the last one is the tail.
        for (let i = 1; i < length; i++) {
            const isTail = (i === length - 1);
            let key;
            if (this.imageSkin) key = this.randomImgKey();
            else if (this.blockSkin) key = this.blockTex(i);
            else key = isTail ? this.tex('tail_right') : this.tex('body_horizontal');
            const part = this.scene.add.image(this.gridCoords[i].x, this.gridCoords[i].y, key);
            part.setDisplaySize(this.tileSize, this.tileSize);
            part.setDepth(isTail ? 2 : 0); // Tail on top (like head)
            this.body.push(part);
        }
        this.tail = this.body[this.body.length - 1];

        this.direction = direction;
        this.nextDirection = direction;

        this.accumulatedMove = 0; // In pixels
        this.dead = false;

        // Optional head marker (e.g. for the rival), drawn above the head.
        if (options.headMarker) {
            this.headMarker = this.scene.add.image(startX, startY, options.headMarker);
            this.headMarker.setDisplaySize(this.tileSize, this.tileSize);
            this.headMarker.setDepth(3);
        } else {
            this.headMarker = null;
        }

        // Initial texture update
        this.updateBodyTextures();
        this.applyColor();
    }

    // Remove every sprite this snake owns (used when the rival dies).
    destroy() {
        this.head.destroy();
        this.body.forEach(part => part.destroy());
        this.corners.clear(true, true);
        if (this.headMarker) {
            this.headMarker.destroy();
        }
    }

    // Prefix a base texture name with the active skin (e.g. 'head_up' ->
    // 'ttt_head_up'). Classic skin returns the name unchanged.
    tex(name) {
        return this.skinPrefix + name;
    }

    // Block-skin tile for a segment at the given distance from the head:
    // even -> '6' (head is 0), odd -> '7'. Produces the alternating pattern.
    blockTex(chainIndex) {
        return `${this.skinPrefix}tile_${chainIndex % 2 === 0 ? '6' : '7'}`;
    }

    // Image-skin: pick a random tile (0..4) for a new block. The choice is baked
    // onto the sprite (sprite.imgVar) so it stays fixed as the snake moves.
    randomImgKey() {
        return `${this.skinPrefix}tile_${Phaser.Math.Between(0, 4)}`;
    }

    applyColor() {
        // Skinned snakes keep their own artwork colors; only the classic set is
        // tinted by the chosen snake color.
        const tint = this.skinPrefix ? 0xffffff : this.color;
        this.head.setTint(tint);
        this.body.forEach(part => part.setTint(tint));
        this.corners.getChildren().forEach(corner => corner.setTint(tint));
    }

    setColor(tint) {
        this.color = tint;
        this.applyColor();
    }

    // Teleport the whole snake to a new straight run of cells.
    // cells: pixel-center coords, head first, same length as gridCoords.
    relocate(cells, direction) {
        for (let i = 0; i < this.gridCoords.length; i++) {
            this.gridCoords[i].x = cells[i].x;
            this.gridCoords[i].y = cells[i].y;
        }

        this.direction = direction;
        this.nextDirection = direction;
        this.accumulatedMove = 0;

        // The snake is straight after teleporting, so drop all corner pieces
        this.corners.clear(true, true);

        this.updateBodyTextures();
        this.updateVisuals(0);
    }

    grow() {
        // Add a new segment at the position of the current last segment (tail)
        // It will effectively stay in place for one tick while the rest moves away
        const lastCoord = this.gridCoords[this.gridCoords.length - 1];
        
        // Logical segment
        this.gridCoords.push({ x: lastCoord.x, y: lastCoord.y });
        
        // The old tail becomes a normal body part, so reset its depth
        this.tail.setDepth(0);

        // Visual segment
        let newKey;
        if (this.imageSkin) newKey = this.randomImgKey();
        else if (this.blockSkin) newKey = this.blockTex(this.gridCoords.length - 1);
        else newKey = this.tex('body_horizontal');
        const newPart = this.scene.add.image(lastCoord.x, lastCoord.y, newKey);
        newPart.setDisplaySize(this.tileSize, this.tileSize);
        newPart.setDepth(2); // New tail on top
        newPart.setTint(this.skinPrefix ? 0xffffff : this.color);
        this.body.push(newPart);
        
        this.tail = newPart;
    }

    update(time, delta) {
        if (this.dead) return;

        // Move accumulation
        const moveStep = (this.speed * delta) / 1000;
        this.accumulatedMove += moveStep;

        // Check if we reached the next tile
        if (this.accumulatedMove >= this.tileSize) {
            this.accumulatedMove -= this.tileSize;
            this.tick();
        }

        // Visual Interpolation
        // t is 0.0 to 1.0 representing progress from current grid cell to next
        const t = this.accumulatedMove / this.tileSize;
        this.updateVisuals(t);
    }

    tick() {
        const oldDirection = this.direction;
        const oldHeadX = this.gridCoords[0].x;
        const oldHeadY = this.gridCoords[0].y;

        // 1. Update Direction
        this.direction = this.nextDirection;

        // 3. Shift Body Segments
        // Start from the tail and move each segment to the position of the one before it
        for (let i = this.gridCoords.length - 1; i > 0; i--) {
            this.gridCoords[i].x = this.gridCoords[i - 1].x;
            this.gridCoords[i].y = this.gridCoords[i - 1].y;
        }

        // 4. Move Head
        switch (oldDirection) {
            case 'up':
                this.gridCoords[0].y -= this.tileSize;
                break;
            case 'down':
                this.gridCoords[0].y += this.tileSize;
                break;
            case 'left':
                this.gridCoords[0].x -= this.tileSize;
                break;
            case 'right':
                this.gridCoords[0].x += this.tileSize;
                break;
        }

        // 2. Check for Turn and Spawn Corner
        if (this.direction !== oldDirection) {
            this.spawnCorner(this.gridCoords[0].x, this.gridCoords[0].y, oldDirection, this.direction);
        }

        // 5. Clean up Corners
        // Remove corners that are no longer occupied by any part of the snake (excluding the tail)
        this.corners.getChildren().forEach(corner => {
            let occupiedByNonTail = false;
            // Check if any grid coord (except tail) matches the corner
            for (let i = 0; i < this.gridCoords.length - 1; i++) {
                if (Math.abs(this.gridCoords[i].x - corner.x) < 1 && 
                    Math.abs(this.gridCoords[i].y - corner.y) < 1) {
                    occupiedByNonTail = true;
                    break;
                }
            }
            if (!occupiedByNonTail) {
                this.corners.remove(corner, true, true);
            }
        });

        // 6. Check Collision with Self
        const head = this.gridCoords[0];
        // Start from index 1 (first body part)
        for (let i = 1; i < this.gridCoords.length; i++) {
            if (this.gridCoords[i].x === head.x && this.gridCoords[i].y === head.y) {
                this.dead = true;
            }
        }

        // 7. Update Textures (based on new logical positions)
        this.updateBodyTextures();

        // 8. Notify the scene that one logical step has completed. This is the
        //    single "game tick" that drives the rival, collisions, and the ghost.
        if (this.onTick) {
            this.onTick();
        }
    }

    spawnCorner(x, y, fromDir, toDir) {
        // Separate-tile skins have no corner pieces.
        if (this.blockSkin || this.imageSkin) {
            return;
        }

        let texture = 'body_bottomleft'; // Default

        // Logic map:
        // Right -> Down: Bottom-Left
        // Right -> Up: Top-Left
        // Left -> Down: Bottom-Right
        // Left -> Up: Top-Right
        // Up -> Right: Bottom-Right
        // Up -> Left: Bottom-Left
        // Down -> Right: Top-Right
        // Down -> Left: Top-Left

        if (fromDir === 'right') {
            if (toDir === 'down') texture = 'body_bottomleft';
            else if (toDir === 'up') texture = 'body_topleft';
        } else if (fromDir === 'left') {
            if (toDir === 'down') texture = 'body_bottomright';
            else if (toDir === 'up') texture = 'body_topright';
        } else if (fromDir === 'up') {
            if (toDir === 'right') texture = 'body_bottomright';
            else if (toDir === 'left') texture = 'body_bottomleft';
        } else if (fromDir === 'down') {
            if (toDir === 'right') texture = 'body_topright';
            else if (toDir === 'left') texture = 'body_topleft';
        }

        const corner = this.scene.add.image(x, y, this.tex(texture));
        corner.setDisplaySize(this.tileSize, this.tileSize);
        corner.setDepth(1); // Corners above body
        corner.setTint(this.skinPrefix ? 0xffffff : this.color);
        this.corners.add(corner);
    }

    updateVisuals(t) {
        // Head
        let headX = this.gridCoords[0].x;
        let headY = this.gridCoords[0].y;
        
        switch (this.direction) {
            case 'up': headY -= this.tileSize * t; break;
            case 'down': headY += this.tileSize * t; break;
            case 'left': headX -= this.tileSize * t; break;
            case 'right': headX += this.tileSize * t; break;
        }
        
        this.head.setPosition(headX, headY);

        if (this.headMarker) {
            this.headMarker.setPosition(headX, headY);
        }

        // Body Segments
        for (let i = 0; i < this.body.length; i++) {
            const currentPos = this.gridCoords[i + 1]; // Where the segment is logically
            const targetPos = this.gridCoords[i];     // Where it's going (the segment in front)
            
            // Linear interpolation
            const x = Phaser.Math.Linear(currentPos.x, targetPos.x, t);
            const y = Phaser.Math.Linear(currentPos.y, targetPos.y, t);
            
            const segment = this.body[i];
            segment.setPosition(x, y);

            // Skip cropping for the tail (it should render ON TOP of corners)
            if (i === this.body.length - 1) {
                segment.setCrop();
                continue;
            }

            // Cropping Logic
            let cutLeft = 0;
            let cutRight = 0;
            let cutTop = 0;
            let cutBottom = 0;

            // Check overlap with corner at Start (Moving Away from)
            if (this.isCornerAt(currentPos.x, currentPos.y)) {
                const dx = Math.abs(x - currentPos.x);
                const dy = Math.abs(y - currentPos.y);
                const overlapX = Math.max(0, this.tileSize - dx);
                const overlapY = Math.max(0, this.tileSize - dy);

                if (x > currentPos.x) cutLeft = overlapX;      // Moving Right
                else if (x < currentPos.x) cutRight = overlapX; // Moving Left
                else if (y > currentPos.y) cutTop = overlapY;   // Moving Down
                else if (y < currentPos.y) cutBottom = overlapY;// Moving Up
            }

            // Check overlap with corner at End (Moving Towards)
            if (this.isCornerAt(targetPos.x, targetPos.y)) {
                const dx = Math.abs(x - targetPos.x);
                const dy = Math.abs(y - targetPos.y);
                const overlapX = Math.max(0, this.tileSize - dx);
                const overlapY = Math.max(0, this.tileSize - dy);

                if (x < targetPos.x) cutRight = overlapX;      // Moving Right
                else if (x > targetPos.x) cutLeft = overlapX;  // Moving Left
                else if (y < targetPos.y) cutBottom = overlapY;// Moving Down
                else if (y > targetPos.y) cutTop = overlapY;   // Moving Up
            }

            const scaleX = segment.width / this.tileSize;
            const scaleY = segment.height / this.tileSize;

            segment.setCrop(
                cutLeft * scaleX, 
                cutTop * scaleY, 
                (this.tileSize - cutLeft - cutRight) * scaleX, 
                (this.tileSize - cutTop - cutBottom) * scaleY
            );
        }
    }

    isCornerAt(x, y) {
        const corners = this.corners.getChildren();
        for (let corner of corners) {
            if (Phaser.Math.Distance.Between(corner.x, corner.y, x, y) < 1) {
                return true;
            }
        }
        return false;
    }

    updateBodyTextures() {
        // Image skin: each block's random tile is baked in at creation and never
        // changes, so there is nothing to update here.
        if (this.imageSkin) {
            return;
        }

        // Block skin: every segment is a numbered tile, alternating 6/7 from the
        // head. No directional shapes.
        if (this.blockSkin) {
            this.head.setTexture(this.blockTex(0));
            for (let i = 0; i < this.body.length; i++) {
                this.body[i].setTexture(this.blockTex(i + 1));
            }
            return;
        }

        this.head.setTexture(this.tex(`head_${this.direction}`));

        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];
            const coord = this.gridCoords[i + 1];

            // Check if Tail
            const isTail = (i === this.body.length - 1);

            if (isTail) {
                // Tail points towards the segment before it
                const prevCoord = this.gridCoords[i]; // Towards head

                if (prevCoord.x === coord.x) {
                    segment.setTexture(this.tex(prevCoord.y > coord.y ? 'tail_up' : 'tail_down'));
                }
                else {
                    segment.setTexture(this.tex(prevCoord.x > coord.x ? 'tail_left' : 'tail_right'));
                }
            }
            else {
                // Body Segment: Determine if Horizontal or Vertical based on movement path
                // Moving FROM coord TO gridCoords[i]
                // But wait, the texture represents the segment ITSELF.
                // The segment connects gridCoords[i+1] and gridCoords[i].
                // So check the relationship between them.

                const targetCoord = this.gridCoords[i];

                if (coord.x === targetCoord.x) {
                    segment.setTexture(this.tex('body_vertical'));
                } else {
                    segment.setTexture(this.tex('body_horizontal'));
                }
            }
        }
    }

    changeDirection(direction) {
        if (this.direction === 'up' && direction === 'down' ||
            this.direction === 'down' && direction === 'up' ||
            this.direction === 'left' && direction === 'right' ||
            this.direction === 'right' && direction === 'left') {
            return;
        }
        this.nextDirection = direction;
    }

    getHead() {
        return this.head;
    }
}
