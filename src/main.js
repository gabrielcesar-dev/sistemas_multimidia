import BootScene from './scenes/BootScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import MenuScene from './scenes/MenuScene.js';
import Level1 from './scenes/Level1.js';
import Level2 from './scenes/Level2.js';

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
    scene: [BootScene, MenuScene, CharacterSelectScene, LevelSelectScene, Level1, Level2]
};

const game = new Phaser.Game(config);
