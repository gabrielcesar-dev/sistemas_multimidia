 

export default class BaseEntity extends Phaser.Physics.Arcade.Sprite {
    #components;

    constructor(scene, x, y, textureKey, isStatic = false) {
        super(scene, x, y, textureKey);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, isStatic);
        
        this.#components = new Map();
    }

    // Polimorfismo: Todas as entidades devem poder ser atualizadas
    update(time, delta) {
        this.applyYDepthSorting();
    }

    applyYDepthSorting() {
        this.setDepth(this.y + this.displayHeight / 2);
    }

    // Gestão de Comportamentos (Composição)
    addComponent(key, component) {
        this.#components.set(key, component);
        return component;
    }

    getComponent(key) {
        return this.#components.get(key);
    }

    hasComponent(key) {
        return this.#components.has(key);
    }
}
