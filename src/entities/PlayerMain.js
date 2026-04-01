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

        // HP System
        this.maxHp = 10;
        this.hp = this.maxHp;

        // Weapon system
        this.weapon = null; // 'shotgun' or null
        this.ammo = 0;
        this.canShoot = true;
        this.shotgunOverlay = null;

        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);

        this.play(this.getAnimationKey('idle'));
    }

    handleAnimationComplete(animation) {
        if (!animation.key.startsWith('anim_player_main_punch') && 
            !animation.key.startsWith('anim_player_main_pickup')) {
            return;
        }

        this.currentAction = null;
        this.play(this.getAnimationKey('idle'), true);
    }

    getAnimationKey(state) {
        // Always use base player animations - weapons don't change sprite
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

        // SPACE key: Punch or Shoot (if has shotgun)
        if (Phaser.Input.Keyboard.JustDown(actionKeys.punch)) {
            if (this.weapon === 'shotgun' && this.ammo > 0 && this.canShoot) {
                this.shoot();
                return;
            }
            
            // Normal punch
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

    shoot() {
        this.ammo--;
        this.currentAction = 'shoot';
        this.canShoot = false;
        this.setVelocity(0, 0);
        
        // Fire 5 bullets in semi-radius pattern
        const bullets = this.generateShotgunSpread();
        
        // Notify the scene to handle damage and bullet effects
        this.scene.events.emit('shotgunFired', bullets, this.facing);
        
        // Simple animation pause then resume
        this.scene.time.delayedCall(200, () => {
            this.currentAction = null;
            this.play(this.getAnimationKey('idle'), true);
        });
        
        // Cooldown between shots
        this.scene.time.delayedCall(600, () => {
            this.canShoot = true;
        });
    }

    generateShotgunSpread() {
        // Center direction based on facing
        let centerAngle;
        const directions = {
            up: -Math.PI / 2,
            down: Math.PI / 2,
            side: 0,
            side_left: Math.PI
        };
        centerAngle = directions[this.facing] || directions.down;

        // Generate 5 bullets in semi-circle spread (90 degree arc)
        const spreadAngle = Math.PI / 2; // 90 degrees
        const bullets = [];
        const bulletDistance = 80;
        const spread = spreadAngle / 4; // Divide 90 degrees into 4 gaps for 5 bullets

        for (let i = 0; i < 5; i++) {
            const angle = centerAngle - (spreadAngle / 2) + (i * spread);
            bullets.push({
                x: this.x + Math.cos(angle) * bulletDistance,
                y: this.y + Math.sin(angle) * bulletDistance,
                angle: angle,
                distance: bulletDistance * 1.5
            });
        }

        return bullets;
    }

    updateShotgunOverlay() {
        if (!this.shotgunOverlay) return;

        // Position overlay at player position with slight offset
        const offsetX = this.facing === 'side' ? 8 : (this.facing === 'side_left' ? -8 : 0);
        const offsetY = this.facing === 'down' ? 8 : (this.facing === 'up' ? -8 : 0);

        this.shotgunOverlay.x = this.x + offsetX;
        this.shotgunOverlay.y = this.y + offsetY;
        this.shotgunOverlay.setDepth(this.depth + 1);
        
        // Redraw if facing changed
        if (this.shotgunOverlay.lastFacing !== this.facing) {
            this.drawShotgunOnOverlay();
            this.shotgunOverlay.lastFacing = this.facing;
        }
    }

    createShotgunOverlay() {
        if (this.shotgunOverlay) return;
        
        // Create overlay graphics
        this.shotgunOverlay = this.scene.add.graphics();
        this.shotgunOverlay.lastFacing = null;
        this.drawShotgunOnOverlay();
        this.updateShotgunOverlay();
    }

    drawShotgunOnOverlay() {
        if (!this.shotgunOverlay) return;

        this.shotgunOverlay.clear();
        
        // Draw shotgun oriented based on facing direction
        if (this.facing === 'side' || this.facing === 'side_left') {
            // Horizontal orientation
            const flipAmount = this.facing === 'side_left' ? -1 : 1;
            this.shotgunOverlay.fillStyle(0x4a4a4a, 0.8);
            this.shotgunOverlay.fillRect(-6 * flipAmount, -2, 12, 4); // Barrel
            this.shotgunOverlay.fillStyle(0x8b7355, 0.8);
            this.shotgunOverlay.fillRect(-8 * flipAmount, -1, 4, 2); // Stock
            this.shotgunOverlay.fillStyle(0x3a3a3a, 1);
            this.shotgunOverlay.fillCircle(2 * flipAmount, 0, 1); // Sight
        } else {
            // Vertical orientation
            const flipAmount = this.facing === 'up' ? -1 : 1;
            this.shotgunOverlay.fillStyle(0x4a4a4a, 0.8);
            this.shotgunOverlay.fillRect(-2, -6 * flipAmount, 4, 12); // Barrel
            this.shotgunOverlay.fillStyle(0x8b7355, 0.8);
            this.shotgunOverlay.fillRect(-1, -8 * flipAmount, 2, 4); // Stock
            this.shotgunOverlay.fillStyle(0x3a3a3a, 1);
            this.shotgunOverlay.fillCircle(0, 2 * flipAmount, 1); // Sight
        }
    }

    removeShotgunOverlay() {
        if (this.shotgunOverlay) {
            this.shotgunOverlay.destroy();
            this.shotgunOverlay = null;
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
        this.updateShotgunOverlay();
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

    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        if (this.hp <= 0) {
            this.handleDeath();
            return false;
        }
        return true;
    }

    handleDeath() {
        this.setVelocity(0, 0);
        this.play(this.getAnimationKey('death'));
        this.scene.time.delayedCall(1000, () => {
            this.scene.scene.restart();
        });
    }
}
