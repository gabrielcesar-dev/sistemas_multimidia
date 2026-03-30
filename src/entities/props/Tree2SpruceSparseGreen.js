import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Tree2SpruceSparseGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(2.0, 2.5);
        super(scene, x, y, KEYS.TREE_2_SPRUCE_SPARSE_GREEN, scale, true);
    }
}
