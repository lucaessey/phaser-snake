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

        this.add.rectangle(0, 0, w, h, 0x000000, 0.9).setOrigin(0, 0);

        this.add.text(w / 2, 38, '👑 High Scores', {
            fontFamily: 'Arial Black', fontSize: Math.round(Math.min(40, w / 9)), color: '#ffd700', align: 'center'
        }).setOrigin(0.5);

        this._pinned = null;

        // One entry per config setup, best first.
        const entries = Object.values(getAllHighScores()).sort((a, b) => b.score - a.score);

        if (entries.length === 0) {
            this.add.text(w / 2, h / 2, 'No high scores yet.\nPlay a game to set one!', {
                fontFamily: 'Arial', fontSize: 24, color: '#ffffff', align: 'center'
            }).setOrigin(0.5);
        } else {
            const top = 96;
            const rowH = 34;
            const maxRows = Math.max(1, Math.floor((h - top - 80) / rowH));
            const shown = entries.slice(0, maxRows);
            const labelMaxW = w - 130; // leave room for the score + gaps

            shown.forEach((e, i) => {
                const y = top + i * rowH;

                // Label, truncated with an ellipsis so it can't overlap the score.
                const label = this.add.text(46, y, e.label, {
                    fontFamily: 'Arial', fontSize: 18, color: '#ffffff'
                }).setOrigin(0, 0.5);
                if (label.width > labelMaxW) {
                    let s = e.label;
                    while (s.length > 1 && label.width > labelMaxW) {
                        s = s.slice(0, -1);
                        label.setText(s.replace(/\s+$/, '') + '…');
                    }
                }

                this.add.text(w - 46, y, String(e.score), {
                    fontFamily: 'Arial Black', fontSize: 22, color: '#ffd700'
                }).setOrigin(1, 0.5);

                // Full-width invisible hit zone: hover (mouse) or tap (touch) to
                // reveal the full label in a tooltip.
                const zone = this.add.zone(0, y - rowH / 2, w, rowH).setOrigin(0, 0).setInteractive();
                zone.fullLabel = e.label;
                zone.on('pointerover', (p) => { if (!p.wasTouch && !this._pinned) this.showTooltip(e.label, y); });
                zone.on('pointerout', (p) => { if (!p.wasTouch && !this._pinned) this.hideTooltip(); });
                zone.on('pointerdown', () => {
                    if (this._pinned === zone) { this._pinned = null; this.hideTooltip(); }
                    else { this._pinned = zone; this.showTooltip(e.label, y); }
                });
            });

            if (entries.length > shown.length) {
                this.add.text(w / 2, top + shown.length * rowH + 4, `+${entries.length - shown.length} more…`, {
                    fontFamily: 'Arial', fontSize: 15, color: '#aaaaaa', align: 'center'
                }).setOrigin(0.5);
            }

            // Tapping empty space dismisses a pinned tooltip.
            this.input.on('pointerdown', (p, over) => {
                const onZone = over && over.some(o => o.fullLabel !== undefined);
                if (!onZone && this._pinned) { this._pinned = null; this.hideTooltip(); }
            });

            this.buildTooltip();
        }

        this.add.text(w / 2, h - 40, 'Back', {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6, align: 'center'
        }).setOrigin(0.5).setInteractive().on('pointerdown', () => {
            this.scene.start('TitleScreen');
        });
    }

    buildTooltip() {
        const w = this.cameras.main.width;
        this.tipText = this.add.text(0, 0, '', {
            fontFamily: 'Arial', fontSize: 15, color: '#ffffff', align: 'left',
            wordWrap: { width: Math.min(360, w - 60) }
        }).setOrigin(0.5);
        this.tipBg = this.add.rectangle(0, 0, 10, 10, 0x111111, 0.96)
            .setStrokeStyle(2, 0xffd700, 0.9).setOrigin(0.5);
        this.tooltip = this.add.container(0, 0, [this.tipBg, this.tipText]).setDepth(1000).setVisible(false);
    }

    showTooltip(fullText, rowY) {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.tipText.setText(fullText);
        this.tipBg.setSize(this.tipText.width + 22, this.tipText.height + 16);

        const halfH = this.tipBg.height / 2;
        const below = rowY < h / 2;
        let ty = rowY + (below ? halfH + 16 : -(halfH + 16));
        ty = Math.max(halfH + 6, Math.min(h - halfH - 6, ty));
        this.tooltip.setPosition(Math.round(w / 2), Math.round(ty)).setVisible(true);
    }

    hideTooltip() {
        if (this.tooltip) this.tooltip.setVisible(false);
    }
}
