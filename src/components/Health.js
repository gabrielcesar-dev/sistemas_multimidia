// Simple Health component implementing single responsibility for HP and death handling
export default class Health {
    constructor(maxHp = 10) {
        this.maxHp = Math.max(1, Math.floor(maxHp));
        this.current = this.maxHp;
        this._onDeath = null;
    }

    damage(amount = 1) {
        const prev = this.current;
        this.current = Math.max(0, this.current - Math.max(0, amount));
        if (prev > 0 && this.current === 0) {
            if (typeof this._onDeath === 'function') this._onDeath();
        }
        return this.current;
    }

    heal(amount = 1) {
        this.current = Math.min(this.maxHp, this.current + Math.max(0, amount));
        return this.current;
    }

    isDead() {
        return this.current <= 0;
    }

    onDeath(cb) {
        this._onDeath = cb;
    }

    getHp() {
        return this.current;
    }

    getMaxHp() {
        return this.maxHp;
    }
}
