import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Cone extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.0, 1.5);
        super(scene, x, y, KEYS.CONE, scale, true);
    }
}
