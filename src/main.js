import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import Level1 from './scenes/Level1.js';

const config = {
    type: Phaser.AUTO,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scene: [BootScene, MenuScene, Level1]
};

const game = new Phaser.Game(config);
