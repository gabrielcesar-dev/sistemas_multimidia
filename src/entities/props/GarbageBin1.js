import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class GarbageBin1 extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.3, 1.8);
        super(scene, x, y, KEYS.GARBAGE_BIN_1, scale, true);
    }
}
