import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class TreeTrunk2GrassGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.4, 1.9);
        super(scene, x, y, KEYS.TREE_TRUNK_2_GRASS_GREEN, scale, true);
    }
}
