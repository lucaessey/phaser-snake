import { Game as MainGame } from './scenes/Game';
import { TitleScreen } from './scenes/TitleScreen';
import { SettingsScreen } from './scenes/SettingsScreen';
import { HighScores } from './scenes/HighScores';
import { currentLayout } from './layout';
import { AUTO, Scale, Game } from 'phaser';

// The canvas is sized to fill the device (portrait on phones, landscape on
// desktop); Scale.FIT keeps it crisp and centered as the window changes.
const layout = currentLayout();

const config = {
    type: AUTO,
    width: layout.width,
    height: layout.height,
    parent: 'game-container',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        TitleScreen,
        SettingsScreen,
        HighScores,
        MainGame
    ]
};

const StartGame = (parent) => {
    const game = new Game({ ...config, parent });

    // Re-fit the canvas to the device on rotation / window resize. We resize the
    // game and re-layout menu scenes, but leave an in-progress Game alone so a
    // stray resize can't wipe out the current run.
    let resizeTimer = null;
    const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const next = currentLayout();
            const active = game.scene.getScenes(true).map(s => s.scene.key);
            if (active.includes('Game')) {
                return; // don't disrupt live gameplay
            }
            if (next.width !== game.scale.width || next.height !== game.scale.height) {
                game.scale.setGameSize(next.width, next.height);
                // Restart whichever menu scene is showing so it re-lays-out.
                const key = active[0];
                if (key) {
                    game.scene.stop(key);
                    game.scene.start(key);
                }
            }
        }, 250);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return game;
}

export default StartGame;
