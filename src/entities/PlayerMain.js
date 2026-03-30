import { KEYS } from '../config/constants.js';

export default class PlayerMain extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, KEYS.PLAYER_MAIN_IDLE_DOWN);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);

        // The new main character frames are small (13x16 per frame),
        // so keep the body centered near the feet instead of reusing the old soldier offsets.
        this.body.setSize(6, 5);
        this.body.setOffset(3.5, 11);
        this.body.updateFromGameObject();

        this.setCollideWorldBounds(true);

        this.facing = 'down';
        this.currentAction = null;
        this.pendingPunchHit = false;

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);

        this.play(this.getAnimationKey('idle'));
    }

    handleAnimationComplete(animation) {
        if (!animation.key.startsWith('anim_player_main_punch') && !animation.key.startsWith('anim_player_main_pickup')) {
            return;
        }

        this.currentAction = null;
        this.play(this.getAnimationKey('idle'), true);
    }

    getAnimationKey(state) {
        return `anim_player_main_${state}_${this.facing}`;
    }

    updateFacing(vx, vy) {
        if (vx < 0) {
            this.facing = 'side_left';
            return;
        }

        if (vx > 0) {
            this.facing = 'side';
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

    tryStartAction(actionKeys) {
        if (this.currentAction) return;

        if (Phaser.Input.Keyboard.JustDown(actionKeys.punch)) {
            this.currentAction = 'punch';
            this.pendingPunchHit = true;
            this.setVelocity(0, 0);
            this.play(this.getAnimationKey('punch'), true);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(actionKeys.pickup)) {
            this.currentAction = 'pickup';
            this.setVelocity(0, 0);
            this.play(this.getAnimationKey('pickup'), true);
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
            this.setDepth(this.y + this.displayHeight / 2);
            return;
        }

        this.setVelocity(vx * speed, vy * speed);
        this.setDepth(this.y + this.displayHeight / 2);

        if (vx !== 0 || vy !== 0) {
            this.play(this.getAnimationKey('run'), true);
        } else {
            this.play(this.getAnimationKey('idle'), true);
        }
    }

    consumePunchHit() {
        if (!this.pendingPunchHit) {
            return false;
        }

        this.pendingPunchHit = false;
        return true;
    }
}
