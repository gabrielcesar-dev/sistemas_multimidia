import { KEYS, SCENES } from '../config/constants.js';
import Player from '../entities/Player.js';

import ZombieSmall from '../entities/enemies/ZombieSmall.js';
import ZombieAxe from '../entities/enemies/ZombieAxe.js';
import ZombieBig from '../entities/enemies/ZombieBig.js';
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

export default class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.LEVEL1 });
    }

    create() {
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
        this.player = new Player(this, 1500, 1500);

        // Track entities
        this.enemies = [];

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
    }

    update(time, delta) {
        this.frameCount++;
        this.player.update(this.cursors, this.cursorsWASD);
        
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
                    { type: ZombieSmall, cost: 1, weight: 10 },
                    { type: ZombieAxe, cost: 3, weight: difficulty },
                    { type: ZombieBig, cost: 10, weight: difficulty * 0.5 }
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
                
                // Create Followers
                for (let i = 1; i < affordableSize; i++) {
                    const fx = sx + Phaser.Math.Between(-30, 30);
                    const fy = sy + Phaser.Math.Between(-30, 30);
                    // Provide the leader instance to followers to bypass pathfinding computations!
                    const followerInst = new selectedEnemyDef.type(this, fx, fy, this.player, leaderInst);
                    this.enemies.push(followerInst);
                }
            }
        }
    }
}
