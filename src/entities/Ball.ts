import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Paddle } from './Paddle';
import { audioManager } from '../audio/AudioManager';
import { GameScene } from '../scenes/GameScene';

export class Ball extends Phaser.Physics.Matter.Image {
    public isFireball: boolean = false;
    private trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private fireEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private trailScale: number = (GameConfig.BALL_RADIUS * 2) / 32;
    private lastPaddleHitTime: number = 0;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;
    public lastHitBrickId: string | null = null;
    public lastHitTime: number = 0;
    private _radius: number = GameConfig.BALL_RADIUS;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Create with a circular Matter body matching the ball radius
        super(scene.matter.world, x, y, 'ball', undefined, {
            shape: { type: 'circle', radius: 128 }, // 128 = half of 256px texture
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            label: 'ball',
            isSensor: false
        });

        this.sceneRef = scene;
        scene.add.existing(this);

        this.setDisplaySize(GameConfig.BALL_RADIUS * 2, GameConfig.BALL_RADIUS * 2);
        this.setFixedRotation();
        this.setCollisionGroup(-1); // Balls don't collide with each other
        this.setSensor(false);
        this.setStatic(false);

        this.trailEmitter = scene.add.particles(0, 0, 'particle', {
            lifespan: 200,
            scale: {
                onEmit: () => this.trailScale,
                onUpdate: (p: Phaser.GameObjects.Particles.Particle, _key: string, t: number) => this.trailScale * Math.sqrt(1 - t)
            },
            alpha: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            frequency: 10,
            follow: this
        });
        this.trailEmitter.setDepth(this.depth - 1);
        this.trailEmitter.setScale(1);

        this.fireEmitter = scene.add.particles(0, 0, 'particle', {
            lifespan: 400,
            speed: { min: 50, max: 150 },
            scale: { start: 1.2, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: [0xff0000, 0xffaa00, 0xffff00],
            blendMode: 'ADD',
            frequency: 15,
            follow: this,
            emitting: false
        });
        this.fireEmitter.setDepth(this.depth - 1);

        this.setData('state', 'READY');
        this.setIgnoreGravity(true);
        this.setActive(false);
        this.setVisible(false);
        this.setSensor(true); // disabled-sensor trick to keep it in world but not collide
    }

    launch() {
        if (this.getData('state') !== 'READY') return;

        this.setData('state', 'MOVING');
        this.setSensor(false); // enable collision
        this.setActive(true);
        this.setVisible(true);

        const speed = this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED;
        const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-15, 15));

        // Matter uses pixels/second but set via setVelocity which takes pixels/step (60fps base)
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.setVelocity(vx / 60, vy / 60);
    }

    override update() {
        const state = this.getData('state');
        if (state === 'READY') {
            const gameScene = this.scene as GameScene;
            const paddle = gameScene.paddle;
            if (paddle) {
                this.setPosition(paddle.x, paddle.y - paddle.displayHeight / 2 - this.displayHeight / 2);
            }
            this.trailEmitter.stop();
        } else if (state === 'MOVING') {
            this.trailEmitter.start();
            this.updateTrailEffect();
            this.normalizeSpeed();
        }
    }

    private updateTrailEffect() {
        const vx = (this.body as MatterJS.BodyType).velocity.x;
        const vy = (this.body as MatterJS.BodyType).velocity.y;
        const currentSpeed = Math.sqrt(vx * vx + vy * vy) * 60; // Convert from per-step to px/s
        let color = 0x4FC3F7;

        if (this.isFireball) {
            color = 0xffaa00;
        } else {
            const baseSpeed = GameConfig.BALL_BASE_SPEED;
            if (currentSpeed >= baseSpeed * 2.0) {
                color = 0xFF1744;
            } else if (currentSpeed >= baseSpeed * 1.5) {
                color = 0xFF8C00;
            } else if (currentSpeed >= baseSpeed * 1.0) {
                color = 0xFFFFFF;
            }
        }

        this.trailEmitter.setParticleTint(color);
    }

    getVelocityPxPerSec(): { x: number, y: number } {
        const b = this.body as MatterJS.BodyType;
        return { x: b.velocity.x * 60, y: b.velocity.y * 60 };
    }

    setVelocityPxPerSec(vx: number, vy: number) {
        this.setVelocity(vx / 60, vy / 60);
    }

    getSpeedPxPerSec(): number {
        const v = this.getVelocityPxPerSec();
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    setBallRadius(radius: number) {
        this._radius = radius;
        this.setDisplaySize(radius * 2, radius * 2);
        const scaleFactor = radius / 128; // 128 is the texture half-size
        this.setScale(scaleFactor * 2);
        
        // Reset display size override
        this.setDisplaySize(radius * 2, radius * 2);

        // Safely rebuild the Matter body
        this.setCircle(radius, {
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            label: 'ball',
            isSensor: this.isSensor()
        });

        this.setFixedRotation();
        this.setIgnoreGravity(true);

        this.trailScale = (radius * 2) / 32;
    }

    activeFire(active: boolean) {
        this.isFireball = active;
        if (active) {
            this.fireEmitter.start();
        } else {
            this.fireEmitter.stop();
        }
    }

    private normalizeSpeed() {
        const targetSpeed = this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED;
        const MAX_SAFE = GameConfig.BALL_MAX_SAFE_SPEED;
        const clampedTarget = Math.min(targetSpeed, MAX_SAFE);
        if (targetSpeed > MAX_SAFE) this.setData('targetSpeed', MAX_SAFE);

        const currentSpeed = this.getSpeedPxPerSec();

        if (currentSpeed < 100) {
            const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-30, 30));
            this.setVelocityPxPerSec(Math.cos(angle) * clampedTarget, Math.sin(angle) * clampedTarget);
        } else {
            const factor = clampedTarget / currentSpeed;
            const v = this.getVelocityPxPerSec();
            this.setVelocityPxPerSec(v.x * factor, v.y * factor);
        }
    }

    public applyJitter(degrees: number = 1.0) {
        const speed = this.getSpeedPxPerSec();
        if (speed === 0) return;

        const v = this.getVelocityPxPerSec();
        const jitterRad = Phaser.Math.DegToRad(Phaser.Math.FloatBetween(-degrees, degrees));
        const currentAngle = Math.atan2(v.y, v.x);
        const newAngle = currentAngle + jitterRad;

        this.setVelocityPxPerSec(Math.cos(newAngle) * speed, Math.sin(newAngle) * speed);
    }

    onPaddleHit(paddle: Paddle) {
        const v = this.getVelocityPxPerSec();

        // Only handle ball coming down towards paddle
        if (v.y < 0) return;

        const now = this.scene.time.now;
        if (now - this.lastPaddleHitTime < GameConfig.PADDLE_HIT_COOLDOWN) return;
        this.lastPaddleHitTime = now;

        const hitFactor = Phaser.Math.Clamp((this.x - paddle.x) / (paddle.displayWidth / 2), -1, 1);
        const speed = this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED;

        let angle = Phaser.Math.DegToRad(-90 + (hitFactor * 60));
        const angleModifier = Math.atan(0.1 * paddle.velocityX);
        angle += angleModifier;

        let deg = Phaser.Math.RadToDeg(angle);
        deg = Phaser.Math.Clamp(deg, -170, -10);

        const finalAngle = Phaser.Math.DegToRad(deg);
        this.setVelocityPxPerSec(speed * Math.cos(finalAngle), -Math.abs(speed * Math.sin(finalAngle)));
        this.applyJitter(1.0);

        audioManager.play('paddle');
    }

    isSensor(): boolean {
        return (this.body as MatterJS.BodyType).isSensor;
    }

    // Pool methods
    setPoolActive(active: boolean): void {
        this.isPooledActive = active;
        if (!active) {
            this.setData('state', 'READY');
            this.setData('targetSpeed', GameConfig.BALL_BASE_SPEED);
            this.isFireball = false;
            this.lastHitBrickId = null;
            this.lastHitTime = 0;
            this.setTint(0xffffff);
            this.fireEmitter.stop();
            this.trailEmitter.stop();
            this.setSensor(true);
            this.setActive(false);
            this.setVisible(false);
            this.setVelocity(0, 0);
        } else {
            this.setActive(true);
            this.setVisible(true);
        }
    }

    onRelease(): void {
        this.setPosition(0, -100);
        this.setSensor(true);
        this.setActive(false);
        this.setVelocity(0, 0);
    }

    isPoolActive(): boolean {
        return this.isPooledActive;
    }

    override destroy(fromScene?: boolean): void {
        if (!this.sceneRef) return;

        if (this.trailEmitter) {
            this.trailEmitter.destroy();
        }
        if (this.fireEmitter) {
            this.fireEmitter.destroy();
        }
        super.destroy(fromScene);
    }

    getScene(): Phaser.Scene {
        return this.sceneRef;
    }
}
