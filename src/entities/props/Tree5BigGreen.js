import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Tree5BigGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(2.1, 2.6);
        super(scene, x, y, KEYS.TREE_5_BIG_GREEN, scale, true);
    }
}
