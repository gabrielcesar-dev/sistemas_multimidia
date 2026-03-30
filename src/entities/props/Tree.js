import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Tree extends BaseProp {
    constructor(scene, x, y) {
        // Hardcode Tree texture and a random scale between 2.0 and 2.5
        const scale = Phaser.Math.FloatBetween(2.0, 2.5);
        super(scene, x, y, KEYS.TREE, scale, true);
    }
}
