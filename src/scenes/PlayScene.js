import { KEYS, SCENES } from '../config/constants.js';
import { WEAPON_CONFIG } from '../config/WeaponConfig.js';
import PlayerMain from '../entities/PlayerMain.js';
import ZombieSmall from '../entities/enemies/ZombieSmall.js';
import ZombieAxe from '../entities/enemies/ZombieAxe.js';
import ZombieBig from '../entities/enemies/ZombieBig.js';
import Shotgun from '../entities/props/Shotgun.js';
import Pistol from '../entities/props/Pistol.js';
import Gun from '../entities/props/Gun.js';
import BaseProp from '../entities/base/BaseProp.js';
import SpatialHashGrid from '../utils/SpatialHashGrid.js';
import ProgressionManager from '../systems/ProgressionManager.js';
import SpawnDirector from '../systems/SpawnDirector.js';

const WORLD_SIZE = 3000;

export default class PlayScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        // Default level value (subclasses will override this)
        this.levelNumber = 1;
    }

    init(data) {
        if (data && data.level !== undefined) {
            this.levelNumber = data.level;
        }
        
        // Reset level-specific gameplay state
        this.kills = 0;
        this.timeSurvived = 0;
        this.spawnCooldown = 0;
        this.spawnBudget = 0;
        this.shotgunDropped = false;
        this.isPauseMenuOpen = false;
        this.isInfoMenuOpen = false;
        this.menuKeyReady = false;
        this.infoMenuKeyReady = false;
        this.frameCount = 0;
    }

    create() {
        const isLevel2 = this.levelNumber === 2;

        // Set physics world bounds
        this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

        // Floor tilemap
        const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 200, height: 200 });
        
        const tilesetGreen = map.addTilesetImage(KEYS.TILESET_GREEN, KEYS.TILESET_GREEN);
        const tilesetBleak = map.addTilesetImage(KEYS.TILESET_BLEAK, KEYS.TILESET_BLEAK);
        const tilesetDark = map.addTilesetImage(KEYS.TILESET_DARK, KEYS.TILESET_DARK);

        this.groundLayerGreen = map.createBlankLayer('GroundGreen', tilesetGreen);
        this.groundLayerGreen.fill(5).setScale(2).setDepth(0);

        this.groundLayerBleak = map.createBlankLayer('GroundBleak', tilesetBleak);
        this.groundLayerBleak.fill(5).setScale(2).setDepth(0).setVisible(false);

        this.groundLayerDark = map.createBlankLayer('GroundDark', tilesetDark);
        this.groundLayerDark.fill(5).setScale(2).setDepth(0).setVisible(false);

        if (isLevel2) {
            this.groundLayerGreen.setVisible(false);
            this.groundLayerDark.setVisible(true);
        }

        // Create player in center (Safe Zone)
        this.player = new PlayerMain(this, 1500, 1500);

        // Track entities
        this.enemies = [];
        this.enemiesGroup = this.physics.add.group();
        this.weaponsGroup = this.physics.add.group(); // General weapons group
        this.playerBullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            maxSize: 100,
            runChildUpdate: true
        });

        // Prop Clustered Generation
        const propGroup = this.physics.add.staticGroup();

        const makeProp = (baseKey, minScale, maxScale, isStatic = true) => {
            const suffix = isLevel2 ? '_DARK' : '_GREEN';
            const fullKey = baseKey + suffix;
            const key = KEYS[fullKey] || KEYS[baseKey];
            return (scene, x, y) => new BaseProp(scene, x, y, key, Phaser.Math.FloatBetween(minScale, maxScale), isStatic);
        };

        const natureProps = [
            makeProp('TREE_5_BIG', 2.1, 2.6),
            makeProp('TREE_6_PINE_BIG', 2.1, 2.6),
            makeProp('TREE_7_BIRCH', 1.9, 2.4),
            makeProp('TREE_8_BIRCH', 1.9, 2.4),
            makeProp('TREE_9_SMALL_OAK', 1.7, 2.1),
            makeProp('TREE_10_SMALL_OAK', 1.7, 2.1),
            makeProp('TREE_3_NORMAL', 1.9, 2.3),
            makeProp('TREE_2_SPRUCE_SPARSE', 1.9, 2.3),
            makeProp('BUSH', 1.5, 2.0),
            makeProp('BUSH_2', 1.5, 2.0)
        ];
        const junkProps = [
            makeProp('TREE_TRUNK_2_GRASS', 1.8, 2.2),
            makeProp('ROCK_GRASS', 1.5, 1.9)
        ];
        const urbanProps = [
            makeProp('CAR', 1.9, 2.3),
            makeProp('ROCK_GRASS', 1.5, 1.9),
            makeProp('TREE_5_BIG', 2.1, 2.6)
        ];

        // Organic Cluster-Based Prop Spawning
        const numClusters = isLevel2 ? 110 : 80;
        for (let i = 0; i < numClusters; i++) {
            let centerX = Phaser.Math.Between(200, WORLD_SIZE - 200);
            let centerY = Phaser.Math.Between(200, WORLD_SIZE - 200);

            // Keep spawn area clear of obstacles
            if (Phaser.Math.Distance.Between(centerX, centerY, 1500, 1500) < 300) {
                continue;
            }

            const isJunk = Math.random() < 0.15;
            const isUrban = Math.random() < 0.10;
            const listToUse = isJunk ? junkProps : (isUrban ? urbanProps : natureProps);
            const clusterSize = Phaser.Math.Between(3, 8);

            for (let j = 0; j < clusterSize; j++) {
                const px = centerX + Phaser.Math.Between(-80, 80);
                const py = centerY + Phaser.Math.Between(-80, 80);

                if (px < 50 || px > WORLD_SIZE - 50 || py < 50 || py > WORLD_SIZE - 50) continue;
                if (Phaser.Math.Distance.Between(px, py, 1500, 1500) < 250) continue;

                const propBuilder = Phaser.Utils.Array.GetRandom(listToUse);
                const prop = propBuilder(this, px, py);
                propGroup.add(prop);
            }
        }

        // Colliders and Overlaps
        this.physics.add.collider(this.player, propGroup);
        this.physics.add.collider(this.enemiesGroup, propGroup);
        this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
        
        this.physics.add.overlap(this.player, this.weaponsGroup, (p, weaponPickup) => {
            weaponPickup.pickup(this.player);
        });

        // Trigger damage on contact
        this.physics.add.overlap(this.player, this.enemiesGroup, (p, enemy) => {
            if (!enemy.isDying) {
                enemy.attack();
                if (this.player.takeDamage && !this.isImmortal) {
                    this.player.takeDamage(1);
                }
            }
        });

        // Shotgun Projectiles vs Obstacles/Enemies
        this.physics.add.overlap(this.playerBullets, propGroup, (bullet) => {
            if (bullet.active) {
                bullet.setActive(false);
                bullet.setVisible(false);
            }
        });

        this.physics.add.overlap(this.playerBullets, this.enemiesGroup, (bullet, enemy) => {
            if (bullet.active && enemy.active && !enemy.isDying) {
                if (!bullet.hitEnemies) bullet.hitEnemies = new Set();
                if (bullet.hitEnemies.has(enemy)) return;

                bullet.hitEnemies.add(enemy);
                bullet.debugHitAnything = true;
                
                // Calculando Falloff
                const distance = Phaser.Math.Distance.Between(bullet.spawnX, bullet.spawnY, enemy.x, enemy.y);
                
                // Clone config to apply Phase damage multiplier
                const phaseMult = 1 + (this.progressionManager ? (this.progressionManager.currentPhase - 1) * 0.3 : 0);
                const modifiedConfig = { ...bullet.config, baseDamage: (bullet.config.baseDamage || 1) * phaseMult };
                
                enemy.takeDamage(modifiedConfig, bullet.x, bullet.y, distance);
                
                this.spawnBlood(bullet.x, bullet.y, bullet.body.velocity);
                
                if (window.WEAPON_DEBUG) {
                    this.drawDebugLine(bullet.spawnX, bullet.spawnY, enemy.x, enemy.y, 0x00ff00);
                }

                if (bullet.pierce !== undefined) {
                    bullet.pierce--;
                    if (bullet.pierce <= 0) {
                        bullet.setActive(false);
                        bullet.setVisible(false);
                        bullet.body.enable = false;
                    }
                } else {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                    bullet.body.enable = false;
                }
            }
        });

        // Listen for weapon shooting event
        this.events.on('weaponFired', this.handleWeaponFired, this);
        this.events.on('playerDied', this.handleGameOverSequence, this);
        this.events.on('phaseChanged', this.handlePhaseChanged, this);

        // Transition zone at right edge of map
        const transitionZone = this.add.zone(3100, 1600).setSize(200, 3200);
        this.physics.world.enable(transitionZone, 0); // Static Body
        transitionZone.body.setAllowGravity(false);
        transitionZone.body.moves = false;
        
        this.physics.add.overlap(this.player, transitionZone, () => {
            const nextScene = isLevel2 ? SCENES.LEVEL1 : SCENES.LEVEL2;
            this.scene.stop(SCENES.HUD);
            this.scene.start(nextScene);
        });

        // Camera setup
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(2.0);

        // Spatial Grid for Boids AI flocking calculations
        this.grid = new SpatialHashGrid(80);

        this.progressionManager = new ProgressionManager(this);
        this.spawnDirector = new SpawnDirector(this, this.progressionManager, this.player, this.enemies, this.enemiesGroup);

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.cursorsWASD = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.actionKeys = this.input.keyboard.addKeys({
            punch: Phaser.Input.Keyboard.KeyCodes.SPACE,
            pickup: Phaser.Input.Keyboard.KeyCodes.E
        });
        
        // Debug/Cheat keys
        this.cheatPhaseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.cheatImmortalKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.debugToggleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F2);
        this.isImmortal = false;

        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.infoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

        // Start HudScene in parallel on top
        this.scene.launch(SCENES.HUD, { levelScene: this });

        // Clean up listeners on shutdown
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.events.off('weaponFired', this.handleWeaponFired, this);
            this.events.off('playerDied', this.handleGameOverSequence, this);
            this.events.off('phaseChanged', this.handlePhaseChanged, this);
        });
    }

    handlePhaseChanged(phase) {
        // Player Buffs
        const healthComp = this.player.getComponent('health');
        if (healthComp) {
            healthComp.setMaxHp(healthComp.maxHp + 2);
            healthComp.heal(2);
            this.events.emit('hpChanged', healthComp.hp);
        }
        
        // Visual Feedback
        if (phase === 2) {
            if (this.groundLayerGreen) this.groundLayerGreen.setVisible(false);
            if (this.groundLayerBleak) this.groundLayerBleak.setVisible(true);
            this.cameras.main.flash(800, 255, 200, 0); // Yellowish flash
        } else if (phase === 3) {
            if (this.groundLayerBleak) this.groundLayerBleak.setVisible(false);
            if (this.groundLayerDark) this.groundLayerDark.setVisible(true);
            this.cameras.main.flash(800, 255, 0, 0); // Reddish flash
        } else {
            this.cameras.main.flash(500, 255, 255, 255);
        }
        this.cameras.main.shake(500, 0.015);
    }

    handleGameOverSequence() {
        // Efeito Matrix / Slow motion
        this.physics.world.timeScale = 3.0; 
        
        // Câmera aproxima (Zoom)
        this.cameras.main.zoomTo(3.5, 2000, 'Sine.easeInOut');
        
        // Partial red overlay — stops at 0.35 alpha so the dead character stays visible
        if (!this.deathRedOverlay) {
            this.deathRedOverlay = this.add.rectangle(0, 0, 6000, 6000, 0x660000, 0)
                .setOrigin(0)
                .setDepth(999)
                .setScrollFactor(0);
        }
        this.tweens.add({
            targets: this.deathRedOverlay,
            alpha: 0.35,
            duration: 2500,
            ease: 'Sine.easeIn'
        });
        
        this.time.delayedCall(2500, () => {
            this.physics.world.pause();
            const hud = this.scene.get(SCENES.HUD);
            if (hud) hud.showGameOver();
        });
    }

    update(time, delta) {
        // Cheat Key: 'P' to skip to next phase
        if (Phaser.Input.Keyboard.JustDown(this.cheatPhaseKey)) {
            if (this.progressionManager) {
                if (this.progressionManager.currentPhase < 3) {
                    this.progressionManager.timeSurvived = this.progressionManager.phaseTimings[this.progressionManager.currentPhase + 1];
                    this.progressionManager.setPhase(this.progressionManager.currentPhase + 1);
                } else {
                    this.progressionManager.setThreat(this.progressionManager.currentThreat + 1);
                }
            }
        }

        // Cheat Key: 'I' for immortality toggle
        if (Phaser.Input.Keyboard.JustDown(this.cheatImmortalKey)) {
            this.isImmortal = !this.isImmortal;
            console.log(`[Cheat] God Mode: ${this.isImmortal ? 'ON' : 'OFF'}`);
            if (this.isImmortal) {
                this.cameras.main.flash(200, 0, 255, 0); // Green flash for God Mode ON
            } else {
                this.cameras.main.flash(200, 255, 0, 0); // Red flash for God Mode OFF
            }
        }

        // Toggle debug mode key
        if (Phaser.Input.Keyboard.JustDown(this.debugToggleKey)) {
            if (this.physics.world.debugGraphic) {
                this.physics.world.debugGraphic.destroy();
                this.physics.world.debugGraphic = null;
                this.physics.world.drawDebug = false;
            } else {
                this.physics.world.createDebugGraphic();
                this.physics.world.drawDebug = true;
            }
        }

        // ESC Menu Key Management
        if (!this.menuKeyReady) {
            if (this.menuKey.isUp) {
                this.menuKeyReady = true;
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
            if (this.isInfoMenuOpen) {
                this.closeInfo();
            }
            this.togglePause();
            return;
        }

        // B Info Menu Key Management
        if (!this.infoMenuKeyReady) {
            if (this.infoKey.isUp) {
                this.infoMenuKeyReady = true;
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.infoKey)) {
            if (this.isPauseMenuOpen) {
                this.closePause();
            }
            this.toggleInfo();
            return;
        }

        // Stop updates if paused
        if (this.isPauseMenuOpen || this.isInfoMenuOpen) {
            return;
        }

        this.frameCount++;
        this.player.update(this.cursors, this.cursorsWASD, this.actionKeys);
        this.processPlayerMeleeAttack();

        // 1. CLEAR & POPULATE SPATIAL GRID
        this.grid.clear();
        for (let enemy of this.enemies) {
            if (enemy.active) this.grid.insert(enemy);
        }

        // 2. SECTOR SURROUND CALCULATIONS (For Leaders)
        const sectorCounts = new Array(8).fill(0);
        for (let enemy of this.enemies) {
            if (!enemy.active) continue;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < 800) {
                let angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
                if (angle < 0) angle += Math.PI * 2;
                const sector = Math.floor((angle / (Math.PI * 2)) * 8) % 8;
                sectorCounts[sector]++;
            }
        }
        
        let minSector = 0;
        let minCount = Infinity;
        for (let i = 0; i < 8; i++) {
            if (sectorCounts[i] < minCount) {
                minCount = sectorCounts[i];
                minSector = i;
            }
        }
        this.emptySectorAngle = (minSector * (Math.PI / 4)) + (Math.PI / 8);

        // Phase 1: Compute AI behaviors
        for (let enemy of this.enemies) {
            enemy.computeAI(time, delta, this.frameCount);
            
            // Aggressively recycle far enemies
            const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (distToPlayer > 1200) {
                this.spawnBudget += enemy.cost || 1;
                enemy.destroy();
            }
        }

        this.enemies = this.enemies.filter(e => e.active);

        // Phase 2: Apply AI vectors
        for (let enemy of this.enemies) {
            enemy.applyAI();
        }

        if (this.enemies.length > 300) return;

        // Progression & Budget Spawning Update
        this.progressionManager.update(delta);
        
        // Emit time to HUD (only emit every whole second to save perf)
        const dt = delta / 1000;
        if (Math.floor(this.progressionManager.timeSurvived) > Math.floor(this.progressionManager.timeSurvived - dt)) {
            this.events.emit('timeChanged', Math.floor(this.progressionManager.timeSurvived));
        }

        this.spawnDirector.update(time, delta);
    }

    processPlayerMeleeAttack() {
        if (!this.player.consumePunchHit || !this.player.consumePunchHit()) {
            return;
        }
        const attackArea = this.player.getMeleeAttackArea
            ? this.player.getMeleeAttackArea()
            : { x: this.player.x, y: this.player.y + 34, radius: 34 };
        
        const hitX = attackArea.x;
        const hitY = attackArea.y;
        const hitRadius = attackArea.radius;

        // Damage overlapping enemies
        this.enemies.forEach((enemy) => {
            if (!enemy.active || enemy.isDying) return;
            const dist = Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y);
            if (dist <= hitRadius + 16) {
                enemy.takeDamage(1, this.player.x, this.player.y);
            }
        });
    }

    handleEnemyDeath(x, y, enemy) {
        let points = 1;
        let dropChance = 0.15; // Small zombie defaults

        if (enemy instanceof ZombieBig) {
            points = 5;
            dropChance = 0.60;
        } else if (enemy instanceof ZombieAxe) {
            points = 3;
            dropChance = 0.35;
        }

        this.kills += points;
        this.events.emit('killChanged', this.kills);

        // Chance to drop a random weapon on death based on enemy tier
        if (Math.random() < dropChance) {
            this.spawnWeaponDrop(x, y);
        }
    }

    spawnWeaponDrop(x, y) {
        const rand = Math.random();
        let weaponPickup;
        if (rand < 0.33) {
            weaponPickup = new Shotgun(this, x, y);
        } else if (rand < 0.66) {
            weaponPickup = new Pistol(this, x, y);
        } else {
            weaponPickup = new Gun(this, x, y);
        }
        
        // Scale ammo by phase
        if (this.progressionManager) {
            const phaseMult = 1 + (this.progressionManager.currentPhase - 1) * 0.2;
            if (weaponPickup.ammo) {
                weaponPickup.ammo = Math.floor(weaponPickup.ammo * phaseMult);
            }
        }
        
        this.weaponsGroup.add(weaponPickup);
    }

    spawnBlood(x, y, velocity) {
        if (!this.textures.exists('blood_particle')) {
            const g = this.make.graphics({x: 0, y: 0, add: false});
            g.fillStyle(0x8a0303, 1);
            g.fillRect(0, 0, 4, 4);
            g.generateTexture('blood_particle', 4, 4);
        }

        const angle = Math.atan2(velocity.y, velocity.x);
        const angleDeg = Phaser.Math.RadToDeg(angle);

        const emitter = this.add.particles(x, y, 'blood_particle', {
            speed: { min: 50, max: 200 },
            angle: { min: angleDeg - 25, max: angleDeg + 25 },
            scale: { start: 1, end: 0 },
            lifespan: 250,
            gravityY: 0,
            quantity: 5,
            blendMode: 'NORMAL'
        });
        emitter.setDepth(this.player.depth + 1);

        this.time.delayedCall(250, () => {
            emitter.destroy();
        });
    }

    drawDebugLine(x1, y1, x2, y2, color) {
        const g = this.add.graphics();
        g.lineStyle(2, color, 0.8);
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.strokePath();
        g.setDepth(this.player.depth + 10);
        
        this.time.delayedCall(3000, () => {
            if (g && g.active) g.destroy();
        });
    }

    drawDebugCone(x, y, facing, weaponId) {
        // Draw the spread cone for visualization
        const config = WEAPON_CONFIG[weaponId] || WEAPON_CONFIG.pistol;
        if (!config.spreadAngle) return;
        
        // We need the center angle
        const directions = {
            'down': Math.PI / 2,
            'up': -Math.PI / 2,
            'side': 0,
            'side_left': Math.PI 
        };
        const centerAngle = directions[facing] ?? directions.down;
        const radius = config.falloff ? config.falloff.shortRange : 150;
        
        const g = this.add.graphics();
        g.fillStyle(0xffff00, 0.1);
        g.lineStyle(1, 0xffff00, 0.5);
        g.beginPath();
        g.moveTo(x, y);
        g.arc(x, y, radius, centerAngle - config.spreadAngle/2, centerAngle + config.spreadAngle/2);
        g.closePath();
        g.fillPath();
        g.strokePath();
        g.setDepth(this.player.depth - 1);
        
        this.time.delayedCall(300, () => {
            if (g && g.active) g.destroy();
        });
    }

    handleWeaponFired(x, y, bulletDefs, facing, weaponId) {
        // Game Feel: Screen Shake and Hit Pause
        const shakeIntensity = weaponId === 'shotgun' ? 0.015 : 0.005;
        this.cameras.main.shake(150, shakeIntensity);
        
        // Slight hit stop (freeze frame for a fraction of a second) for massive shotgun impact feel
        if (weaponId === 'shotgun') {
            this.physics.world.pause();
            this.time.delayedCall(60, () => {
                this.physics.world.resume();
            });
        }

        // Show gunfire flash (Muzzle Flash particle)
        let fx = x;
        let fy = y;
        let angleDeg = 0;
        let muzzleFacing = facing;

        if (facing === 'side') {
            fx += 28;
            fy += 2;
            angleDeg = 0;
        } else if (facing === 'side_left') {
            fx -= 28;
            fy += 2;
            angleDeg = 180;
        } else if (facing === 'up') {
            fx += 1;
            fy -= 28;
            angleDeg = 270;
        } else if (facing === 'down') {
            fx += 1;
            fy += 28;
            angleDeg = 90;
        }

        const animKey = `anim_muzzle_flash_${muzzleFacing}`;
        const textureKey = `muzzle_flash_${muzzleFacing}`;
        const muzzleFlash = this.add.sprite(fx, fy, textureKey)
            .setFrame(0)
            .setAngle(angleDeg)
            .setScale(1.5)
            .setDepth(this.player.depth + 2);

        // Se falhar a animação por algum motivo, garantimos a destruição
        try {
            muzzleFlash.play(animKey);
            muzzleFlash.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                if (muzzleFlash.active) muzzleFlash.destroy();
            });
        } catch (e) {
            console.warn("Muzzle flash animation missing:", animKey);
        }
        
        // Fallback rápido caso fique preso
        this.time.delayedCall(100, () => {
            if (muzzleFlash && muzzleFlash.active) muzzleFlash.destroy();
        });

        // --- DEBUG MODE ---
        if (window.WEAPON_DEBUG) {
            this.drawDebugCone(x, y, facing, weaponId);
        }

        // Spawn bullet projectiles using Object Pool and Config
        bulletDefs.forEach((def) => {
            const config = def.config;
            let bullet = this.playerBullets.get(def.x, def.y, 'bullet_shotgun');
            
            if (bullet) {
                bullet.enableBody(true, def.x, def.y, true, true);
                bullet.setDepth(this.player.depth + 1);
                bullet.setScale(1.2);
                
                if (weaponId === 'pistol' || weaponId === 'gun') {
                    bullet.setScale(1.0);
                }
                bullet.clearTint();

                bullet.weaponId = weaponId;
                bullet.config = config;
                bullet.pierce = config.pierce;
                bullet.hitEnemies = new Set();
                bullet.debugHitAnything = false;
                
                // Physics setup (Simple rectangle to avoid setCircle offset bugs)
                if (!bullet.hasHitboxSetup) {
                    bullet.body.setAllowGravity(false);
                    // Use a slightly larger rectangle for aim assist, centered on the sprite
                    const w = bullet.width * 2;
                    const h = bullet.height * 2;
                    bullet.body.setSize(w, h);
                    bullet.hasHitboxSetup = true;
                }
                
                const vx = Math.cos(def.angle) * config.speed;
                const vy = Math.sin(def.angle) * config.speed;
                bullet.setVelocity(vx, vy);
                bullet.setAngle(def.angle * (180 / Math.PI));
                bullet.spawnX = def.x;
                bullet.spawnY = def.y;

                // Auto-destruction off-screen
                bullet.update = () => {
                    if (bullet.active && !this.cameras.main.worldView.contains(bullet.x, bullet.y)) {
                        bullet.setActive(false);
                        bullet.setVisible(false);
                        if (window.WEAPON_DEBUG && !bullet.debugHitAnything) {
                            this.drawDebugLine(bullet.spawnX, bullet.spawnY, bullet.x, bullet.y, 0xff0000);
                        }
                    }
                };
            }
        });
    }

    // --- PAUSE MENU DELEGATION ---
    togglePause() {
        if (this.isPauseMenuOpen) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        this.isPauseMenuOpen = true;
        this.physics.world.pause();
        this.player.setVelocity(0, 0);
        this.events.emit('pauseStateChanged', true);
    }

    resumeGame() {
        this.isPauseMenuOpen = false;
        this.physics.world.resume();
        this.events.emit('pauseStateChanged', false);
    }

    closePause() {
        this.resumeGame();
    }

    // --- INFO MENU DELEGATION ---
    toggleInfo() {
        if (this.isInfoMenuOpen) {
            this.closeInfo();
        } else {
            this.openInfo();
        }
    }

    openInfo() {
        this.isInfoMenuOpen = true;
        this.physics.world.pause();
        this.player.setVelocity(0, 0);
        this.events.emit('infoStateChanged', true);
    }

    closeInfo() {
        this.isInfoMenuOpen = false;
        this.physics.world.resume();
        this.events.emit('infoStateChanged', false);
    }
}

// thin subclasses registered twice in the Scene Configuration of main.js
export class Level1 extends PlayScene {
    constructor() {
        super({ key: SCENES.LEVEL1 });
    }
    
    init(data) {
        super.init(data);
        this.levelNumber = 1;
    }
}

export class Level2 extends PlayScene {
    constructor() {
        super({ key: SCENES.LEVEL2 });
    }
    
    init(data) {
        super.init(data);
        this.levelNumber = 2;
    }
}
