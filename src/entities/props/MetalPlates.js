import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class MetalPlates extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.2, 1.6);
        super(scene, x, y, KEYS.METAL_PLATES, scale, true);
    }
}
