 

export default class Health extends Phaser.Events.EventEmitter {
    #maxHp;
    #currentHp;
    #isDead;

    constructor(maxHp = 10) {
        super();
        this.#maxHp = Math.max(1, Math.floor(maxHp));
        this.#currentHp = this.#maxHp;
        this.#isDead = false;
    }

    get hp() { return this.#currentHp; }
    get maxHp() { return this.#maxHp; }
    get isDead() { return this.#isDead; }

    setMaxHp(newMax) {
        const oldMax = this.#maxHp;
        this.#maxHp = Math.max(1, Math.floor(newMax));
        // Optionally scale current hp or just set to max if it was full
        if (this.#currentHp === oldMax) {
            this.#currentHp = this.#maxHp;
        } else {
            this.#currentHp = Math.min(this.#currentHp, this.#maxHp);
        }
    }

    damage(amount = 1) {
        if (this.#isDead) return this.#currentHp;

        this.#currentHp = Math.max(0, this.#currentHp - Math.max(0, amount));
        this.emit('damage', amount, this.#currentHp);

        if (this.#currentHp === 0) {
            this.#isDead = true;
            this.emit('death');
        }

        return this.#currentHp;
    }

    setMaxHp(value) {
        this.#maxHp = Math.max(1, Math.floor(value));
        this.#currentHp = this.#maxHp;
        this.#isDead = false;
    }

    heal(amount = 1) {
        if (this.#isDead) return this.#currentHp;

        this.#currentHp = Math.min(this.#maxHp, this.#currentHp + Math.max(0, amount));
        this.emit('heal', amount, this.#currentHp);
        
        return this.#currentHp;
    }
}
