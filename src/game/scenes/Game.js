import { Scene } from 'phaser';
import { Snake } from '../Snake';

const TILE_SIZE = 32;

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
        this.load.image('bannana', 'assets/Bannana.png');
        this.load.image('eggplant', 'assets/Eggplant.png');
        this.load.image('jarry', 'assets/Jarry.png');
        this.load.image('sushi', 'assets/Sushi.png');
    }

    create ()
    {
        this.score = 0;
        this.scoreText = this.add.text(10, 10, 'Score: 0', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' });

        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.highScoreText = this.add.text(this.cameras.main.width - 20, 10, `High Score: ${this.highScore}`, { 
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff', align: 'right' 
        }).setOrigin(1, 0);

        const graphics = this.add.graphics();
        const lightGreen = 0x4caf50;
        const darkGreen = 0x388e3c;
        
        const cols = this.cameras.main.width / TILE_SIZE;
        const rows = this.cameras.main.height / TILE_SIZE;
        
        for (let row = 3; row < rows - 1; row++) {
            for (let col = 1; col < cols - 1; col++) {
                graphics.fillStyle((row + col) % 2 === 0 ? lightGreen : darkGreen, 1);
                graphics.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }

        this.walls = this.physics.add.staticGroup();

        const topWallY = 2 * TILE_SIZE;

        // Top wall
        this.walls.create(0, topWallY, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, TILE_SIZE).refreshBody();
        // Bottom wall
        this.walls.create(0, this.cameras.main.height - TILE_SIZE, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, TILE_SIZE).refreshBody();
        // Left wall
        this.walls.create(0, topWallY, null).setOrigin(0, 0).setDisplaySize(TILE_SIZE, this.cameras.main.height - topWallY).refreshBody();
        // Right wall
        this.walls.create(this.cameras.main.width - TILE_SIZE, topWallY, null).setOrigin(0, 0).setDisplaySize(TILE_SIZE, this.cameras.main.height - topWallY).refreshBody();

        this.snake = new Snake(this, TILE_SIZE);

        this.physics.add.collider(this.snake.getHead(), this.walls, () => {
            this.snake.dead = true;
        });

        const foodType = localStorage.getItem('foodType') || 'apple';
        this.apple = this.physics.add.sprite(0, 0, foodType);
        this.apple.setDisplaySize(TILE_SIZE, TILE_SIZE);
        this.spawnApple();

        this.physics.add.overlap(this.snake.getHead(), this.apple, () => {
            this.eatApple();
        });

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    spawnApple() {
        const xMin = 1;
        const xMax = (this.cameras.main.width / TILE_SIZE) - 2;
        const yMin = 3;
        const yMax = (this.cameras.main.height / TILE_SIZE) - 2;

        const x = Phaser.Math.Between(xMin, xMax) * TILE_SIZE + TILE_SIZE / 2;
        const y = Phaser.Math.Between(yMin, yMax) * TILE_SIZE + TILE_SIZE / 2;

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

    update(time, delta) {
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

        this.snake.update(time, delta);
    }
}

