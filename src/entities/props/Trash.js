import BaseProp from '../base/BaseProp.js';
import { KEYS } from '../../config/constants.js';

export default class Trash extends BaseProp {
    constructor(scene, x, y) {
        const scale = Phaser.Math.FloatBetween(1.5, 2.0);
        super(scene, x, y, KEYS.TRASH, scale, true);
    }
}
