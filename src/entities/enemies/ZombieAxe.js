import BaseEnemy from '../base/BaseEnemy.js';
import { KEYS } from '../../config/constants.js';

export default class ZombieAxe extends BaseEnemy {
    constructor(scene, x, y, player, leader = null) {
        super(scene, x, y, KEYS.ZOMBIE_AXE_DOWN_IDLE, player, leader, 'anim_zombie_axe');
        
        this.setScale(1.6);
        this.speed = 55;
        this.cost = 3;
    }
}
