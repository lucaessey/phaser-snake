import { Scene } from 'phaser';
import { SKINS, createSkinTextures } from '../skins';
import { createMenu } from '../menu';
import { preloadSnakeAssets } from '../snakeAssets';

export class TitleScreen extends Scene {
    constructor() {
        super('TitleScreen');
    }

    preload() {
        preloadSnakeAssets(this);
    }

    create(data = {}) {
        // Release the arrow keys captured by gameplay so native menu controls work.
        this.input.keyboard.clearCaptures();
        for (const skin of SKINS) createSkinTextures(this, skin.id);
        const dispose = createMenu(this, data.tab || 'home');
        this.events.once('shutdown', dispose);
    }
}
