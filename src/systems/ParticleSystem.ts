import Phaser from 'phaser';

export class ParticleSystem {
    private scene: Phaser.Scene;
    private emitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // 使用一个通用的白块纹理，后续可以通过 setTint 改变颜色
        this.emitter = this.scene.add.particles(0, 0, 'brick', {
            lifespan: 800,
            speed: { min: 150, max: 300 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 1, end: 0 },
            gravityY: 600,
            blendMode: 'ADD',
            emitting: false
        });
    }

    spawnBrickParticles(x: number, y: number, color: number) {
        // 在 Phaser 3.60+ 中，推荐直接在 setConfig 或使用特定的 tint 属性
        this.emitter.setParticleTint(color);
        this.emitter.explode(Phaser.Math.Between(8, 12), x, y);
    }
}
