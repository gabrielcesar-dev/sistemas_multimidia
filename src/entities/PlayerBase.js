import Health from '../components/Health.js';

export default class PlayerBase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, options = {}) {
        super(scene, x, y, textureKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

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

        // Health component
        this.health = new Health(options.maxHp || 10);
        this.health.onDeath(() => this._handleDeath());

        // Allow subclasses to react to animation complete
        this.on(Phaser.Animations.Events.ANIMATION_COMPLETE, this.handleAnimationComplete, this);
    }

    // Placeholder — subclasses should override if they need specific behaviour
    handleAnimationComplete(/* animation */) {}

    _handleDeath() {
        // Default behavior: stop movement. Subclasses should override handleDeath.
        this.setVelocity(0, 0);
        if (typeof this.handleDeath === 'function') this.handleDeath();
    }

    damage(amount) {
        return this.health.damage(amount);
    }

    heal(amount) {
        return this.health.heal(amount);
    }

    isDead() {
        return this.health.isDead();
    }

    // Backwards-compatible properties used by scenes
    get hp() {
        return this.health.getHp();
    }

    get maxHp() {
        return this.health.getMaxHp();
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
