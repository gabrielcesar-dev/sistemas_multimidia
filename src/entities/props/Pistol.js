import WeaponDrop from './WeaponDrop.js';

export default class Pistol extends WeaponDrop {
    constructor(scene, x, y) {
        super(scene, x, y, 'pistol_drop', 'pistol', 12);
    }
}
