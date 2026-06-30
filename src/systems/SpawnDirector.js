import ZombieSmall from '../entities/enemies/ZombieSmall.js';
import ZombieAxe from '../entities/enemies/ZombieAxe.js';
import ZombieBig from '../entities/enemies/ZombieBig.js';

export default class SpawnDirector {
    constructor(scene, progressionManager, player, enemiesList, enemiesGroup) {
        this.scene = scene;
        this.progression = progressionManager;
        this.player = player;
        this.enemies = enemiesList;
        this.enemiesGroup = enemiesGroup;

        this.spawnBudget = 0;
        this.spawnCooldown = 0;

        // Configuration
        this.worldSize = 3000;

        // Wave management
        this.waveTypes = ['Rush', 'Heavy', 'Swarm', 'Elite', 'Mixed'];
        this.currentWave = 'Mixed';
        this.waveTimer = 0;
        this.waveDuration = 20; // Seconds per wave style
    }

    update(time, delta) {
        if (this.enemies.length > 300) return; // Hard cap

        const dt = delta / 1000;
        const phase = this.progression.currentPhase;
        const threat = this.progression.currentThreat;

        // Determine level multiplier
        const levelMult = this.scene.levelNumber === 2 ? 1.5 : 1.0;

        // Scaling factors
        // Speed and Health scale slightly with Threat Level
        const speedScale = 1 + (threat * 0.05);
        const healthScale = 1 + (threat * 0.1);

        // Wave management
        this.waveTimer -= dt;
        if (this.waveTimer <= 0 && phase >= 3) {
            this.currentWave = Phaser.Utils.Array.GetRandom(this.waveTypes);
            this.waveTimer = Phaser.Math.Between(15, 30);
            console.log(`[SpawnDirector] New Wave Type: ${this.currentWave}`);
        } else if (phase < 3) {
            this.currentWave = 'Mixed';
        }

        // Base rates
        let baseSpawnRate = 0.2 + (phase * 0.2) + (threat * 0.1);
        let baseBudgetRate = 1 + (phase * 2) + (threat * 2);

        // Apply Wave modifiers (Only applies if Phase >= 3)
        if (phase >= 3) {
            switch (this.currentWave) {
                case 'Rush':
                    baseSpawnRate *= 1.5;
                    baseBudgetRate *= 1.2;
                    break;
                case 'Heavy':
                    baseSpawnRate *= 0.5;
                    baseBudgetRate *= 1.5;
                    break;
                case 'Swarm':
                    baseSpawnRate *= 2.0;
                    baseBudgetRate *= 1.5;
                    break;
                case 'Elite':
                    baseSpawnRate *= 0.5;
                    baseBudgetRate *= 2.0;
                    break;
            }
        }

        // Panic Edge Multiplier
        const edgeThreshold = 400;
        const minDistanceToEdge = Math.min(
            this.player.x,
            this.worldSize - this.player.x,
            this.player.y,
            this.worldSize - this.player.y
        );
        const nearEdge = minDistanceToEdge < edgeThreshold;
        const edgeMultiplier = nearEdge ? 3.0 : 1.0;
        
        const runMultiplier = (this.player.body.velocity.length() > 50) ? 1.6 : 1.0;

        const spawnRate = baseSpawnRate * edgeMultiplier * runMultiplier * levelMult;
        const budgetRate = baseBudgetRate * edgeMultiplier * runMultiplier * levelMult;

        this.spawnBudget += budgetRate * dt;
        this.spawnCooldown -= dt;

        if (this.spawnCooldown <= 0) {
            this.spawnCooldown = 1 / spawnRate;
            this.spawnHorde(phase, threat, speedScale, healthScale, nearEdge);
        }
    }

    spawnHorde(phase, threat, speedScale, healthScale, nearEdge) {
        while (this.spawnBudget >= 1) {
            // Determine Weights based on Phase and Wave Type
            let weights = [];

            if (phase === 1) {
                // Phase 1: Only Walkers
                weights = [{ type: ZombieSmall, cost: 1, weight: 10 }];
            } else if (phase === 2) {
                // Phase 2: Walkers and Runners
                weights = [
                    { type: ZombieSmall, cost: 1, weight: 7 },
                    { type: ZombieAxe, cost: 2, weight: 3 }
                ];
            } else {
                // Phase 3+: All enemies
                // Phase 3+: All enemies
                let wSmall = 7, wAxe = 4, wBig = 4;
                
                // Threat increases Elite/Big chances
                wBig += (threat * 1.5);
                
                // Wave type modifies weights
                if (this.currentWave === 'Rush') {
                    wAxe += 5; // More runners
                } else if (this.currentWave === 'Heavy' || this.currentWave === 'Elite') {
                    wBig += 10; // More brutes
                } else if (this.currentWave === 'Swarm') {
                    wSmall += 10; // Lots of small zombies
                }

                weights = [
                    { type: ZombieSmall, cost: 1, weight: wSmall },
                    { type: ZombieAxe, cost: 2, weight: wAxe },
                    { type: ZombieBig, cost: 7, weight: wBig }
                ];
            }

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

            // Horde Size limits
            let idealHordeSize = Math.floor(5 + phase + (threat * 0.5));
            if (this.currentWave === 'Swarm') idealHordeSize *= 2;
            
            let affordableSize = Math.floor(this.spawnBudget / selectedEnemyDef.cost);
            if (affordableSize > idealHordeSize) affordableSize = idealHordeSize;

            if (affordableSize < 1) break;

            this.spawnBudget -= selectedEnemyDef.cost * affordableSize;

            // Spawn Location
            let spawnAngle = 0;
            let dist = Phaser.Math.Between(900, 1100);
            
            const playerVelocity = this.player.body.velocity;
            const isRunning = playerVelocity.length() > 50;

            if (isRunning) {
                const forwardAngle = Math.atan2(playerVelocity.y, playerVelocity.x);
                const arcAngles = [-Math.PI/3, -Math.PI/6, 0, Math.PI/6, Math.PI/3];
                spawnAngle = forwardAngle + Phaser.Utils.Array.GetRandom(arcAngles);
                dist = Phaser.Math.Between(750, 900);
            } else if (nearEdge) {
                const dxCenter = (this.worldSize / 2) - this.player.x;
                const dyCenter = (this.worldSize / 2) - this.player.y;
                spawnAngle = Math.atan2(dyCenter, dxCenter) + Phaser.Math.FloatBetween(-Math.PI/4, Math.PI/4);
            } else {
                spawnAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            }

            let sx = this.player.x + Math.cos(spawnAngle) * dist;
            let sy = this.player.y + Math.sin(spawnAngle) * dist;
            sx = Phaser.Math.Clamp(sx, 50, this.worldSize - 50);
            sy = Phaser.Math.Clamp(sy, 50, this.worldSize - 50);

            // Spawn Leader
            const leaderInst = new selectedEnemyDef.type(this.scene, sx, sy, this.player, null);
            leaderInst.on('died', (x, y) => this.scene.handleEnemyDeath(x, y, leaderInst));
            
            // Apply scale
            leaderInst.speed *= speedScale;
            if (this.currentWave === 'Rush') leaderInst.speed *= 1.2;
            
            const healthComp = leaderInst.getComponent('health');
            if (healthComp) {
                const scaledHp = Math.round(healthComp.maxHp * healthScale);
                healthComp.setMaxHp(scaledHp);
            }

            this.scene.enemies.push(leaderInst);
            this.enemiesGroup.add(leaderInst);

            // Spawn Followers
            for (let i = 1; i < affordableSize; i++) {
                const fx = sx + Phaser.Math.Between(-30, 30);
                const fy = sy + Phaser.Math.Between(-30, 30);
                const followerInst = new selectedEnemyDef.type(this.scene, fx, fy, this.player, leaderInst);
                followerInst.offsetX = Phaser.Math.Between(-80, 80);
                followerInst.offsetY = Phaser.Math.Between(-80, 80);
                followerInst.on('died', (x, y) => this.scene.handleEnemyDeath(x, y, followerInst));

                followerInst.speed *= speedScale;
                if (this.currentWave === 'Rush') followerInst.speed *= 1.2;
                
                const followerHealth = followerInst.getComponent('health');
                if (followerHealth) {
                    const scaledHp = Math.round(followerHealth.maxHp * healthScale);
                    followerHealth.setMaxHp(scaledHp);
                }

                this.scene.enemies.push(followerInst);
                this.enemiesGroup.add(followerInst);
            }
        }
    }
}
