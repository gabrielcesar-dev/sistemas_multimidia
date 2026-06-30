import BaseProp from '../base/BaseProp.js';

export default class WeaponDrop extends BaseProp {
    constructor(scene, x, y, texture, weaponId, ammoCount) {
        super(scene, x, y, texture, 1.5, false);
        
        this.weaponId = weaponId;
        this.ammoCount = ammoCount;

        this.body.setSize(20, 20);
        this.body.setOffset(-10, -10);
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(0.6);
        
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.Between(50, 150);
        this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        
        this.isPickedUp = false;
        
        scene.time.delayedCall(15000, () => {
            if (this.active && !this.isPickedUp) {
                scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => {
                        if (this.active) this.destroy();
                    }
                });
            }
        });
    }

    pickup(player) {
        if (this.isPickedUp) return;
        this.isPickedUp = true;
        this.body.enable = false;
        
        player.equipWeapon(this.weaponId, this.ammoCount);
        this.destroy();
    }
}
