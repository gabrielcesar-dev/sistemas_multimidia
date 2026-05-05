export default class 
BaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, textureKey, player, leader, animPrefix) {
        super(scene, x, y, textureKey);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Keep the enemy collider concentrated around the lower body so
        // group-vs-group collision stops stacking without making them feel too bulky.
        this.body.setSize(10, 8);
        this.body.setOffset(3, 8);
        this.body.updateFromGameObject();

        this.player = player;
        this.leader = leader;
        this.animPrefix = animPrefix;
        
        // Parity flag for Phased Updates to massively save CPU
        this.updateParity = Math.random() < 0.5 ? 0 : 1;
        
        // Natural speed variation to stop uniform escaping
        this.speedMod = Phaser.Math.FloatBetween(0.85, 1.25);

        // Two-phase boid variables
        this.nextVx = 0;
        this.nextVy = 0;
        this.hp = 1;
        this.isHurt = false;
        this.hurtUntil = 0;
        this.isDying = false;
        this.lastMoveAxis = 'side';
        this.lastFlipX = false;
    }

    computeAI(time, delta, frameCount) {
        // Y-sorting
        this.setDepth(this.y + this.displayHeight / 2);

        if (!this.player || !this.player.active) return;
        if (this.isDying) return;
        if (this.isHurt && time < this.hurtUntil) return;
        if (this.isHurt && time >= this.hurtUntil) {
            this.isHurt = false;
        }

        // Phased Update (Decision making only every 2 frames)
        if (frameCount % 2 !== this.updateParity) {
             this._updateAnimation();
             return;
        }

        const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);

        let vx = 0;
        let vy = 0;

        // LOD: Far away, simple math. No boids.
        if (distToPlayer > 800) {
            let targetX = this.player.x;
            let targetY = this.player.y;
            if (this.leader && this.leader.active) {
                targetX = this.leader.x;
                targetY = this.leader.y;
            }
            const angle = Math.atan2(targetY - this.y, targetX - this.x);
            vx = Math.cos(angle) * this.speed;
            vy = Math.sin(angle) * this.speed;
        } else {
            const currentSpeed = this.speed * this.speedMod;

            // Close range: Advanced AI
            if (!this.leader || !this.leader.active) {
                this.leader = null; // Ensure promotion to leader
                
                // I AM LEADER: Surround & Pressure
                // Hybrid Direction: 60% Sector, 40% Direct Player
                const sectorAngle = this.scene.emptySectorAngle || 0;
                
                // Anti-Peace: Intercept Future Position
                const futurePlayerX = this.player.x + (this.player.body.velocity.x * 0.5);
                const futurePlayerY = this.player.y + (this.player.body.velocity.y * 0.5);

                // Elastic Horde Dynamic Offset
                const surroundRadius = 200;
                const angleOffset = Phaser.Math.FloatBetween(-Math.PI/6, Math.PI/6);
                const sectorTargetX = futurePlayerX + Math.cos(sectorAngle + angleOffset) * surroundRadius;
                const sectorTargetY = futurePlayerY + Math.sin(sectorAngle + angleOffset) * surroundRadius;
                
                // Weight vectors
                const dirSectorX = sectorTargetX - this.x;
                const dirSectorY = sectorTargetY - this.y;
                const lenSector = Math.sqrt(dirSectorX*dirSectorX + dirSectorY*dirSectorY) || 1;

                const dirPlayerX = futurePlayerX - this.x;
                const dirPlayerY = futurePlayerY - this.y;
                const lenPlayer = Math.sqrt(dirPlayerX*dirPlayerX + dirPlayerY*dirPlayerY) || 1;

                const blendX = (dirSectorX/lenSector)*0.6 + (dirPlayerX/lenPlayer)*0.4;
                const blendY = (dirSectorY/lenSector)*0.6 + (dirPlayerY/lenPlayer)*0.4;
                
                const finalAngle = Math.atan2(blendY, blendX);
                vx = Math.cos(finalAngle) * currentSpeed;
                vy = Math.sin(finalAngle) * currentSpeed;

            } else {
                // I AM FOLLOWER: Boids Swarm Lite
                const neighbors = this.scene.grid.getNeighbors(this, 1); // 1 cell radius -> 3x3 block
                let sepX = 0, sepY = 0;
                let alignX = 0, alignY = 0;
                let alignCount = 0;

                for (let n of neighbors) {
                    if (n === this || !n.body) continue;
                    const d = Phaser.Math.Distance.Between(this.x, this.y, n.x, n.y);
                    
                    // Filter heavily by distance to avoid blob creation
                    if (d > 0 && d < 60) { // Separation Radius
                        // HARD MIN DISTANCE PUSH (Solves 100% of physical overlaps)
                        if (d < 25) {
                            const pushAmt = (25 - d) * 0.5;
                            // Directly nudge position off-pipeline to guarantee decoupling
                            this.x += ((this.x - n.x) / d) * pushAmt;
                            this.y += ((this.y - n.y) / d) * pushAmt;
                        }
                        
                        // Inverse Square Law Force
                        const weight = 1 / (d * d);
                        sepX += ((this.x - n.x) / d) * weight;
                        sepY += ((this.y - n.y) / d) * weight;
                    }
                    if (d > 0 && d < 120) { // Alignment Radius
                        alignX += n.body.velocity.x;
                        alignY += n.body.velocity.y;
                        alignCount++;
                    }
                }

                if (alignCount > 0) {
                    alignX /= alignCount;
                    alignY /= alignCount;
                }

                // Cohesion: Target the Leader
                let cohX = 0, cohY = 0;
                if (this.leader && this.leader.active) {
                    // Offset target so they don't form a perfect single-point blob
                    const targetX = this.leader.x + Phaser.Math.FloatBetween(-30, 30);
                    const targetY = this.leader.y + Phaser.Math.FloatBetween(-30, 30);
                    const angleToLeader = Math.atan2(targetY - this.y, targetX - this.x);
                    cohX = Math.cos(angleToLeader) * currentSpeed;
                    cohY = Math.sin(angleToLeader) * currentSpeed;
                } else {
                    this.leader = null;
                }

                // Senior Fix: Separation mathematically must overpower cohesion to avoid stacking
                vx += (sepX * 3.5) + (cohX * 0.3) + (alignX * 0.4);
                vy += (sepY * 3.5) + (cohY * 0.3) + (alignY * 0.4);
                
                // Add organic noise to break perfect robotic stacking
                vx += Phaser.Math.FloatBetween(-0.5, 0.5) * currentSpeed;
                vy += Phaser.Math.FloatBetween(-0.5, 0.5) * currentSpeed;

                const len = Math.sqrt(vx*vx + vy*vy) || 1;
                vx = (vx / len) * currentSpeed;
                vy = (vy / len) * currentSpeed;
            }
        }

        this.nextVx = vx;
        this.nextVy = vy;
    }
    
    applyAI() {
        if (!this.player || !this.player.active) return;
        if (this.isDying) return;
        if (this.isHurt) {
            return;
        }

        const currentSpeed = this.speed * this.speedMod;

        // Apply velocities smoothly using Lerp to provide inertia and heavy body weight
        let finalVx = Phaser.Math.Linear(this.body.velocity.x, this.nextVx, 0.15);
        let finalVy = Phaser.Math.Linear(this.body.velocity.y, this.nextVy, 0.15);
        
        // Clamp Speed to prevent slingshotting issues
        const speedSq = finalVx*finalVx + finalVy*finalVy;
        if (speedSq > currentSpeed * currentSpeed) {
            const ratio = currentSpeed / Math.sqrt(speedSq);
            finalVx *= ratio;
            finalVy *= ratio;
        }

        this.setVelocity(finalVx, finalVy);
        this._updateAnimation();
    }
    
    _updateAnimation() {
        if (!this.body) return;
        
        const vx = this.body.velocity.x;
        const vy = this.body.velocity.y;
        
        if (Math.abs(vx) > Math.abs(vy)) {
            this.lastMoveAxis = 'side';
            this.lastFlipX = vx < 0;
            this.play(`${this.animPrefix}_side_walk`, true);
            this.setFlipX(vx < 0);
        } else {
            this.lastMoveAxis = vy >= 0 ? 'down' : 'up';
            this.lastFlipX = false;
            this.setFlipX(false);
            if (vy > 0) {
                this.play(`${this.animPrefix}_down_walk`, true);
            } else if (vy < 0) {
                this.play(`${this.animPrefix}_up_walk`, true);
            }
        }
    }

    getDeathAnimationKey() {
        return null;
    }

    takeDamage(amount, sourceX, sourceY) {
        if (!this.active || this.isDying) return;

        this.hp -= amount;
        this.isHurt = true;
        this.hurtUntil = this.scene.time.now + 180;
        this.setTint(0xff6b6b);

        const dx = this.x - sourceX;
        const dy = this.y - sourceY;
        const length = Math.sqrt((dx * dx) + (dy * dy)) || 1;
        const knockback = 140;

        this.setVelocity((dx / length) * knockback, (dy / length) * knockback);

        this.scene.time.delayedCall(120, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        if (this.hp <= 0) {
            const deathAnimKey = this.getDeathAnimationKey();

            if (!deathAnimKey) {
                // Drop shotgun with chance
                if (Math.random() < 0.3) { // 30% chance to drop shotgun
                    this.scene.events.emit('enemyDeath', this.x, this.y);
                }
                this.destroy();
                return;
            }

            this.isDying = true;
            this.body.enable = false;
            this.setVelocity(0, 0);
            this.clearTint();
            this.play(deathAnimKey);
            this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                if (this.active) {
                    // Drop shotgun with chance
                    if (Math.random() < 0.3) { // 30% chance to drop shotgun
                        this.scene.events.emit('enemyDeath', this.x, this.y);
                    }
                    this.destroy();
                }
            });
        }
    }
}
