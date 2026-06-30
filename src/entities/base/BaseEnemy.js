 
import BaseEntity from './BaseEntity.js';
import Health from '../../components/Health.js';
import HordeAIStrategy from '../../ai/HordeAIStrategy.js';

export default class BaseEnemy extends BaseEntity {
    #health;
    #aiStrategy;
    
    constructor(scene, x, y, textureKey, player, leader, animPrefix) {
        super(scene, x, y, textureKey);
        
        this.player = player;
        this.leader = leader;
        this.animPrefix = animPrefix;
        
        this.updateParity = Math.random() < 0.5 ? 0 : 1;
        this.speedMod = Phaser.Math.FloatBetween(0.85, 1.25);
        this.speed = 50; // default speed
        this.nextVx = 0;
        this.nextVy = 0;
        
        this.isHurt = false;
        this.hurtUntil = 0;
        this.isDying = false;
        this.isAttacking = false;
        
        this.lastMoveAxis = 'side';
        this.lastFlipX = false;
        
        this.#setupPhysics();
        
        // Strategy Pattern for AI
        this.setAIStrategy(new HordeAIStrategy(scene));
    }

    setupHealth(hp) {
        this.#health = this.addComponent('health', new Health(hp));
        this.#health.on('damage', this.#onDamageTaken, this);
        this.#health.on('death', this.#onDeath, this);
    }

    #setupPhysics() {
        this.body.setSize(10, 8);
        this.body.setOffset(3, 8);
    }

    setAIStrategy(strategy) {
        this.#aiStrategy = strategy;
    }

    computeAI(time, delta, frameCount) {
        this.applyYDepthSorting(); // ensure depth sorting
        
        if (!this.player || !this.player.active || this.isDying) return;
        if (this.isHurt && time < this.hurtUntil) return;
        if (this.isHurt && time >= this.hurtUntil) {
            this.isHurt = false;
        }
        if (this.isAttacking) return;

        if (frameCount % 2 !== this.updateParity) {
             this._updateAnimation();
             return;
        }

        if (this.#aiStrategy) {
            this.#aiStrategy.compute(this, time, delta, frameCount);
        }
    }
    
    applyAI() {
        if (!this.player || !this.player.active || this.isDying || this.isHurt || this.isAttacking) return;

        if (this.#aiStrategy) {
            this.#aiStrategy.apply(this);
        }
        
        this._updateAnimation();
    }
    
    _updateAnimation() {
        if (!this.body || this.isAttacking) return;
        
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        
        // Se a velocidade for muito baixa, assume a animação idle
        if (Math.abs(vx) < 5 && Math.abs(vy) < 5) {
            this.play(`${this.animPrefix}_${this.lastMoveAxis}_idle`, true);
            this.setFlipX(this.lastFlipX);
            return;
        }

        // Hysteresis (Margem de tolerância) para evitar que a animação "trema"
        // Só muda de eixo se a velocidade nesse eixo for 20% maior que a do outro
        if (Math.abs(vx) > Math.abs(vy) * 1.2) {
            this.lastMoveAxis = 'side';
        } else if (Math.abs(vy) > Math.abs(vx) * 1.2) {
            this.lastMoveAxis = vy > 0 ? 'down' : 'up';
        }

        if (this.lastMoveAxis === 'side') {
            // Só inverte o sprite se a velocidade horizontal for notória, evitando flip flicker (tremedeira)
            if (Math.abs(vx) > 2) {
                this.lastFlipX = vx < 0;
            }
            this.play(`${this.animPrefix}_side_walk`, true);
            this.setFlipX(this.lastFlipX);
        } else {
            this.setFlipX(false);
            if (this.lastMoveAxis === 'down') {
                this.play(`${this.animPrefix}_down_walk`, true);
            } else {
                this.play(`${this.animPrefix}_up_walk`, true);
            }
        }
    }

    getDeathAnimationKey() {
        return null; // subclasses override
    }

    attack() {
        if (this.isDying || this.isAttacking) return;
        this.isAttacking = true;
        this.setVelocity(0, 0);

        let direction = this.lastMoveAxis;
        if (direction === 'side') {
            this.setFlipX(this.lastFlipX);
            direction = this.lastFlipX ? 'side_left' : 'side';
        }

        const animKey = `${this.animPrefix}_${direction}_attack`;
        
        this.play(animKey, true);
        
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.isAttacking = false;
        });
    }

    takeDamage(config, sourceX, sourceY, distance = 0) {
        if (!this.active || this.isDying) return;
        
        let damage = config.baseDamage || 1;
        let knockback = config.knockback || 140;

        if (config.falloff) {
            if (distance <= config.falloff.shortRange) {
                // 100% effectiveness
            } else if (distance <= config.falloff.midRange) {
                // 50% effectiveness
                damage = Math.max(1, Math.floor(damage * 0.5));
                knockback = knockback * 0.5;
            } else {
                // long range effectiveness
                damage = config.falloff.longRangeDamage || 1;
                knockback = config.falloff.longRangeKnockback || 50;
            }
        }

        this.currentKnockbackDuration = config.knockbackDuration || 180;
        this.#health.damage(damage);
        this.#applyKnockback(sourceX, sourceY, knockback);
    }

    #onDamageTaken(amount, currentHp) {
        this.isHurt = true;
        const kbDuration = this.currentKnockbackDuration || 180;
        this.hurtUntil = this.scene.time.now + kbDuration;
        
        // Flash branco indicando dano (Hit animation)
        this.setTintFill(0xffffff);
        
        this.scene.time.delayedCall(80, () => {
            if (this.active) {
                this.clearTint();
                // Fica vermelho durante o resto do knockback
                this.setTint(0xff6b6b);
            }
        });
        
        this.scene.time.delayedCall(kbDuration, () => {
            if (this.active) {
                this.isHurt = false;
                this.clearTint();
            }
        });
    }

    #applyKnockback(sourceX, sourceY, knockbackForce) {
        if (sourceX === undefined || sourceY === undefined) return;
        
        const dx = this.x - sourceX;
        const dy = this.y - sourceY;
        const length = Math.sqrt((dx * dx) + (dy * dy)) || 1;

        this.setVelocity((dx / length) * knockbackForce, (dy / length) * knockbackForce);
    }

    #onDeath() {
        const deathAnimKey = this.getDeathAnimationKey();

        this.isDying = true;
        this.body.enable = false;
        this.setVelocity(0, 0);
        this.clearTint();
        
        // Observer Pattern: Notify death
        this.emit('died', this.x, this.y);
        
        if (!deathAnimKey) {
            this.destroy();
            return;
        }

        this.play(deathAnimKey);
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
    
    // Polymorphism generic update
    update(time, delta) {
        // AI logic is still called manually by Level 2-phase loop
        // But we could keep standard behaviors here if needed
        super.update(time, delta);
    }
}
