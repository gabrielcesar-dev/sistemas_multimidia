import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class StreetLightSide extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.6, 2.2);
        super(scene, x, y, KEYS.STREET_LIGHT_SIDE, scale, true);
    }
}
