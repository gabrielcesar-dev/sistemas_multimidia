 
import BaseEntity from './base/BaseEntity.js';
import Health from '../components/Health.js';

export default class PlayerBase extends BaseEntity {
    #health;

    constructor(scene, x, y, textureKey, options = {}) {
        super(scene, x, y, textureKey);

        this.setScale(options.scale || 1);

        if (options.bodySize && this.body) {
            const bs = options.bodySize;
            this.body.setSize(bs.width || bs.w || bs[0], bs.height || bs.h || bs[1]);
        }
        if (options.bodyOffset && this.body) {
            const bo = options.bodyOffset;
            this.body.setOffset(bo.x ?? bo[0] ?? 0, bo.y ?? bo[1] ?? 0);
        }

        if (this.body && this.body.updateFromGameObject) this.body.updateFromGameObject();

        this.setCollideWorldBounds(true);

        // Basic state
        this.facing = 'down';
        this.currentAction = null;
        this.pendingPunchHit = false;
        this.isInvincible = false;

        // Health component via composition
        this.#health = this.addComponent('health', new Health(options.maxHp || 10));
        
        // Emitting events for UI/Scene decoupling - REPASSA PARA A CENA PARA A HUD LER
        this.#health.on('damage', (amount, currentHp) => this.scene.events.emit('hpChanged', currentHp));
        this.#health.on('heal', (amount, currentHp) => this.scene.events.emit('hpChanged', currentHp));
        this.#health.on('death', () => this._handleDeath());

        // Allow subclasses to react to animation complete
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
    }

    handleAnimationComplete() {}

    _handleDeath() {
        this.setVelocity(0, 0);
        this.emit('died'); // Let the scene know!
        
        if (typeof this.handleDeath === 'function') this.handleDeath();
    }

    takeDamage(amount) {
        if (this.#health.isDead || this.isInvincible) return false;
        
        const previousHp = this.#health.hp;
        this.#health.damage(amount);
        
        if (previousHp > this.#health.hp) {
            // Efeito de invencibilidade + Animação de dano (piscar em vermelho)
            this.isInvincible = true;
            this.setTint(0xff0000);
            
            // Piscar a transparência
            this.scene.tweens.add({
                targets: this,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: 2
            });

            this.scene.time.delayedCall(600, () => {
                this.isInvincible = false;
                this.clearTint();
                this.setAlpha(1);
            });
            return true;
        }
        return false;
    }

    heal(amount) {
        return this.#health.heal(amount);
    }

    get isDead() {
        return this.#health.isDead;
    }

    get hp() {
        return this.#health.hp;
    }

    get maxHp() {
        return this.#health.maxHp;
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
}
