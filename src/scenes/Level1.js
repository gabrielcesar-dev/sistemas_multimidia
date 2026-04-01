import { KEYS, SCENES } from '../config/constants.js';
import { PLAYER_TYPE } from '../config/player.js';
import PlayerMain from '../entities/PlayerMain.js';
import PlayerSoldier from '../entities/PlayerSoldier.js';

import ZombieSmall from '../entities/enemies/ZombieSmall.js';
import ZombieAxe from '../entities/enemies/ZombieAxe.js';
import ZombieBig from '../entities/enemies/ZombieBig.js';
import Shotgun from '../entities/props/Shotgun.js';
import Tree from '../entities/props/Tree.js';
import Bush from '../entities/props/Bush.js';
import Car from '../entities/props/Car.js';
import Bush2Green from '../entities/props/Bush2Green.js';
import RockGrassGreen from '../entities/props/RockGrassGreen.js';
import Tree2SpruceSparseGreen from '../entities/props/Tree2SpruceSparseGreen.js';
import Tree3NormalGreen from '../entities/props/Tree3NormalGreen.js';
import Tree5BigGreen from '../entities/props/Tree5BigGreen.js';
import Tree6PineBigGreen from '../entities/props/Tree6PineBigGreen.js';
import Tree7BirchGreen from '../entities/props/Tree7BirchGreen.js';
import SpatialHashGrid from '../utils/SpatialHashGrid.js';
import Tree8BirchGreen from '../entities/props/Tree8BirchGreen.js';
import Tree9SmallOakGreen from '../entities/props/Tree9SmallOakGreen.js';
import Tree10SmallOakGreen from '../entities/props/Tree10SmallOakGreen.js';
import TreeTrunk2GrassGreen from '../entities/props/TreeTrunk2GrassGreen.js';

const WORLD_SIZE = 3000;
const PAUSE_MENU_DEPTH = 100000;

export default class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.LEVEL1 });
        this.isPauseMenuOpen = false;
        this.menuKeyReady = false;
        // NOVO: controle do menu de informações (B)
        this.isInfoMenuOpen = false;
        this.infoMenuKeyReady = false;
    }

    create() {
        this.isPauseMenuOpen = false;
        this.menuKeyReady = false;
        this.isInfoMenuOpen = false;
        this.infoMenuKeyReady = false;
        this.killCount = 0;

        // World physics bounds
        this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

        // Pick a random biome mood for the floor
        const biomeKeys = [KEYS.TILESET_GREEN, KEYS.TILESET_BLEAK, KEYS.TILESET_DARK];
        const randomBiome = Phaser.Math.RND.pick(biomeKeys);

        // Floor: random biome tile each run (Roguelike variety)
        const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: 200, height: 200 });
        const tileset = map.addTilesetImage(randomBiome, randomBiome);
        const groundLayer = map.createBlankLayer('Ground', tileset);

        // Fill the entire map with the plain green grass (Index 5)
        groundLayer.fill(5);

        groundLayer.setScale(2);
        groundLayer.setDepth(0);

        // Player at the exact center (Safe Zone explicitly 1500, 1500)
        const selectedPlayerType = this.registry.get('selectedPlayerType') || PLAYER_TYPE;
        this.player = selectedPlayerType === 'soldier'
            ? new PlayerSoldier(this, 1500, 1500)
            : new PlayerMain(this, 1500, 1500);

        // Track entities
        this.enemies = [];
        this.enemiesGroup = this.physics.add.group();
        this.shotguns = this.physics.add.group();


        // Organic Cluster-Based Prop Spawning (Minecraft-style biome generation)
        const propGroup = this.physics.add.staticGroup();

        // Prop tiers
        const natureProps = [Tree, Tree2SpruceSparseGreen, Tree3NormalGreen, Tree7BirchGreen, Tree8BirchGreen, Tree9SmallOakGreen, Tree10SmallOakGreen, Bush, Bush2Green];
        const junkProps = [TreeTrunk2GrassGreen, RockGrassGreen];
        const urbanProps = [Tree5BigGreen, Tree6PineBigGreen, Car];

        const numClusters = 110;

        for (let i = 0; i < numClusters; i++) {
            // 1. Pick a random center for the cluster
            let centerX = Phaser.Math.Between(200, WORLD_SIZE - 200);
            let centerY = Phaser.Math.Between(200, WORLD_SIZE - 200);

            // Safe Zone constraint (skip clusters too close to spawn)
            if (Phaser.Math.Distance.Between(centerX, centerY, 1500, 1500) < 300) {
                continue;
            }

            // 2. Weighted Random Roll
            const roll = Math.random();
            let propPool;
            let itemsInCluster;

            if (roll < 0.75) {
                // 75% — Nature: balanced forest patches
                propPool = natureProps;
                itemsInCluster = Phaser.Math.Between(3, 8);
            } else if (roll < 0.95) {
                // 20% — Junk: stumps and rocks
                propPool = junkProps;
                itemsInCluster = Phaser.Math.Between(2, 5);
            } else {
                // 5% — Urban: discarded cars
                propPool = urbanProps;
                itemsInCluster = Phaser.Math.Between(1, 2);
            }

            // 3. Spawn items around the cluster center
            for (let j = 0; j < itemsInCluster; j++) {
                const offsetX = Phaser.Math.Between(-250, 250);
                const offsetY = Phaser.Math.Between(-250, 250);
                const spawnX = Phaser.Math.Clamp(centerX + offsetX, 50, WORLD_SIZE - 50);
                const spawnY = Phaser.Math.Clamp(centerY + offsetY, 50, WORLD_SIZE - 50);

                const PropClass = Phaser.Utils.Array.GetRandom(propPool);
                const prop = new PropClass(this, spawnX, spawnY);
                propGroup.add(prop);
            }
        }

        // Setup Collisions dynamically using the single StaticGroup
        this.physics.add.collider(this.player, propGroup);
        this.physics.add.collider(this.enemiesGroup, this.enemiesGroup);
        this.physics.add.overlap(this.player, this.enemiesGroup, this.handlePlayerEnemyOverlap, null, this);
        
        // Shotgun pickups
        this.physics.add.overlap(this.player, this.shotguns, this.handleShotgunPickup, null, this);

        // Event listeners for enemy death and shotgun firing
        this.events.on('enemyDeath', this.spawnShotgun, this);
        this.events.on('shotgunFired', this.handleShotgunFire, this);


        // Level Transition Zone (Right Edge)
        const transitionZone = this.add.zone(3100, 1600).setSize(200, 3200);
        this.physics.world.enable(transitionZone, 0); // 0 = Static Body type in Phaser
        transitionZone.body.setAllowGravity(false);
        transitionZone.body.moves = false;
        
        this.physics.add.overlap(this.player, transitionZone, () => {
            // Restart the same scene to regenerate a new random map (Infinite Roguelike)
            this.scene.restart();
        });

        // Camera setup
        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
        this.cameras.main.setZoom(2.0);
        // --- HORDE SURVIVAL SPATIAL SYSTEM ---
        this.timeSurvived = 0;
        this.spawnCooldown = 0;
        this.spawnBudget = 0;
        this.grid = new SpatialHashGrid(80); // 80px cell size for optimal Boids lookup
        this.frameCount = 0;

        // Input
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
        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        // NOVO: tecla B para abrir menu de informações
        this.infoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        
        this.createGameHud();
        this.scale.on('resize', this.updateGameHudLayout, this);
        
        this.createPauseMenu();
        this.scale.on('resize', this.updatePauseMenuLayout, this);
        
        // NOVO: criação do menu de informações
        this.createInfoMenu();
        this.scale.on('resize', this.updateInfoMenuLayout, this);
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off('resize', this.updateGameHudLayout, this);
            this.scale.off('resize', this.updatePauseMenuLayout, this);
            this.scale.off('resize', this.updateInfoMenuLayout, this);
        });
    }

    update(time, delta) {
        // --- Lógica de prontidão para a tecla ESC ---
        if (!this.menuKeyReady) {
            if (this.menuKey.isUp) {
                this.menuKeyReady = true;
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
            // Se o menu de info estiver aberto, fecha ele antes de abrir o pause
            if (this.isInfoMenuOpen) {
                this.closeInfoMenu();
            }
            if (this.isPauseMenuOpen) {
                this.closePauseMenu();
            } else {
                this.openPauseMenu();
            }
            return;
        }
        
        // --- Lógica de prontidão para a tecla B (menu de informações) ---
        if (!this.infoMenuKeyReady) {
            if (this.infoKey.isUp) {
                this.infoMenuKeyReady = true;
            }
        } else if (Phaser.Input.Keyboard.JustDown(this.infoKey)) {
            // Se o pause estiver aberto, fecha ele antes de abrir o info
            if (this.isPauseMenuOpen) {
                this.closePauseMenu();
            }
            if (this.isInfoMenuOpen) {
                this.closeInfoMenu();
            } else {
                this.openInfoMenu();
            }
            return;
        }
        
        // Se qualquer menu estiver aberto, não atualiza o jogo
        if (this.isPauseMenuOpen || this.isInfoMenuOpen) {
            return;
        }

        this.frameCount++;
        this.player.update(this.cursors, this.cursorsWASD, this.actionKeys);
        this.processPlayerMeleeAttack();
        this.updateGameHud();
        
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

        // PHASE 1: COMPUTE ALL AI BEHAVIORS
        for (let enemy of this.enemies) {
            enemy.computeAI(time, delta, this.frameCount);
            
            // Garbage collection for enemies left too far behind
            const distToPlayer = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            // Lowered to 1200px. This aggressively recycles falling-behind zombies into front-spawns!
            if (distToPlayer > 1200) {
                // Refund the budget so they immediately respawn near the player, maintaining horde pressure
                this.spawnBudget += enemy.cost || 1;
                enemy.destroy();
            }
        }
        
        // Clean up dead/despawned enemies gracefully before Phase 2
        this.enemies = this.enemies.filter(e => e.active);

        // PHASE 2: APPLY VELOCITY SIMULTANEOUSLY (Crucial for Boids stability)
        for (let enemy of this.enemies) {
            enemy.applyAI();
        }

        // Hard cap on enemies to avoid physics engine crash
        if (this.enemies.length > 300) return;

        // --- HORDE SURVIVAL SYSTEM ---
        const dt = delta / 1000; // Delta in seconds
        this.timeSurvived += dt;

        // 1. Difficulty Scaling
        const difficulty = this.timeSurvived * 0.1;

        // 2. Edge Pressure System (Fake Infinite Map)
        const edgeThreshold = 400;
        const distFromLeft = this.player.x;
        const distFromRight = WORLD_SIZE - this.player.x;
        const distFromTop = this.player.y;
        const distFromBottom = WORLD_SIZE - this.player.y;
        
        const minDistanceToEdge = Math.min(distFromLeft, distFromRight, distFromTop, distFromBottom);
        const nearEdge = minDistanceToEdge < edgeThreshold;

        let edgeMultiplier = 1.0;
        if (nearEdge) {
            edgeMultiplier = 3.0; // Panic mode!
        }
        
        let runMultiplier = 1.0;
        if (this.player.body.velocity.length() > 50) {
            runMultiplier = 1.6; // Create absolute pressure when running
        }

        // 3. Spawning & Budget
        const spawnRate = (1 + difficulty * 0.2) * edgeMultiplier * runMultiplier;
        const budgetRate = (20 + difficulty * 15) * edgeMultiplier * runMultiplier;

        this.spawnBudget += budgetRate * dt;
        this.spawnCooldown -= dt;

        if (this.spawnCooldown <= 0) {
            this.spawnCooldown = 1 / spawnRate;
            
            // Spawn loop: consume budget to spawn Hordes of enemies
            while (this.spawnBudget >= 1) { // 1 is cost of cheapest enemy
                let weights = [
                    { type: ZombieSmall, cost: 1, weight: 7 },
                    { type: ZombieAxe, cost: 2, weight: 4 + (difficulty * 1.4) },
                    { type: ZombieBig, cost: 7, weight: 2 + difficulty }
                ];
                
                const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
                const roll = Math.random() * totalWeight;
                
                let selectedEnemyDef = weights[0];
                let currentWeight = 0;
                for (let i = 0; i < weights.length; i++) {
                    currentWeight += weights[i].weight;
                    if (roll <= currentWeight) {
                        selectedEnemyDef = weights[i];
                        break;
                    }
                }

                // Horde Size scaling with difficulty
                // Cap it at an ideal size to avoid bursting too much at once
                const idealHordeSize = Math.floor(5 + difficulty * 2);
                let affordableSize = Math.floor(this.spawnBudget / selectedEnemyDef.cost);
                if (affordableSize > idealHordeSize) affordableSize = idealHordeSize;
                
                // If we can't afford a single unit, break the loop
                if (affordableSize < 1) break;

                this.spawnBudget -= selectedEnemyDef.cost * affordableSize;

                // 4. Directional & Ring Spawning
                let spawnAngle = 0;
                let dist = Phaser.Math.Between(900, 1100); // Guarantees spawning off-screen
                
                // Anti-Escape System: Check if player is running quickly
                const playerVelocity = this.player.body.velocity;
                const isRunning = playerVelocity.length() > 50;
                
                if (isRunning) {
                    // Constant Frontal Pressure System: Intercept player with an Arc Wall
                    const forwardAngle = Math.atan2(playerVelocity.y, playerVelocity.x);
                    const arcAngles = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
                    const chosenOffset = Phaser.Utils.Array.GetRandom(arcAngles);
                    spawnAngle = forwardAngle + chosenOffset;
                    
                    // Spawn closer to guarantee interception
                    dist = Phaser.Math.Between(750, 900);
                } else if (nearEdge) {
                    // Bias spawning to appear pushing them to map center
                    const dxCenter = (WORLD_SIZE / 2) - this.player.x;
                    const dyCenter = (WORLD_SIZE / 2) - this.player.y;
                    const centerAngle = Math.atan2(dyCenter, dxCenter);
                    // Bias within a 90-degree cone pointing to center
                    spawnAngle = centerAngle + Phaser.Math.FloatBetween(-Math.PI/4, Math.PI/4);
                } else {
                    spawnAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                }

                let sx = this.player.x + Math.cos(spawnAngle) * dist;
                let sy = this.player.y + Math.sin(spawnAngle) * dist;
                sx = Phaser.Math.Clamp(sx, 50, WORLD_SIZE - 50);
                sy = Phaser.Math.Clamp(sy, 50, WORLD_SIZE - 50);

                // Create Leader
                const leaderInst = new selectedEnemyDef.type(this, sx, sy, this.player, null);
                this.enemies.push(leaderInst);
                this.enemiesGroup.add(leaderInst);
                
                // Create Followers
                for (let i = 1; i < affordableSize; i++) {
                    const fx = sx + Phaser.Math.Between(-30, 30);
                    const fy = sy + Phaser.Math.Between(-30, 30);
                    // Provide the leader instance to followers to bypass pathfinding computations!
                    const followerInst = new selectedEnemyDef.type(this, fx, fy, this.player, leaderInst);
                    this.enemies.push(followerInst);
                    this.enemiesGroup.add(followerInst);
                }
            }
        }
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

        for (const enemy of this.enemies) {
            if (!enemy.active) continue;

            const distance = Phaser.Math.Distance.Between(hitX, hitY, enemy.x, enemy.y);
            if (distance <= hitRadius) {
                enemy.takeDamage(1, this.player.x, this.player.y);
            }
        }
    }

    handlePlayerEnemyOverlap(player, enemy) {
        if (!player.takeDamage || !enemy.active || enemy.isDying) {
            return;
        }

        if (player.takeDamage(1)) {
            this.updateGameHud();
        }
    }

    handleShotgunPickup(player, shotgun) {
        shotgun.pickup(player);
        this.updateGameHud();
    }

    spawnShotgun(x, y) {
        const shotgun = new Shotgun(this, x, y);
        this.shotguns.add(shotgun);
    }

    handleShotgunFire(bullets, facing) {
        // bullets is an array of 5 bullet spread positions
        // Each bullet checks for enemies in its path
        
        const bulletRadius = 20; // Collision radius for each bullet
        const hitEnemies = new Set(); // Track to avoid damaging same enemy twice per shot

        bullets.forEach(bullet => {
            this.enemiesGroup.children.entries.forEach(enemy => {
                if (!enemy.active || enemy.isDying || hitEnemies.has(enemy)) return;

                // Check distance from bullet to enemy
                const dx = enemy.x - bullet.x;
                const dy = enemy.y - bullet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < bulletRadius + 15) {
                    hitEnemies.add(enemy);
                    enemy.takeDamage(1, bullet.x, bullet.y);
                }
            });
        });
    }

    createGameHud() {
        const depth =  0;

        // Painel (igual ao pause, mas horizontal no topo)
        this.hudPanel = this.add.rectangle(0, 0, this.scale.width, 60, 0x1c1814, 0.9)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(depth);

        this.hudPanel.setStrokeStyle(2, 0xc2a36a, 1);

        // Vida
        this.hpText = this.add.text(20, 18, '', {
            fontFamily: 'Georgia',
            fontSize: '20px',
            color: '#ff6b6b',
            stroke: '#000000',
            strokeThickness: 4
        })
            .setScrollFactor(0)
            .setDepth(depth + 1);

        // Kill count
        this.killText = this.add.text(this.scale.width - 180, 18, '', {
            fontFamily: 'Georgia',
            fontSize: '20px',
            color: '#f7ead0',
            stroke: '#000000',
            strokeThickness: 4
        })
            .setScrollFactor(0)
            .setDepth(depth + 1);

        // Ammo count
        this.ammoText = this.add.text(this.scale.width - 360, 18, '', {
            fontFamily: 'Georgia',
            fontSize: '20px',
            color: '#ffaa00',
            stroke: '#000000',
            strokeThickness: 4
        })
            .setScrollFactor(0)
            .setDepth(depth + 1);

        this.updateGameHud();
    }
    
    updateGameHud() {
        if (!this.hpText || !this.killText) return;
        // VIDA (mesma lógica que você já tinha)
        const heartCount = Math.ceil(this.player.maxHp / 2);
        let hearts = '';

        for (let i = 0; i < heartCount; i++) {
            const hp = this.player.hp - (i * 2);

            if (hp >= 2) hearts += '1';
            else if (hp === 1) hearts += '0';
            else hearts += '· ';
        }

        this.hpText.setText(`Vida: ${hearts.trim()}`);
        this.killText.setText(`Mortos: ${this.killCount}`);
        
        // Ammo display
        if (this.player.weapon === 'shotgun') {
            this.ammoText.setText(`Munição: ${this.player.ammo}`);
        } else {
            this.ammoText.setText('');
        }
    }
    
    updateGameHudLayout(gameSize) {
        if (!this.hudPanel) return;

        this.hudPanel.setSize(gameSize.width, 60);

        this.hpText.setPosition(20, 18);
        this.killText.setPosition(gameSize.width - 180, 18);
    }

    registerEnemyKill() {
        this.killCount += 1;
        this.updateGameHud();
    }

    // --- MENU DE PAUSA (ESC) ---
    createPauseMenu() {
        this.pauseOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.68)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(PAUSE_MENU_DEPTH)
            .setVisible(false);

        this.pausePanel = this.add.rectangle(0, 0, 320, 220, 0x1c1814, 0.96)
            .setStrokeStyle(3, 0xc2a36a, 1)
            .setScrollFactor(0)
            .setDepth(PAUSE_MENU_DEPTH + 1)
            .setVisible(false);

        this.pauseTitle = this.add.text(0, 0, 'Pausado', {
            fontFamily: 'Georgia',
            fontSize: '28px',
            color: '#f2e7c9',
            stroke: '#000000',
            strokeThickness: 4
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(PAUSE_MENU_DEPTH + 2)
            .setVisible(false);

        this.continueButton = this.createPauseButton('Continuar', () => {
            this.closePauseMenu();
        });

        this.backToMenuButton = this.createPauseButton('Voltar ao inicio', () => {
            this.closePauseMenu();
            this.scene.start(SCENES.MENU);
        });

        this.updatePauseMenuLayout({ width: this.scale.width, height: this.scale.height });
    }

    createPauseButton(label, onClick) {
        const buttonBg = this.add.rectangle(0, 0, 210, 44, 0x4b3924, 1)
            .setStrokeStyle(2, 0xd7b47b, 1)
            .setScrollFactor(0)
            .setDepth(PAUSE_MENU_DEPTH + 2)
            .setVisible(false)
            .setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(0, 0, label, {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#fff4dd'
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(PAUSE_MENU_DEPTH + 3)
            .setVisible(false);

        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x6a5030, 1);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4b3924, 1);
        });

        buttonBg.on('pointerdown', () => {
            buttonBg.setFillStyle(0x8a6942, 1);
        });

        buttonBg.on('pointerup', () => {
            buttonBg.setFillStyle(0x6a5030, 1);
            onClick();
        });

        return { buttonBg, buttonText };
    }

    openPauseMenu() {
        this.isPauseMenuOpen = true;
        this.physics.world.pause();
        this.player.setVelocity(0, 0);

        this.pauseOverlay.setVisible(true);
        this.pausePanel.setVisible(true);
        this.pauseTitle.setVisible(true);
        this.continueButton.buttonBg.setVisible(true);
        this.continueButton.buttonText.setVisible(true);
        this.backToMenuButton.buttonBg.setVisible(true);
        this.backToMenuButton.buttonText.setVisible(true);
    }

    closePauseMenu() {
        this.isPauseMenuOpen = false;
        this.physics.world.resume();

        this.pauseOverlay.setVisible(false);
        this.pausePanel.setVisible(false);
        this.pauseTitle.setVisible(false);
        this.continueButton.buttonBg.setVisible(false);
        this.continueButton.buttonText.setVisible(false);
        this.backToMenuButton.buttonBg.setVisible(false);
        this.backToMenuButton.buttonText.setVisible(false);
    }

    updatePauseMenuLayout(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        const centerX = width / 2;
        const centerY = height / 2;

        if (!this.pauseOverlay) return;

        this.pauseOverlay.setSize(width, height);
        this.pausePanel.setPosition(centerX, centerY);
        this.pauseTitle.setPosition(centerX, centerY - 55);

        this.continueButton.buttonBg.setPosition(centerX, centerY + 5);
        this.continueButton.buttonText.setPosition(centerX, centerY + 5);
        this.backToMenuButton.buttonBg.setPosition(centerX, centerY + 65);
        this.backToMenuButton.buttonText.setPosition(centerX, centerY + 65);
    }

    // --- NOVO: MENU DE INFORMAÇÕES (B) ---
    createInfoMenu() {
        const depth = PAUSE_MENU_DEPTH; // mesma profundidade do pause

        // Overlay escuro igual ao pause
        this.infoOverlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.68)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(depth)
            .setVisible(false);

        // Painel central
        this.infoPanel = this.add.rectangle(0, 0, 320, 220, 0x1c1814, 0.96)
            .setStrokeStyle(3, 0xc2a36a, 1)
            .setScrollFactor(0)
            .setDepth(depth + 1)
            .setVisible(false);

        // Título
        this.infoTitle = this.add.text(0, 0, 'Informações', {
            fontFamily: 'Georgia',
            fontSize: '26px',
            color: '#f2e7c9',
            stroke: '#000000',
            strokeThickness: 4
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(depth + 2)
            .setVisible(false);

        // Texto de vida
        this.infoHealthText = this.add.text(0, 0, '', {
            fontFamily: 'Georgia',
            fontSize: '20px',
            color: '#ff6b6b',
            stroke: '#000000',
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(depth + 2)
            .setVisible(false);

        // Texto de kill count
        this.infoKillText = this.add.text(0, 0, '', {
            fontFamily: 'Georgia',
            fontSize: '20px',
            color: '#f7ead0',
            stroke: '#000000',
            strokeThickness: 3
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(depth + 2)
            .setVisible(false);

        this.updateInfoMenuLayout({ width: this.scale.width, height: this.scale.height });
    }

    openInfoMenu() {
        this.isInfoMenuOpen = true;
        this.physics.world.pause();
        this.player.setVelocity(0, 0);

        // Atualiza os textos com os valores atuais
        this.updateInfoMenuTexts();

        this.infoOverlay.setVisible(true);
        this.infoPanel.setVisible(true);
        this.infoTitle.setVisible(true);
        this.infoHealthText.setVisible(true);
        this.infoKillText.setVisible(true);
    }

    closeInfoMenu() {
        this.isInfoMenuOpen = false;
        this.physics.world.resume();

        this.infoOverlay.setVisible(false);
        this.infoPanel.setVisible(false);
        this.infoTitle.setVisible(false);
        this.infoHealthText.setVisible(false);
        this.infoKillText.setVisible(false);
    }

    updateInfoMenuTexts() {
        // Formata vida igual ao HUD
        const heartCount = Math.ceil(this.player.maxHp / 2);
        let hearts = '';
        for (let i = 0; i < heartCount; i++) {
            const hp = this.player.hp - (i * 2);
            if (hp >= 2) hearts += '♥︎';
            else if (hp === 1) hearts += '♡';
            else hearts += '· ';
        }
        this.infoHealthText.setText(`Vida: ${hearts.trim()}`);
        this.infoKillText.setText(`Mortos: ${this.killCount}`);
    }

    updateInfoMenuLayout(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;
        const centerX = width / 2;
        const centerY = height / 2;

        if (!this.infoOverlay) return;

        this.infoOverlay.setSize(width, height);
        this.infoPanel.setPosition(centerX, centerY);
        this.infoTitle.setPosition(centerX, centerY - 60);

        // Posiciona os textos um abaixo do outro
        this.infoHealthText.setPosition(centerX, centerY + 10);
        this.infoKillText.setPosition(centerX, centerY + 50);
    }
}