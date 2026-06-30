import { KEYS } from '../config/constants.js';
import PlayerBase from './PlayerBase.js';
import { WEAPON_CONFIG } from '../config/WeaponConfig.js';

export default class PlayerMain extends PlayerBase {
    constructor(scene, x, y) {
        super(scene, x, y, KEYS.PLAYER_MAIN_IDLE_DOWN, {
            scale: 2,
            bodySize: { width: 6, height: 5 },
            bodyOffset: { x: 3.5, y: 11 },
            maxHp: 10
        });

        // Weapon system
        this.weapon = null; // 'shotgun' or null
        this.ammo = 0;
        this.canShoot = true;
        this.shotgunOverlay = null;

        // Aim angle tracks the real direction for diagonal attacks
        this.aimAngle = Math.PI / 2; // Default: down

        // Ensure correct animation playback
        this.play(this.getAnimationKey('idle'));
    }

    handleAnimationComplete(animation) {
        // Allow subclasses to handle death anims: if death animation completed do nothing
        if (animation.key.startsWith('anim_player_main_death')) return;

        if (!animation.key.startsWith('anim_player_main_punch') && 
            !animation.key.startsWith('anim_player_main_pickup')) {
            return;
        }

        this.currentAction = null;
        this.play(this.getAnimationKey('idle'), true);
    }

    getAnimationKey(state) {
        // Death has only side variants: map facing accordingly.
        if (state === 'death') {
            if (this.facing === 'side_left') return 'anim_player_main_death_side_left';
            // fallback to side for side/up/down
            return 'anim_player_main_death_side';
        }

        return `anim_player_main_${state}_${this.facing}`;
    }

    updateFacing(vx, vy) {
        // Store real aim angle for diagonal attacks
        if (vx !== 0 || vy !== 0) {
            this.aimAngle = Math.atan2(vy, vx);
        }

        // Sprite animation stays cardinal (4 directions)
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
        if (this.currentAction && this.currentAction !== 'shoot') return;

        const isPunchJustDown = Phaser.Input.Keyboard.JustDown(actionKeys.punch);
        const isPunchDown = actionKeys.punch.isDown;

        if (this.weapon && this.ammo > 0 && this.canShoot) {
            const config = WEAPON_CONFIG[this.weapon];
            const isAutoWeapon = config && config.isAutomatic;

            if (isPunchJustDown || (isAutoWeapon && isPunchDown)) {
                this.shoot();
                return;
            }
        } else if (isPunchJustDown && !this.weapon) {
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
        this.currentAction = 'shoot';
        this.canShoot = false;
        this.setVelocity(0, 0);

        const config = WEAPON_CONFIG[this.weapon] || {};
        const burstCount = config.burstCount || 1;
        const burstDelay = config.burstDelay || 0;
        const cooldown = config.cooldown || 600;

        let shotsFired = 0;

        const fireSingleShot = () => {
            if (this.isDead || this.ammo <= 0) return;

            this.ammo--;
            this.scene.events.emit('ammoChanged', this.ammo);
            this.play(this.getAnimationKey('idle'), true);

            const bullets = this.generateWeaponSpread();
            this.scene.events.emit('weaponFired', this.x, this.y, bullets, this.facing, this.weapon);
            
            shotsFired++;
            
            if (shotsFired < burstCount && this.ammo > 0) {
                this.scene.time.delayedCall(burstDelay, fireSingleShot);
            } else {
                // finished burst
                this.scene.time.delayedCall(200, () => {
                    if (this.isDead) return;
                    this.currentAction = null;
                    this.play(this.getAnimationKey('idle'), true);
                });
                
                this.scene.time.delayedCall(cooldown, () => {
                    if (this.isDead) return;
                    this.canShoot = true;
                    if (this.ammo <= 0) {
                        this.weapon = null;
                        this.removeWeaponSprite();
                        this.scene.events.emit('ammoChanged', 0);
                    }
                });
            }
        };

        fireSingleShot();
    }

    generateWeaponSpread() {
        // Use the real aim angle (supports diagonals)
        const centerAngle = this.aimAngle;

        const bulletDistance = 25; 
        const bullets = [];

        const config = WEAPON_CONFIG[this.weapon] || WEAPON_CONFIG.pistol;
        const pelletCount = config.pelletCount;
        const spreadAngle = config.spreadAngle;
        
        for (let i = 0; i < pelletCount; i++) {
            let angle = centerAngle;
            
            if (spreadAngle > 0 && pelletCount > 1) {
                // Bell curve distribution: (rand + rand + rand)/3 - 0.5 creates a strong center bias
                const bellCurveRand = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
                angle += bellCurveRand * spreadAngle;
            }

            const distOffset = bulletDistance + Phaser.Math.FloatBetween(-5, 5);
            bullets.push({
                x: this.x + Math.cos(angle) * distOffset,
                y: this.y + Math.sin(angle) * distOffset,
                angle: angle,
                distance: bulletDistance * 1.5, // Just for visual start
                config: config
            });
        }

        return bullets;
    }

    equipWeapon(weaponId, ammo) {
        this.weapon = weaponId;
        this.ammo = ammo;
        this.createWeaponSprite();
        
        this.scene.events.emit('weaponPickedUp', weaponId);
        this.scene.events.emit('ammoChanged', this.ammo);
    }

    updateWeaponSprite() {
        if (!this.weaponSprite) return;

        let ox = 0; let oy = 0;
        if (this.facing === 'down') { ox = -10; oy = 4; }
        else if (this.facing === 'up') { ox = 10; oy = 4; }
        else if (this.facing === 'side') { ox = 8; oy = 6; }
        else if (this.facing === 'side_left') { ox = -8; oy = 6; }

        this.weaponSprite.setPosition(this.x + ox, this.y + oy);
        this.weaponSprite.setDepth(this.depth + 1);
        this.weaponSprite.setVisible(this.weapon !== null && !this.isDead);

        if (this.weapon) {
            let state = 'idle';
            if (this.currentAction === 'shoot') {
                state = 'shoot';
            } else if (this.anims.currentAnim && this.anims.currentAnim.key.includes('run')) {
                state = 'run';
            }
            let animWeapon = this.weapon || 'shotgun';
            const animKey = `anim_player_main_${animWeapon}_${state}_${this.facing}`;
            this.weaponSprite.play(animKey, true);
        }
    }

    createWeaponSprite() {
        if (this.weaponSprite) return;
        this.weaponSprite = this.scene.add.sprite(this.x, this.y, KEYS.PLAYER_MAIN_SHOTGUN_IDLE_DOWN);
        this.weaponSprite.setScale(this.scaleX, this.scaleY);
        this.weaponSprite.setDepth(this.depth + 1);
        this.updateWeaponSprite();
    }

    removeWeaponSprite() {
        if (this.weaponSprite) {
            this.weaponSprite.destroy();
            this.weaponSprite = null;
        }
    }

    update(cursors, cursorsWASD, actionKeys) {
        if (this.isDead) return;

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
            super.update();
            this.updateWeaponSprite();
            return;
        }

        this.setVelocity(vx * speed, vy * speed);
        super.update();

        if (vx !== 0 || vy !== 0) {
            this.play(this.getAnimationKey('run'), true);
        } else {
            this.play(this.getAnimationKey('idle'), true);
        }

        this.updateWeaponSprite();
    }

    consumePunchHit() {
        if (!this.pendingPunchHit) {
            return false;
        }

        this.pendingPunchHit = false;
        return true;
    }

    getMeleeAttackArea() {
        // Use real aim angle for diagonal punching
        const dist = 34;
        return {
            x: this.x + Math.cos(this.aimAngle) * dist,
            y: this.y + Math.sin(this.aimAngle) * dist,
            radius: 34
        };
    }

    handleDeath() {
        // Block further actions
        this.currentAction = 'dead';
        this.setVelocity(0, 0);
        this.removeWeaponSprite();
        
        this.stop(); // Para animações atuais

        // Play mapped death animation
        const deathAnim = this.getAnimationKey('death');
        if (deathAnim) this.play(deathAnim, true);

        // Informa a cena que ocorreu Game Over
        this.scene.events.emit('playerDied');
    }
}
