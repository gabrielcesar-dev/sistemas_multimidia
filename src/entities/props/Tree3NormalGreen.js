import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Tree3NormalGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(2.0, 2.5);
        super(scene, x, y, KEYS.TREE_3_NORMAL_GREEN, scale, true);
    }
}
