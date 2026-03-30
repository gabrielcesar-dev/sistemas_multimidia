import BaseEnemy from '../base/BaseEnemy.js';
import { KEYS } from '../../config/constants.js';

export default class ZombieBig extends BaseEnemy {
    constructor(scene, x, y, player, leader = null) {
        super(scene, x, y, KEYS.ZOMBIE_BIG_DOWN_IDLE, player, leader, 'anim_zombie_big');
        
        this.setScale(2.5);
        this.speed = 20;
        this.cost = 7;
        this.hp = 5;
    }

    getDeathAnimationKey() {
        return this.lastFlipX ? 'anim_zombie_big_side_left_death' : 'anim_zombie_big_side_death';
    }
}
