export default class BaseProp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, scale = 1, isStatic = true) {
        super(scene, x, y, textureKey);

        scene.add.existing(this);
        scene.physics.add.existing(this, isStatic);

        this.setScale(scale);
        
        // Dynamically set depth based on Y position (Y-sorting)
        this.setDepth(this.y + this.displayHeight / 2);
    }
}
