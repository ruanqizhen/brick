import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Paddle } from './Paddle';
import { audioManager } from '../audio/AudioManager';
import { GameScene } from '../scenes/GameScene';

export class Ball extends Phaser.Physics.Arcade.Sprite {
    public isFireball: boolean = false;
    private trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private fireEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private trailScale: number = (GameConfig.BALL_RADIUS * 2) / 16; // Particle is 16x16
    private lastPaddleHitTime: number = 0;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'ball');

        this.sceneRef = scene;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
        this.setBounce(1, 1);

        this.setCircle(128);
        this.setDisplaySize(GameConfig.BALL_RADIUS * 2, GameConfig.BALL_RADIUS * 2);

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
        if (this.body) {
            this.body.enable = false;
        }

        this.setPoolActive(false);
    }

    launch() {
        if (this.getData('state') !== 'READY') return;

        this.setData('state', 'MOVING');
        if (this.body) {
            this.body.enable = true; // 发射时激活物理，在此之前它是禁用的
        }
        const speed = (this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED) * 60;

        const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-15, 15));
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    override update() {
        const state = this.getData('state');
        if (state === 'READY') {
            const gameScene = this.scene as GameScene;
            const paddle = gameScene.paddle;
            if (paddle) {
                this.setPosition(paddle.x, paddle.y - paddle.displayHeight / 2 - this.displayHeight / 2);
                if (this.body) this.body.updateFromGameObject();
            }
            this.trailEmitter.stop();
        } else if (state === 'MOVING') {
            this.trailEmitter.start();
            this.updateTrailEffect();
            this.normalizeSpeed();
        }
    }

    private updateTrailEffect() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        let color = 0x4FC3F7; // 默认冷蓝色

        if (this.isFireball) {
            color = 0xffaa00; // 火球橙黄金色
        } else {
            const currentSpeed = body.velocity.length() / 60;
            const baseSpeed = GameConfig.BALL_BASE_SPEED;

            if (currentSpeed >= baseSpeed * 2.0) {
                color = 0xFF1744; // 赤红色
            } else if (currentSpeed >= baseSpeed * 1.5) {
                color = 0xFF8C00; // 橙色
            } else if (currentSpeed >= baseSpeed * 1.0) {
                color = 0xFFFFFF; // 白色
            }
        }

        this.trailEmitter.setParticleTint(color);
    }

    setBallRadius(radius: number) {
        this.setDisplaySize(radius * 2, radius * 2);

        // 修复：始终基于高分辨率纹理半径 (128) 设置圆周，由 Sprite 的 Scale 机制处理最终碰撞尺寸。
        // 不传递偏移量，允许 Phaser 自动居中。
        if (this.body) {
            this.setCircle(128);
        }

        // 动态调整粒子缩放系数以完全包裹小球宽幅 (particle=16)
        this.trailScale = (radius * 2) / 16;
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
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        const currentSpeed = body.velocity.length();
        const baseSpeed = this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED;
        let targetSpeed = baseSpeed * 60;

        const MAX_SAFE_SPEED = GameConfig.BALL_MAX_SAFE_SPEED;
        if (targetSpeed > MAX_SAFE_SPEED) {
            targetSpeed = MAX_SAFE_SPEED;
            this.setData('targetSpeed', MAX_SAFE_SPEED / 60);
        }

        if (currentSpeed < 100) {
            const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-30, 30));
            this.setVelocity(Math.cos(angle) * targetSpeed, Math.sin(angle) * targetSpeed);
        } else {
            const factor = targetSpeed / currentSpeed;
            body.velocity.x *= factor;
            body.velocity.y *= factor;
        }
    }

    /**
     * 为小球当前速度注入一个细微的随机角度偏差（默认 ±0.5度）
     * 用于防止进入物理死循环，并增加真实感
     */
    public applyJitter(degrees: number = 1.0) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        const currentSpeed = body.velocity.length();
        if (currentSpeed === 0) return;

        const jitterRad = Phaser.Math.DegToRad(Phaser.Math.FloatBetween(-degrees, degrees));
        const currentAngle = Math.atan2(body.velocity.y, body.velocity.x);
        const newAngle = currentAngle + jitterRad;

        body.velocity.x = Math.cos(newAngle) * currentSpeed;
        body.velocity.y = Math.sin(newAngle) * currentSpeed;
    }

    onPaddleHit(paddle: Paddle) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        if (body.velocity.y > 0) return;

        const now = this.scene.time.now;
        if (now - this.lastPaddleHitTime < GameConfig.PADDLE_HIT_COOLDOWN) return;
        this.lastPaddleHitTime = now;

        const hitFactor = Phaser.Math.Clamp((this.x - paddle.x) / (paddle.displayWidth / 2), -1, 1);
        const speed = (this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED) * 60;

        let angle = Phaser.Math.DegToRad(-90 + (hitFactor * 60));
        const angleModifier = Math.atan(0.1 * paddle.velocityX);
        angle += angleModifier;

        let deg = Phaser.Math.RadToDeg(angle);
        deg = Phaser.Math.Clamp(deg, -170, -10);

        const finalAngle = Phaser.Math.DegToRad(deg);
        this.setVelocity(speed * Math.cos(finalAngle), -Math.abs(speed * Math.sin(finalAngle)));

        this.applyJitter(1.0);

        const visualRadius = this.displayWidth / 2;
        const paddleTop = paddle.y - paddle.displayHeight / 2;

        if (this.y + visualRadius > paddleTop && this.y < paddle.y) {
            this.y = paddleTop - visualRadius;
        }

        if (this.body) {
            this.body.updateFromGameObject();
        }

        audioManager.play('paddle');
    }

    // Pool methods
    setPoolActive(active: boolean): void {
        this.isPooledActive = active;
        if (!active) {
            this.setData('state', 'READY');
            this.setData('targetSpeed', GameConfig.BALL_BASE_SPEED);
            this.isFireball = false;
            this.setTint(0xffffff);
            this.fireEmitter.stop();
            this.trailEmitter.stop();
            if (this.body) {
                this.body.enable = false;
                this.body.velocity.set(0, 0);
            }
            this.setVisible(false);
        } else {
            this.setVisible(true);
        }
    }

    onRelease(): void {
        this.setPosition(0, -100);
        if (this.body) {
            this.body.enable = false;
        }
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
