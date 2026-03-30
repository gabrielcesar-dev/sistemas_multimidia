import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class RefrigeratorProp extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.4, 1.9);
        super(scene, x, y, KEYS.REFRIGERATOR, scale, true);
    }
}
