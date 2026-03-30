import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Tree8BirchGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.9, 2.4);
        super(scene, x, y, KEYS.TREE_8_BIRCH_GREEN, scale, true);
    }
}
