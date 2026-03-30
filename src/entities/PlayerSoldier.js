import { KEYS } from '../config/constants.js';

export default class PlayerSoldier extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, KEYS.PLAYER_SOLDIER_IDLE);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1.8);

        this.body.setSize(14, 16);
        this.body.setOffset(43, 40);
        this.body.updateFromGameObject();

        this.setCollideWorldBounds(true);
        this.facing = 'down';
        this.currentAction = null;
        this.pendingPunchHit = false;
        this.lastHorizontalDirection = 1;

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);

        this.play('anim_player_soldier_idle');
    }

    handleAnimationComplete(animation) {
        if (animation.key !== 'anim_player_soldier_attack') {
            return;
        }

        this.currentAction = null;
        this.play('anim_player_soldier_idle', true);
    }

    tryStartAction(actionKeys) {
        if (this.currentAction) return;

        if (actionKeys?.punch && Phaser.Input.Keyboard.JustDown(actionKeys.punch)) {
            this.currentAction = 'attack';
            this.pendingPunchHit = true;
            this.setVelocity(0, 0);
            this.play('anim_player_soldier_attack', true);
        }
    }

    updateFacing(vx, vy) {
        if (vx < 0) {
            this.facing = 'side_left';
            this.lastHorizontalDirection = -1;
            return;
        }

        if (vx > 0) {
            this.facing = 'side';
            this.lastHorizontalDirection = 1;
            return;
        }

        if (vy < 0) {
            this.facing = 'up';
            return;
        }

        if (vy > 0) {
            this.facing = 'down';
        }
    }

    update(cursors, cursorsWASD, actionKeys) {
        const speed = 160;
        let vx = 0;
        let vy = 0;

        if (cursors.left.isDown || cursorsWASD.left.isDown) {
            vx = -1;
        } else if (cursors.right.isDown || cursorsWASD.right.isDown) {
            vx = 1;
        }

        if (cursors.up.isDown || cursorsWASD.up.isDown) {
            vy = -1;
        } else if (cursors.down.isDown || cursorsWASD.down.isDown) {
            vy = 1;
        }

        if (vx !== 0 && vy !== 0) {
            const factor = Math.SQRT1_2;
            vx *= factor;
            vy *= factor;
        }

        this.updateFacing(vx, vy);
        this.tryStartAction(actionKeys);

        if (this.currentAction) {
            this.setVelocity(0, 0);
            this.setFlipX(this.lastHorizontalDirection < 0);
            this.setDepth(this.y + this.displayHeight / 2);
            return;
        }

        this.setVelocity(vx * speed, vy * speed);
        this.setDepth(this.y + this.displayHeight / 2);

        if (vx !== 0 || vy !== 0) {
            this.play('anim_player_soldier_walk', true);

            if (vx < 0) {
                this.setFlipX(true);
            } else if (vx > 0) {
                this.setFlipX(false);
            }
        } else {
            this.play('anim_player_soldier_idle', true);
            this.setFlipX(this.lastHorizontalDirection < 0);
        }
    }

    consumePunchHit() {
        if (!this.pendingPunchHit) {
            return false;
        }

        this.pendingPunchHit = false;
        return true;
    }

    getMeleeAttackArea() {
        const ranges = {
            up: { x: 0, y: -34 },
            down: { x: 0, y: 34 },
            side: { x: 34, y: 0 },
            side_left: { x: -34, y: 0 }
        };
        const offset = ranges[this.facing] || ranges.down;

        return {
            x: this.x + offset.x,
            y: this.y + offset.y,
            radius: 34
        };
    }
}
