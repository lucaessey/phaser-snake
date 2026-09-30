import { Scene } from 'phaser';

// Retain the scene name for callers while settings live in the shared menu.
export class SettingsScreen extends Scene {
    constructor() {
        super('SettingsScreen');
    }

    create() {
        this.scene.start('TitleScreen', { tab: 'settings' });
    }
}
