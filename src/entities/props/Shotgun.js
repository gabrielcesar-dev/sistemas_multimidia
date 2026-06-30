import WeaponDrop from './WeaponDrop.js';

export default class Shotgun extends WeaponDrop {
    constructor(scene, x, y) {
        super(scene, x, y, 'shotgun_drop', 'shotgun', 8);
    }
}
