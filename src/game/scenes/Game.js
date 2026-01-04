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
    }

    create ()
    {
        this.walls = this.physics.add.staticGroup();

        this.walls.create(0, 0, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, 16).refreshBody();
        this.walls.create(0, this.cameras.main.height - 16, null).setOrigin(0, 0).setDisplaySize(this.cameras.main.width, 16).refreshBody();
        this.walls.create(0, 0, null).setOrigin(0, 0).setDisplaySize(16, this.cameras.main.height).refreshBody();
        this.walls.create(this.cameras.main.width - 16, 0, null).setOrigin(0, 0).setDisplaySize(16, this.cameras.main.height).refreshBody();

        this.snake = new Snake(this);

        this.physics.add.collider(this.snake.getHead(), this.walls, () => {
            this.snake.dead = true;
        });

        this.cursors = this.input.keyboard.createCursorKeys();
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

