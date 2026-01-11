import { Scene } from 'phaser';

export class TitleScreen extends Scene
{
    constructor ()
    {
        super('TitleScreen');
    }

    preload ()
    {
        this.load.image('title_bg', 'assets/istockphoto-2174107271-612x612.jpg');
    }

    create ()
    {
        this.add.image(0, 0, 'title_bg').setOrigin(0, 0).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const startButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#000000',
            stroke: '#ffffff', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        startButton.setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        const highScore = localStorage.getItem('highScore') || 0;
        this.add.text(this.cameras.main.width - 20, 20, `High Score: ${highScore}`, {
            fontFamily: 'Arial', fontSize: 24, color: '#000000',
            stroke: '#ffffff', strokeThickness: 4,
            align: 'right'
        }).setOrigin(1, 0);
    }
}
