import { KEYS } from '../config/constants.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, KEYS.PLAYER_IDLE);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1.8);

        // Define a single, tight feet-only hitbox
        this.body.setSize(14, 16);
        this.body.setOffset(43, 40);
        this.body.updateFromGameObject();

        this.setCollideWorldBounds(true);
        
        this.play('anim_player_idle');
    }

    update(cursors, cursorsWASD) {
        const speed = 160;
        let vx = 0;
        let vy = 0;

        // Horizontal
        if (cursors.left.isDown || cursorsWASD.left.isDown) {
            vx = -1;
        } else if (cursors.right.isDown || cursorsWASD.right.isDown) {
            vx = 1;
        }

        // Vertical
        if (cursors.up.isDown || cursorsWASD.up.isDown) {
            vy = -1;
        } else if (cursors.down.isDown || cursorsWASD.down.isDown) {
            vy = 1;
        }

        // Normalize diagonal movement so speed is consistent
        if (vx !== 0 && vy !== 0) {
            const factor = Math.SQRT1_2; // 1/√2
            vx *= factor;
            vy *= factor;
        }

        this.setVelocity(vx * speed, vy * speed);
        this.setDepth(this.y + this.displayHeight / 2);

        // Animation handling
        if (vx !== 0 || vy !== 0) {
            this.play('anim_player_walk', true);
            // Flip sprite depending on horizontal orientation
            if (vx < 0) {
                this.setFlipX(true);
            } else if (vx > 0) {
                this.setFlipX(false);
            }
        } else {
            this.play('anim_player_idle', true);
        }
    }
}
