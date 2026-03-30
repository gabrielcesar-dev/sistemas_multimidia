import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Tree7BirchGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.9, 2.4);
        super(scene, x, y, KEYS.TREE_7_BIRCH_GREEN, scale, true);
    }
}
