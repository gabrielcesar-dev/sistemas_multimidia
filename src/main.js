import BootScene from './scenes/BootScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import MenuScene from './scenes/MenuScene.js';
import MenuDemoScene from './scenes/MenuDemoScene.js';
import { Level1, Level2 } from './scenes/PlayScene.js';
import HudScene from './scenes/HudScene.js';

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
            debug: false,
        }
    },
    scene: [BootScene, MenuDemoScene, MenuScene, LevelSelectScene, Level1, Level2, HudScene]
};

const game = new Phaser.Game(config);
