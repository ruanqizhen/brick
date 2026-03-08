import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Paddle } from './Paddle';
import { audioManager } from '../audio/AudioManager';

export class Ball extends Phaser.Physics.Arcade.Sprite {
    public isFireball: boolean = false;
    private trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'ball');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
        this.setBounce(1, 1);
        this.setCircle(GameConfig.BALL_RADIUS);

        // 创建拖尾粒子发射器
        this.trailEmitter = scene.add.particles(0, 0, 'particle', {
            lifespan: 300,
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            frequency: 16,
            follow: this
        });

        this.setData('state', 'READY');
        if (this.body) {
            this.body.enable = false; // 初始状态禁用物理，防止抖动
        }
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
            const paddle = (this.scene as any).paddle;
            if (paddle) {
                this.setPosition(paddle.x, paddle.y - paddle.displayHeight / 2 - this.displayHeight / 2);
                if (this.body) this.body.updateFromGameObject();
            }
            this.trailEmitter.stop(); // 准备状态不显示拖尾
        } else if (state === 'MOVING') {
            this.trailEmitter.start(); // 移动状态开启拖尾
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

        (this.trailEmitter as any).setConfig({
            tint: color
        });
    }

    setBallRadius(radius: number) {
        this.setDisplaySize(radius * 2, radius * 2);
        this.setCircle(radius);
        if (this.body) this.body.updateFromGameObject();
    }

    private normalizeSpeed() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        const currentSpeed = body.velocity.length();
        const targetSpeed = (this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED) * 60;

        if (currentSpeed < 100) {
            // 紧急补救：如果速度消失，强制向上发射
            const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-30, 30));
            this.setVelocity(Math.cos(angle) * targetSpeed, Math.sin(angle) * targetSpeed);
        } else {
            const factor = targetSpeed / currentSpeed;
            body.velocity.x *= factor;
            body.velocity.y *= factor;
        }
    }

    onPaddleHit(paddle: Paddle) {
        const hitFactor = (this.x - paddle.x) / (paddle.displayWidth / 2);
        const speed = (this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED) * 60;

        let angle = Phaser.Math.DegToRad(-90 + (hitFactor * 60));

        // 加入挡板移动速度影响
        const angleModifier = Math.atan(0.005 * paddle.velocityX);
        angle += angleModifier;

        let deg = Phaser.Math.RadToDeg(angle);
        deg = Phaser.Math.Clamp(deg, -160, -20);

        const finalAngle = Phaser.Math.DegToRad(deg);
        this.setVelocity(speed * Math.cos(finalAngle), -Math.abs(speed * Math.sin(finalAngle)));

        // 修正位置
        this.y = paddle.y - paddle.displayHeight / 2 - this.displayHeight / 2;
        if (this.body) this.body.updateFromGameObject();
        
        // Play paddle hit sound
        audioManager.play('paddle');
    }

    override destroy(fromScene?: boolean) {
        if (this.trailEmitter) {
            this.trailEmitter.destroy();
        }
        super.destroy(fromScene);
    }
}
