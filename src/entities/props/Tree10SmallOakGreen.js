import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Tree10SmallOakGreen extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.8, 2.3);
        super(scene, x, y, KEYS.TREE_10_SMALL_OAK_GREEN, scale, true);
    }
}
