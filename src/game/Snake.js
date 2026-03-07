import { Scene } from 'phaser';

export class Snake {
    constructor(scene, tileSize) {
        this.scene = scene;
        this.tileSize = tileSize;
        
        const speedInTiles = parseInt(localStorage.getItem('snakeSpeed')) || 5;
        this.speed = speedInTiles * this.tileSize; // Pixels per second
        
        // Ensure starting position is grid-aligned
        const startX = Math.floor(400 / this.tileSize) * this.tileSize + this.tileSize / 2;
        const startY = Math.floor(300 / this.tileSize) * this.tileSize + this.tileSize / 2;
        
        // Logical state (Grid Coordinates)
        // Index 0 is Head. Index 1 is Body[0], etc.
        this.gridCoords = [];
        this.gridCoords.push({ x: startX, y: startY }); // Head
        this.gridCoords.push({ x: startX - this.tileSize, y: startY }); // Body 1
        this.gridCoords.push({ x: startX - (2 * this.tileSize), y: startY }); // Body 2 (Tail)

        // Visual Sprites
        this.body = []; // Stores body segments (excluding head)
        this.corners = this.scene.add.group(); // Group for static corner sprites
        
        this.head = this.scene.physics.add.image(startX, startY, 'head_right');
        this.head.setDisplaySize(this.tileSize, this.tileSize);
        this.head.setDepth(2); // Head always on top
        
        // Create initial body sprites
        // Note: this.body[0] corresponds to this.gridCoords[1]
        const bodyPart1 = this.scene.add.image(this.gridCoords[1].x, this.gridCoords[1].y, 'body_horizontal');
        bodyPart1.setDisplaySize(this.tileSize, this.tileSize);
        bodyPart1.setDepth(0);
        this.body.push(bodyPart1);

        const bodyPart2 = this.scene.add.image(this.gridCoords[2].x, this.gridCoords[2].y, 'tail_right');
        bodyPart2.setDisplaySize(this.tileSize, this.tileSize);
        bodyPart2.setDepth(2); // Tail also on top (like head)
        this.body.push(bodyPart2);

        this.tail = bodyPart2;
        
        this.direction = 'right';
        this.nextDirection = 'right';
        
        this.accumulatedMove = 0; // In pixels
        this.dead = false;
        
        // Initial texture update
        this.updateBodyTextures();
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
        const newPart = this.scene.add.image(lastCoord.x, lastCoord.y, 'body_horizontal');
        newPart.setDisplaySize(this.tileSize, this.tileSize);
        newPart.setDepth(2); // New tail on top
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
    }

    spawnCorner(x, y, fromDir, toDir) {
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

        const corner = this.scene.add.image(x, y, texture);
        corner.setDisplaySize(this.tileSize, this.tileSize);
        corner.setDepth(1); // Corners above body
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
        this.head.setTexture(`head_${this.direction}`);
    
        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];
            const coord = this.gridCoords[i + 1];
            
            // Check if Tail
            const isTail = (i === this.body.length - 1);

            if (isTail) {
                // Tail points towards the segment before it
                const prevCoord = this.gridCoords[i]; // Towards head
                
                if (prevCoord.x === coord.x) {
                    segment.setTexture(prevCoord.y > coord.y ? 'tail_up' : 'tail_down');
                }
                else {
                    segment.setTexture(prevCoord.x > coord.x ? 'tail_left' : 'tail_right');
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
                    segment.setTexture('body_vertical');
                } else {
                    segment.setTexture('body_horizontal');
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
