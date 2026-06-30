export default class ProgressionManager {
    constructor(scene) {
        this.scene = scene;
        this.timeSurvived = 0;
        this.currentPhase = 1;
        this.currentThreat = 0;
        
        // Phase timings (in seconds)
        this.phaseTimings = {
            1: 0,
            2: 60,
            3: 180
        };
        
        // Threat increases every 30 seconds after Phase 3
        this.threatInterval = 30; 
        this.timeInPhase3 = 0;
    }

    update(delta) {
        const dt = delta / 1000;
        this.timeSurvived += dt;

        // Phase Progression
        if (this.currentPhase === 1 && this.timeSurvived >= this.phaseTimings[2]) {
            this.setPhase(2);
        } else if (this.currentPhase === 2 && this.timeSurvived >= this.phaseTimings[3]) {
            this.setPhase(3);
        }

        // Threat Progression (only in Phase 3)
        if (this.currentPhase === 3) {
            this.timeInPhase3 += dt;
            const expectedThreat = Math.floor(this.timeInPhase3 / this.threatInterval) + 1;
            
            if (expectedThreat > this.currentThreat) {
                this.setThreat(expectedThreat);
            }
        }
    }

    setPhase(phase) {
        if (this.currentPhase === phase) return;
        this.currentPhase = phase;
        
        // Notify the game
        this.scene.events.emit('phaseChanged', this.currentPhase);
        
        if (phase === 3) {
            this.setThreat(1); // Start threat level counting when reaching Phase 3
        }
    }

    setThreat(threat) {
        if (this.currentThreat === threat) return;
        this.currentThreat = threat;
        
        // Notify the game
        this.scene.events.emit('threatChanged', this.currentThreat);
    }
}
