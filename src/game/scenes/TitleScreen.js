import { Scene } from 'phaser';

export class TitleScreen extends Scene
{
    constructor ()
    {
        super('TitleScreen');
    }

    preload ()
    {
        this.load.image('title_bg', 'assets/preview_937 (1).png');
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

        // Crown opens the per-setup high scores page.
        const crownBtn = this.add.text(this.cameras.main.width - 20, 20, '👑', {
            fontFamily: 'Arial', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(1, 0).setInteractive();

        crownBtn.on('pointerdown', () => {
            this.scene.start('HighScores');
        });

        const settingsBtn = this.add.text(20, 20, '⚙️', {
            fontFamily: 'Arial', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0, 0).setInteractive();

        settingsBtn.on('pointerdown', () => {
            this.scene.start('SettingsScreen');
        });
    }
}
