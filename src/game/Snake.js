import { Scene } from 'phaser';

export class Snake {
    constructor(scene) {
        this.scene = scene;
        this.headPosition = new Phaser.Geom.Point(400, 300);
        this.body = [];
        this.head = this.scene.physics.add.image(this.headPosition.x, this.headPosition.y, 'head_right');
        this.tail = this.head;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.speed = 16;
        this.moveTime = 0;
        this.dead = false;

        this.body.push(this.scene.add.image(this.headPosition.x - 16, this.headPosition.y, 'body_horizontal'));
        this.body.push(this.scene.add.image(this.headPosition.x - 32, this.headPosition.y, 'tail_right'));
    }

    grow() {
        const newPart = this.scene.add.image(this.tail.x, this.tail.y, 'body_horizontal');
        this.body.push(newPart);
        this.tail = newPart;
    }

    update(time) {
        if (time >= this.moveTime) {
            return this.move(time);
        }
    }

    move(time) {
        // Update head position based on the current direction
        switch (this.direction) {
            case 'up':
                this.headPosition.y -= this.speed;
                break;
            case 'down':
                this.headPosition.y += this.speed;
                break;
            case 'left':
                this.headPosition.x -= this.speed;
                break;
            case 'right':
                this.headPosition.x += this.speed;
                break;
        }

        // Update body: shift the body segments and update the head position
        const oldHeadPosition = new Phaser.Geom.Point(this.head.x, this.head.y);
        this.head.setPosition(this.headPosition.x, this.headPosition.y);
        let lastPosition = oldHeadPosition;

        this.body.forEach(part => {
            const oldPartPosition = new Phaser.Geom.Point(part.x, part.y);
            part.setPosition(lastPosition.x, lastPosition.y);
            lastPosition = oldPartPosition;
        });


        // Update the direction for the next move
        this.direction = this.nextDirection;

        // Update body and tail textures
        this.updateBodyTextures();

        // Update move time
        this.moveTime = time + 200;

        return true;
    }

    updateBodyTextures() {
        this.head.setTexture(`head_${this.direction}`);
    
        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];
            const nextSegment = i < this.body.length - 1 ? this.body[i + 1] : null;
            const prevSegment = i > 0 ? this.body[i - 1] : this.head;
    
            if (!nextSegment) { // Tail
                if (prevSegment.x === segment.x) {
                    segment.setTexture(prevSegment.y > segment.y ? 'tail_up' : 'tail_down');
                }
                else {
                    segment.setTexture(prevSegment.x > segment.x ? 'tail_left' : 'tail_right');
                }
            }
            else { // Body
                if (prevSegment.x === nextSegment.x) {
                    segment.setTexture('body_vertical');
                }
                else if (prevSegment.y === nextSegment.y) {
                    segment.setTexture('body_horizontal');
                }
                else {
                    // Corners
                    if ((prevSegment.x < segment.x && nextSegment.y > segment.y) || (prevSegment.y > segment.y && nextSegment.x < segment.x)) {
                        segment.setTexture('body_bottomleft');
                    }
                    else if ((prevSegment.x > segment.x && nextSegment.y > segment.y) || (prevSegment.y > segment.y && nextSegment.x > segment.x)) {
                        segment.setTexture('body_bottomright');
                    }
                    else if ((prevSegment.x < segment.x && nextSegment.y < segment.y) || (prevSegment.y < segment.y && nextSegment.x < segment.x)) {
                        segment.setTexture('body_topleft');
                    }
                    else {
                        segment.setTexture('body_topright');
                    }
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

