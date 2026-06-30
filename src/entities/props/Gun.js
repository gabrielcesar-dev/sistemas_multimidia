import WeaponDrop from './WeaponDrop.js';

export default class Gun extends WeaponDrop {
    constructor(scene, x, y) {
        super(scene, x, y, 'gun_drop', 'gun', 30);
    }
}
