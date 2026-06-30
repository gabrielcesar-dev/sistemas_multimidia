 

export default class HordeAIStrategy {
    constructor(scene) {
        this.scene = scene;
    }

    compute(entity, time, delta, frameCount) {
        if (!entity.player || !entity.player.active) return;
        
        let targetX = entity.player.x;
        let targetY = entity.player.y;

        // Adiciona uma leve variação para evitar que andem exatamente na mesma linha (Stacking perfeito)
        // Isso cria uma "nuvem" de zumbis em vez de uma fila indiana, mantendo o movimento natural.
        if (entity.leader && entity.leader.active) {
            targetX += entity.offsetX || 0;
            targetY += entity.offsetY || 0;
        } else {
            // Se for o líder do seu grupo, ele vai direto
        }

        const angle = Math.atan2(targetY - entity.y, targetX - entity.x);
        
        const currentSpeed = entity.speed * entity.speedMod;
        entity.nextVx = Math.cos(angle) * currentSpeed;
        entity.nextVy = Math.sin(angle) * currentSpeed;
    }
    
    apply(entity) {
        if (!entity.player || !entity.player.active) return;
        if (entity.isHurt) return; // Allow knockback forces to take effect without AI interference

        
        const currentSpeed = entity.speed * entity.speedMod;

        // Apply velocities smoothly using Lerp for natural acceleration
        let finalVx = Phaser.Math.Linear(entity.body.velocity.x, entity.nextVx, 0.1);
        let finalVy = Phaser.Math.Linear(entity.body.velocity.y, entity.nextVy, 0.1);
        
        // Clamp Speed
        const speedSq = finalVx*finalVx + finalVy*finalVy;
        if (speedSq > currentSpeed * currentSpeed) {
            const ratio = currentSpeed / Math.sqrt(speedSq);
            finalVx *= ratio;
            finalVy *= ratio;
        }

        // Obstacle Avoidance (Sliding)
        if (entity.body.blocked.up || entity.body.blocked.down) {
            finalVy = 0;
            // Force horizontal sliding if completely stuck
            if (Math.abs(finalVx) < 10) {
                finalVx = (entity.player.x > entity.x ? 1 : -1) * currentSpeed;
            } else {
                finalVx = Math.sign(finalVx) * currentSpeed;
            }
        } else if (entity.body.blocked.left || entity.body.blocked.right) {
            finalVx = 0;
            // Force vertical sliding if completely stuck
            if (Math.abs(finalVy) < 10) {
                finalVy = (entity.player.y > entity.y ? 1 : -1) * currentSpeed;
            } else {
                finalVy = Math.sign(finalVy) * currentSpeed;
            }
        }

        entity.setVelocity(finalVx, finalVy);
    }
}
