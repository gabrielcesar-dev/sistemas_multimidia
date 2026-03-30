import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class RockGrassGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.3, 1.7);
        super(scene, x, y, KEYS.ROCK_GRASS_GREEN, scale, true);
    }
}
