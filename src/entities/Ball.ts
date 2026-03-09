import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Paddle } from './Paddle';
import { audioManager } from '../audio/AudioManager';

export class Ball extends Phaser.Physics.Arcade.Sprite {
    public isFireball: boolean = false;
    private trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private trailScale: number = 1.0;
    private lastPaddleHitTime: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'ball');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
        this.setBounce(1, 1);

        // 初始化尺寸
        this.setCircle(GameConfig.BALL_RADIUS);

        // 创建拖尾粒子发射器
        this.trailEmitter = scene.add.particles(0, 0, 'particle', {
            lifespan: 200,
            // 使用回调函数确保粒子在发射瞬间获取最新的缩放值
            scale: {
                onEmit: () => this.trailScale,
                // 使用平方根衰减，让颗粒在生命周期的大部分时间内保持较大的尺寸
                onUpdate: (p: any, k: string, t: number) => this.trailScale * Math.sqrt(1 - t)
            } as any,
            alpha: { start: 0.6, end: 0 }, // 满透明度开始，让拖尾更凝实
            blendMode: 'ADD',
            frequency: 10,
            follow: this
        });
        // 确保发射器本身不缩放，这样 follow 逻辑就不会产生坐标偏移
        this.trailEmitter.setDepth(this.depth - 1);
        this.trailEmitter.setScale(1);

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

        this.trailEmitter.setParticleTint(color);
    }

    setBallRadius(radius: number) {
        this.setDisplaySize(radius * 2, radius * 2);

        // 修复：始终基于基准半径设置圆周，由 Sprite 的 Scale 机制处理最终碰撞尺寸。
        // 不传递偏移量，允许 Phaser 自动居中。
        if (this.body) {
            this.setCircle(GameConfig.BALL_RADIUS);
        }

        // 动态调整粒子缩放系数
        this.trailScale = radius / GameConfig.BALL_RADIUS;
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

        // // 1. 安全检查：只有当球正在向下运动（即将撞向挡板）时才处理反弹
        // // 解决“在撞击物表面振动/卡住”的问题
        if (body.velocity.y > 0) return;

        // 碰撞 CD
        const now = this.scene.time.now;
        if (now - this.lastPaddleHitTime < 150) return;
        this.lastPaddleHitTime = now;

        const hitFactor = Phaser.Math.Clamp((this.x - paddle.x) / (paddle.displayWidth / 2), -1, 1);
        const speed = (this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED) * 60;

        // 设置击中位置的基本偏移（用户偏好的 10 度）
        let angle = Phaser.Math.DegToRad(-90 + (hitFactor * 60));

        // 2. 极大增强挡板移动速度的影响 (使用 0.1 系数代替之前的 0.003)
        // atan(0.1 * velocityX) 在速度为 10px/frame 时约提供 45 度的偏移，力度极大
        const angleModifier = Math.atan(0.1 * paddle.velocityX);
        angle += angleModifier;

        let deg = Phaser.Math.RadToDeg(angle);
        // 限制角度，防止反弹得太水平导致球飞不起来
        deg = Phaser.Math.Clamp(deg, -170, -10);

        const finalAngle = Phaser.Math.DegToRad(deg);
        this.setVelocity(speed * Math.cos(finalAngle), -Math.abs(speed * Math.sin(finalAngle)));

        // 2. 注入 1 度以内的随机偏差，防止死循环
        this.applyJitter(1.0);

        // 3. 修正位置：确保球体底部刚好接触挡板上平面，不留视觉间隙
        const visualRadius = this.displayWidth / 2;
        const paddleTop = paddle.y - paddle.displayHeight / 2;

        if (this.y + visualRadius > paddleTop && this.y < paddle.y) {
            this.y = paddleTop - visualRadius; // 移除 -1 偏移，实现贴合撞击
        }

        if (this.body) {
            this.body.updateFromGameObject();
        }

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
