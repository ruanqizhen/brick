import Phaser from 'phaser';

export class ParticleSystem {
    private scene: Phaser.Scene;
    private brickEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private sparkEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    // Throttle state: track particles spawned in the current frame
    private particlesThisFrame = 0;
    private particlesThisFrameTime = 0;

    // Hard caps per frame
    private static readonly MAX_PARTICLES_PER_FRAME = 120;
    // Throttle window (ms) — after exceeding cap, only allow trickle spawns
    private static readonly THROTTLE_WINDOW = 200;
    // Trickle rate during throttle (max particles per call)
    private static readonly TRICKLE_MAX = 8;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Emitter for brick debris particles
        this.brickEmitter = this.scene.add.particles(0, 0, 'brick', {
            lifespan: 800,
            speed: { min: 150, max: 300 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 600,
            blendMode: 'ADD',
            emitting: false,
            maxAliveParticles: 200
        });

        // Separate emitter for spark effects (metal collisions)
        this.sparkEmitter = this.scene.add.particles(0, 0, 'particle', {
            lifespan: 300,
            speed: { min: 400, max: 600 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 1000,
            blendMode: 'ADD',
            tint: 0xffdd00,
            emitting: false,
            maxAliveParticles: 150
        });
    }

    /**
     * Check and enforce per-frame particle budget.
     * Returns the allowed count to spawn (may be 0 if budget exhausted).
     */
    private checkBudget(requested: number): number {
        const now = this.scene.time.now;

        // Reset counter if we're past the throttle window
        if (now - this.particlesThisFrameTime > ParticleSystem.THROTTLE_WINDOW) {
            this.particlesThisFrame = 0;
            this.particlesThisFrameTime = now;
        }

        const remaining = ParticleSystem.MAX_PARTICLES_PER_FRAME - this.particlesThisFrame;
        if (remaining <= 0) {
            // Budget exhausted — allow only a trickle
            return Math.min(requested, ParticleSystem.TRICKLE_MAX);
        }

        return Math.min(requested, remaining);
    }

    private recordSpawn(count: number): void {
        this.particlesThisFrame += count;
    }

    spawnBrickParticles(x: number, y: number, color: number): void {
        const requested = Phaser.Math.Between(8, 12);
        const allowed = this.checkBudget(requested);
        if (allowed <= 0) return;

        this.brickEmitter.setParticleTint(color);
        this.brickEmitter.explode(allowed, x, y);
        this.recordSpawn(allowed);
    }

    spawnSparks(x: number, y: number): void {
        const requested = Phaser.Math.Between(15, 20);
        const allowed = this.checkBudget(requested);
        if (allowed <= 0) return;

        this.sparkEmitter.explode(allowed, x, y);
        this.recordSpawn(allowed);
    }

    spawnExplosion(x: number, y: number): void {
        // Explosion requests a large burst — budget it proportionally
        const brickRequested = 40;
        const sparkRequested = 30;

        const brickAllowed = this.checkBudget(brickRequested);
        if (brickAllowed > 0) {
            this.brickEmitter.setParticleTint(0xff3300);
            this.brickEmitter.explode(brickAllowed, x, y);
            this.recordSpawn(brickAllowed);
        }

        const sparkAllowed = this.checkBudget(sparkRequested);
        if (sparkAllowed > 0) {
            this.sparkEmitter.setParticleTint(0xffffff);
            this.sparkEmitter.explode(sparkAllowed, x, y);
            this.recordSpawn(sparkAllowed);
        }
    }

    /**
     * Clean up emitters to prevent memory leaks
     */
    destroy(): void {
        this.brickEmitter.destroy();
        this.sparkEmitter.destroy();
    }
}
