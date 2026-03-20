import Phaser from 'phaser';

export class ParticleSystem {
    private scene: Phaser.Scene;
    private brickEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private sparkEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

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
            emitting: false
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
            emitting: false
        });
    }

    spawnBrickParticles(x: number, y: number, color: number): void {
        this.brickEmitter.setParticleTint(color);
        this.brickEmitter.explode(Phaser.Math.Between(8, 12), x, y);
    }

    spawnSparks(x: number, y: number): void {
        this.sparkEmitter.explode(Phaser.Math.Between(15, 20), x, y);
    }

    spawnExplosion(x: number, y: number): void {
        this.brickEmitter.setParticleTint(0xff3300, 0xffaa00, 0xff0000);
        this.brickEmitter.explode(40, x, y); // Large burst
        this.sparkEmitter.setParticleTint(0xffffff, 0xffff00);
        this.sparkEmitter.explode(30, x, y); // Extra sparks
    }

    /**
     * Clean up emitters to prevent memory leaks
     */
    destroy(): void {
        this.brickEmitter.destroy();
        this.sparkEmitter.destroy();
    }
}
