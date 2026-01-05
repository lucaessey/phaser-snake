import { Scene } from 'phaser';
import { Snake } from '../Snake';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload() {
        this.load.image('head_up', 'assets/head_up.png');
        this.load.image('head_down', 'assets/head_down.png');
        this.load.image('head_left', 'assets/head_left.png');
        this.load.image('head_right', 'assets/head_right.png');
        this.load.image('body_vertical', 'assets/body_vertical.png');
        this.load.image('body_horizontal', 'assets/body_horizontal.png');
        this.load.image('body_topleft', 'assets/body_topleft.png');
        this.load.image('body_topright', 'assets/body_topright.png');
        this.load.image('body_bottomleft', 'assets/body_bottomleft.png');
        this.load.image('body_bottomright', 'assets/body_bottomright.png');
        this.load.image('tail_up', 'assets/tail_up.png');
        this.load.image('tail_down', 'assets/tail_down.png');
        this.load.image('tail_left', 'assets/tail_left.png');
        this.load.image('tail_right', 'assets/tail_right.png');
        this.load.image('apple', 'assets/apple.png');
    }

    create ()
    {
        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });

        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.highScoreText = this.add.text(this.cameras.main.width - 20, 10, `High Score: ${this.highScore}`, { 
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff', align: 'right' 
        }).setOrigin(1, 0);

        this.walls = this.physics.add.staticGroup();

        // Top wall moved down to y=48 (leaving space for score)
        this.walls.create(0, 48, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, 16).refreshBody();
        // Bottom wall
        this.walls.create(0, this.cameras.main.height - 16, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, 16).refreshBody();
        // Left wall adjusted to start below top wall
        this.walls.create(0, 48, null).setOrigin(0, 0).setDisplaySize(16, this.cameras.main.height - 48).refreshBody();
        // Right wall adjusted to start below top wall
        this.walls.create(this.cameras.main.width - 16, 48, null).setOrigin(0, 0).setDisplaySize(16, this.cameras.main.height - 48).refreshBody();

        this.snake = new Snake(this);

        this.physics.add.collider(this.snake.getHead(), this.walls, () => {
            this.snake.dead = true;
        });

        this.apple = this.physics.add.sprite(0, 0, 'apple');
        this.spawnApple();

        this.physics.add.overlap(this.snake.getHead(), this.apple, () => {
            this.eatApple();
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    spawnApple() {
        // Grid size is 16
        // Width: 1024 / 16 = 64 tiles. Walls at 0 and 63. Playable x: 1 to 62.
        // Height: 768 / 16 = 48 tiles. 
        // Top wall at y=48 (pixels) -> which is 3 tiles (0, 16, 32 occupied by UI/empty, wall starts at 48?).
        // Actually, wall is at 48px. 48/16 = 3. So wall occupies row index 3.
        // Playable area starts at row index 4 (y=64).
        // Bottom wall at 768-16 = 752. 752/16 = 47. Wall occupies row index 47.
        // Playable y: 4 to 46.

        const xMin = 1;
        const xMax = (this.cameras.main.width / 16) - 2;
        const yMin = 4;
        const yMax = (this.cameras.main.height / 16) - 2;

        const x = Phaser.Math.Between(xMin, xMax) * 16;
        const y = Phaser.Math.Between(yMin, yMax) * 16;

        this.apple.setPosition(x, y);
    }

    eatApple() {
        this.score++;
        this.scoreText.setText('Score: ' + this.score);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText('High Score: ' + this.highScore);
            localStorage.setItem('highScore', this.highScore);
        }

        this.snake.grow();
        this.spawnApple();
    }

    update(time) {
        if (this.snake.dead) {
            this.scene.start('TitleScreen');
        }

        if (this.cursors.left.isDown) {
            this.snake.changeDirection('left');
        } else if (this.cursors.right.isDown) {
            this.snake.changeDirection('right');
        } else if (this.cursors.up.isDown) {
            this.snake.changeDirection('up');
        } else if (this.cursors.down.isDown) {
            this.snake.changeDirection('down');
        }

        this.snake.update(time);
    }
}

