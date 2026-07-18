import { Scene } from 'phaser';
import { getAllHighScores } from '../highscores';

export class HighScores extends Scene
{
    constructor ()
    {
        super('HighScores');
    }

    create ()
    {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.rectangle(0, 0, w, h, 0x000000, 0.88).setOrigin(0, 0);

        this.add.text(w / 2, 40, '👑 High Scores', {
            fontFamily: 'Arial Black', fontSize: 40, color: '#ffd700', align: 'center'
        }).setOrigin(0.5);

        // One entry per config setup, best first.
        const entries = Object.values(getAllHighScores()).sort((a, b) => b.score - a.score);

        if (entries.length === 0) {
            this.add.text(w / 2, h / 2, 'No high scores yet.\nPlay a game to set one!', {
                fontFamily: 'Arial', fontSize: 26, color: '#ffffff', align: 'center'
            }).setOrigin(0.5);
        } else {
            const top = 110;
            const rowH = 34;
            const maxRows = Math.floor((h - top - 90) / rowH);
            const shown = entries.slice(0, maxRows);

            shown.forEach((e, i) => {
                const y = top + i * rowH;
                this.add.text(50, y, e.label, {
                    fontFamily: 'Arial', fontSize: 18, color: '#ffffff'
                }).setOrigin(0, 0.5);
                this.add.text(w - 50, y, String(e.score), {
                    fontFamily: 'Arial Black', fontSize: 22, color: '#ffd700'
                }).setOrigin(1, 0.5);
            });

            if (entries.length > shown.length) {
                this.add.text(w / 2, top + shown.length * rowH + 6, `+${entries.length - shown.length} more…`, {
                    fontFamily: 'Arial', fontSize: 16, color: '#aaaaaa', align: 'center'
                }).setOrigin(0.5);
            }
        }

        this.add.text(w / 2, h - 45, 'Back', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('TitleScreen');
        });
    }
}
