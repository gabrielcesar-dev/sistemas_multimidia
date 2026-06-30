import { KEYS, SCENES } from '../config/constants.js';
import ZombieSmall from '../entities/enemies/ZombieSmall.js';
import ZombieAxe from '../entities/enemies/ZombieAxe.js';
import ZombieBig from '../entities/enemies/ZombieBig.js';

export default class MenuDemoScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuDemoScene' });
    }

    create() {
        // Use a simple world anchored at 0,0
        const WORLD_W = 10000;
        const WORLD_H = 1000;
        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
        
        // Dark floor
        const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: Math.ceil(WORLD_W/16), height: Math.ceil(WORLD_H/16) });
        const tileset = map.addTilesetImage(KEYS.TILESET_DARK, KEYS.TILESET_DARK);
        const groundLayer = map.createBlankLayer('Ground', tileset);
        groundLayer.fill(5).setScale(2).setDepth(0);

        // Dummy player far off-screen
        this.dummyPlayer = this.add.sprite(-9999, -9999, null).setVisible(false);
        this.dummyPlayer.active = true;

        // --- ZOMBIE HORDE ---
        this.enemies = [];
        const CENTER_Y = WORLD_H / 2; // 500

        for (let i = 0; i < 400; i++) {
            const px = Phaser.Math.Between(0, WORLD_W);
            const py = CENTER_Y + Phaser.Math.Between(-150, 150);
            
            let type = ZombieSmall;
            const rand = Math.random();
            if (rand < 0.08) type = ZombieBig;
            else if (rand < 0.30) type = ZombieAxe;

            const z = new type(this, px, py, this.dummyPlayer, null);
            z.setAIStrategy(null);
            z.play(`${z.animPrefix}_side_walk`, true);
            z.setFlipX(false);
            z.setVelocityX(Phaser.Math.Between(12, 28));
            z.setVelocityY(Phaser.Math.Between(-3, 3));
            z.setDepth(py);
            
            this.enemies.push(z);
        }

        // Camera — center on the horde using centerOn (foolproof)
        const zoom = 3.0;
        this.cameras.main.setZoom(zoom);
        this.cameras.main.centerOn(500, CENTER_Y);
        
        // Dark moody overlay
        this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x000000, 0.55).setOrigin(0, 0).setDepth(2000);
        // Subtle blood-red tint
        this.add.rectangle(0, 0, WORLD_W, WORLD_H, 0x3a0000, 0.12).setOrigin(0, 0).setDepth(2001);
    }

    update(time, delta) {
        this.cameras.main.scrollX += 0.35;
        
        this.enemies.forEach(z => {
            z.applyYDepthSorting();
        });
    }
}
