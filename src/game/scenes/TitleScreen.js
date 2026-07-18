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
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Cover-fit the background (fill the screen, keep aspect, crop overflow).
        const bg = this.add.image(w / 2, h / 2, 'title_bg').setOrigin(0.5);
        const cover = Math.max(w / bg.width, h / bg.height);
        bg.setScale(cover);

        const startSize = Math.round(Math.max(30, Math.min(48, w / 11)));
        const iconSize = Math.round(Math.max(34, Math.min(52, w / 12)));

        const startButton = this.add.text(w / 2, h / 2, 'Start Game', {
            fontFamily: 'Arial Black', fontSize: startSize, color: '#000000',
            stroke: '#ffffff', strokeThickness: 8, align: 'center'
        }).setOrigin(0.5).setDepth(100).setInteractive();
        startButton.on('pointerdown', () => this.scene.start('Game'));

        // Crown -> per-setup high scores page.
        const crownBtn = this.add.text(w - 16, 14, '👑', {
            fontFamily: 'Arial', fontSize: iconSize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(1, 0).setInteractive();
        crownBtn.on('pointerdown', () => this.scene.start('HighScores'));

        const settingsBtn = this.add.text(16, 14, '⚙️', {
            fontFamily: 'Arial', fontSize: iconSize, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0, 0).setInteractive();
        settingsBtn.on('pointerdown', () => this.scene.start('SettingsScreen'));
    }
}
