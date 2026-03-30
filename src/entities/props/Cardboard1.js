import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Cardboard1 extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.1, 1.4);
        super(scene, x, y, KEYS.CARDBOARD_1, scale, true);
    }
}
