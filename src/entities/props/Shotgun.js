import BaseProp from '../base/BaseProp.js';

export default class Shotgun extends BaseProp {
    constructor(scene, x, y) {
        // Use a generic texture for the dropped shotgun (we'll use a placeholder)
        super(scene, x, y, 'shotgun_drop', 1.5, false);
        
        this.body.setSize(20, 20);
        this.body.setOffset(-10, -10);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.6);
        
        // Initial velocity towards a random direction (explosion effect)
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.Between(50, 150);
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        
        this.isPickedUp = false;
    }

    pickup(player) {
        if (this.isPickedUp) return;
        
        this.isPickedUp = true;
        this.body.enable = false;
        
        // Store shotgun on player
        player.weapon = 'shotgun';
        player.ammo = 10; // Start with 10 shells
        player.createShotgunOverlay();
        
        // Destroy the pickup
        this.destroy();
    }
}
