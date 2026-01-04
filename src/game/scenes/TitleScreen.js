import { Scene } from 'phaser';

export class TitleScreen extends Scene
{
    constructor ()
    {
        super('TitleScreen');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor('#add8e6');

        const startButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        startButton.setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
