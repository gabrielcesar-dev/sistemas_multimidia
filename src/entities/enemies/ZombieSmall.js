import BaseEnemy from '../base/BaseEnemy.js';
import { KEYS } from '../../config/constants.js';

export default class ZombieSmall extends BaseEnemy {
    constructor(scene, x, y, player, leader = null) {
        super(scene, x, y, KEYS.ZOMBIE_DOWN_IDLE, player, leader, 'anim_zombie');
        
        this.setScale(1.6);
        this.speed = 70;
        this.cost = 1;
    }
}
