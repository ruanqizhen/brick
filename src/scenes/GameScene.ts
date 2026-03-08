import Phaser from 'phaser';
import { DESIGN_WIDTH, DESIGN_HEIGHT, GameConfig } from '../config/GameConfig';
import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/Ball';
import { Brick } from '../entities/Brick';
import { PowerUp, PowerUpType } from '../entities/PowerUp';
import { HUD } from '../ui/HUD';
import { LEVELS } from '../config/LevelData';
import { ParticleSystem } from '../systems/ParticleSystem';
import { ScreenShake } from '../systems/ScreenShake';
import { audioManager } from '../audio/AudioManager';
import { GameOverScene } from './GameOverScene';
import { PauseMenu } from './PauseMenu';
import { saveManager } from '../storage/SaveManager';

import { Starfield } from '../systems/Starfield';

export class GameScene extends Phaser.Scene {
    public paddle!: Paddle;
    private balls!: Phaser.GameObjects.Group;
    private bricks!: Phaser.Physics.Arcade.StaticGroup;
    private powerUps!: Phaser.GameObjects.Group;
    private hud!: HUD;
    private particles!: ParticleSystem;
    private starfield!: Starfield;
    private lives: number = 3;
    private currentLevelIndex: number = 0;

    constructor() {
        super('GameScene');
    }

    init(data?: { level?: number }) {
        if (data && typeof data.level === 'number') {
            this.currentLevelIndex = data.level;
        } else {
            this.currentLevelIndex = 0;
        }

        // Reset lives when starting fresh or specified
        this.lives = 3;
    }

    create() {
        // 重置物理环境
        this.physics.world.timeScale = 1.0;
        this.physics.world.isPaused = false;
        (this.physics.world as any).TILE_BIAS = 32; // 默认值 16，增加以处理高速碰撞
        (this.physics.world as any).OVERLAP_BIAS = 4; // 默认值 4

        this.starfield = new Starfield(this);
        this.hud = new HUD(this);

        // 启用相机辉光 (Phaser 3.60+)
        // 注意：Bloom 可能会影响性能，如果用户设备较弱，后续可改为可选
        try {
            const BloomPipeline = (Phaser.Renderer.WebGL.Pipelines as any).FX?.Bloom;
            if (BloomPipeline) {
                this.cameras.main.setPostPipeline(BloomPipeline, {
                    intensity: 0.3
                });
            }
        } catch (e) {
            console.warn('Bloom not supported:', e);
        }
        this.hud.updateLives(this.lives);
        this.particles = new ParticleSystem(this);

        this.bricks = this.physics.add.staticGroup();
        this.loadLevel(this.currentLevelIndex);

        // 使用普通组管理小球，手动控制碰撞
        this.balls = this.add.group({ classType: Ball });
        this.powerUps = this.add.group({ classType: PowerUp });

        this.paddle = new Paddle(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION);

        const mainBall = new Ball(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 55);
        this.balls.add(mainBall);

        // 碰撞绑定
        this.physics.add.collider(this.balls, this.paddle, (b, p) => (b as Ball).onPaddleHit(p as Paddle));

        // 使用 Overlap 替代 Collider 处理砖块，以便支持“火球穿透”
        this.physics.add.overlap(this.balls, this.bricks, (b, br) => this.handleBrickHit(b as Ball, br as Brick));

        this.physics.add.overlap(this.paddle, this.powerUps, (p, pu) => this.handlePowerUpPickup(pu as PowerUp));

        this.physics.world.setBounds(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        this.physics.world.on('worldbounds', (body: any) => {
            if (body.gameObject instanceof Ball && body.blocked.down) {
                this.handleBallLost(body.gameObject);
            }
        });

        this.showLaunchInstruction();

        // Pause functionality
        this.setupPause();

        // 增强版发射监听
        this.input.on('pointerdown', () => {
            let launched = false;
            this.balls.getChildren().forEach(b => {
                const ball = b as Ball;
                if (ball.getData('state') === 'READY') {
                    ball.launch();
                    audioManager.play('launch');
                    launched = true;
                }
            });
            if (launched) this.clearLaunchInstruction();
        });
    }

    update() {
        if (this.starfield) this.starfield.update();
        if (this.paddle) this.paddle.update();
        this.balls.getChildren().forEach(b => (b as Ball).update());
        this.powerUps.getChildren().forEach(p => (p as PowerUp).update());
    }

    private handleBrickHit(ball: Ball, brick: Brick) {
        try {
            const isFireball = ball.isFireball;
            const isIndestructible = brick.isIndestructible;

            // 1. 处理反弹逻辑 (因为现在使用 Overlap)
            if (!isFireball || isIndestructible) {
                // 如果不是火球，或者撞到了金刚砖，就需要反弹
                // 简单的反弹修正：根据球心与砖块中心的相对位置
                if (Math.abs(ball.y - brick.y) < brick.displayHeight / 2) {
                    ball.body!.velocity.x *= -1;
                } else {
                    ball.body!.velocity.y *= -1;
                }
            }

            // 2. 特殊逻辑：火球可以击碎金刚砖
            if (isFireball && isIndestructible) {
                brick.destroy(); // PRD: 撞金刚砖时金刚砖碎并反弹
                audioManager.play('indestructible');
                this.hud.updateScore(500); // 奖励分
                this.particles.spawnBrickParticles(brick.x, brick.y, 0xaaaaaa);
                ScreenShake.shake(this.cameras.main, 0.008, 150); // 火球撞金刚砖强制震屏
                return;
            }

            const color = brick.tintTopLeft;
            const res = brick.hit();

            if (res.points > 0) {
                this.hud.updateScore(res.points);

                // Play sound based on brick type
                if (brick.isIndestructible) {
                    audioManager.play('indestructible');
                } else if (brick.hp > 1) {
                    audioManager.play('hard');
                } else {
                    audioManager.play('normal');
                }

                if (this.particles) {
                    try {
                        this.particles.spawnBrickParticles(brick.x, brick.y, color);
                    } catch (e) {
                        console.error('Particle error:', e);
                    }
                }

                // 只有大球才产生震屏
                const isLargeBall = ball.displayWidth > GameConfig.BALL_RADIUS * 2.2;
                if (isLargeBall) {
                    ScreenShake.shake(this.cameras.main, res.destroyed ? 0.005 : 0.002, 100);
                }

                this.triggerHitstop(res.destroyed ? 60 : 30);

                if (res.destroyed && Math.random() < GameConfig.POWERUPS.DROP_CHANCE) {
                    this.spawnPowerUp(brick.x, brick.y);
                }
            }

            if (this.checkWin()) {
                this.handleWin();
            }
        } catch (error) {
            console.error('handleBrickHit error:', error);
        }
    }

    private spawnPowerUp(x: number, y: number) {
        const types: PowerUpType[] = [
            'PADDLE_EXPAND', 'PADDLE_SHRINK',
            'FIREBALL', 'MULTI_BALL',
            'BALL_ENLARGE', 'BALL_SHRINK',
            'SPEED_UP', 'SPEED_DOWN'
        ];
        const t = types[Math.floor(Math.random() * types.length)];
        const pu = new PowerUp(this, x, y, t);
        this.powerUps.add(pu);
    }

    private handlePowerUpPickup(pu: PowerUp) {
        const type = pu.powerUpType;
        pu.destroy();
        audioManager.play('powerup');

        const DURATION = 15000; // PRD: 15 seconds

        switch (type) {
            case 'PADDLE_EXPAND':
                this.updatePaddleWidth(1.5);
                break;
            case 'PADDLE_SHRINK':
                this.updatePaddleWidth(0.6);
                break;
            case 'FIREBALL':
                this.setFireball(true);
                this.time.delayedCall(DURATION, () => {
                    this.setFireball(false);
                });
                break;
            case 'MULTI_BALL':
                this.doubleBalls();
                break;
            case 'BALL_ENLARGE':
                this.updateBallsRadius(1.4);
                break;
            case 'BALL_SHRINK':
                this.updateBallsRadius(0.7);
                break;
            case 'SPEED_UP':
                this.updateBallsSpeed(1.3, DURATION);
                break;
            case 'SPEED_DOWN':
                this.updateBallsSpeed(0.7, DURATION);
                break;
        }
    }

    private updatePaddleWidth(scaleFactor: number) {
        const currentScale = this.paddle.scaleX;
        const newScale = currentScale * scaleFactor;
        const maxScale = (DESIGN_WIDTH * GameConfig.POWERUPS.MAX_PADDLE_WIDTH_PERCENT) / GameConfig.PADDLE_WIDTH;

        // Apply limit
        const finalScale = Math.min(newScale, maxScale);

        this.paddle.scaleX = finalScale;
        const body = this.paddle.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(GameConfig.PADDLE_WIDTH * finalScale, GameConfig.PADDLE_HEIGHT);
        body.updateFromGameObject();
    }

    private setFireball(active: boolean) {
        this.balls.getChildren().forEach(b => {
            (b as Ball).isFireball = active;
            (b as Ball).setTint(active ? 0xffaa00 : 0xffffff);
        });
    }

    private doubleBalls() {
        const currentBalls = this.balls.getChildren() as Ball[];
        currentBalls.forEach(ball => {
            const newBall = new Ball(this, ball.x, ball.y);
            this.balls.add(newBall);

            // Inherit attributes from parent
            newBall.setBallRadius(ball.displayWidth / 2);
            newBall.isFireball = ball.isFireball;
            newBall.setTint(ball.isFireball ? 0xffaa00 : 0xffffff);
            newBall.setData('targetSpeed', ball.getData('targetSpeed'));

            // Give it a slightly different velocity to differentiate
            newBall.launch();
            if (ball.body && newBall.body) {
                const vel = ball.body.velocity;
                // Reverse X to create a V-split
                newBall.body.velocity.set(vel.x * -1, vel.y);
            }
        });
    }

    private updateBallsRadius(scale: number) {
        this.balls.getChildren().forEach(b => {
            (b as Ball).setBallRadius(GameConfig.BALL_RADIUS * scale);
        });
    }

    private updateBallsSpeed(multiplier: number, duration: number) {
        this.balls.getChildren().forEach(b => {
            const ball = b as Ball;
            const originalSpeed = ball.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED;
            ball.setData('targetSpeed', originalSpeed * multiplier);

            this.time.delayedCall(duration, () => {
                // 逐步减慢逻辑（PRD: 8秒后逐步恢复）
                this.tweens.addCounter({
                    from: originalSpeed * multiplier,
                    to: originalSpeed,
                    duration: 2000,
                    onUpdate: (tween) => {
                        ball.setData('targetSpeed', tween.getValue());
                    }
                });
            });
        });
    }

    private triggerHitstop(duration: number) {
        this.physics.world.timeScale = 1.5; // 在 Arcade Physics 中，>1 是慢动作
        this.time.delayedCall(duration, () => {
            this.physics.world.timeScale = 1.0;
        });
    }

    private triggerSlowMo() {
        this.tweens.add({
            targets: this.physics.world,
            timeScale: 4.0, // 更慢
            duration: 500,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.1,
            duration: 800,
            ease: 'Cubic.easeOut',
            yoyo: true
        });
    }

    private checkWin() {
        return this.bricks.getChildren().filter(b => !(b as Brick).isIndestructible).length === 0;
    }

    private handleWin() {
        this.physics.pause();
        audioManager.play('win');
        this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, 'CLEAR!', { fontSize: '64px', color: '#00ff00' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            const completedLevel = this.currentLevelIndex + 1;

            // Save level progress
            saveManager.saveLevel(completedLevel);

            if (completedLevel < LEVELS.length) {
                // More levels available - show win overlay
                this.showWinOverlay(completedLevel, this.hud.getScore);
            } else {
                // Completed all levels - show final victory in GameOverScene
                const finalScore = this.hud.getScore;
                this.scene.start('GameOverScene', {
                    score: finalScore,
                    level: completedLevel
                });
            }
        });
    }

    private showWinOverlay(completedLevel: number, score: number) {
        // Pause physics and ball trails
        this.physics.world.isPaused = true;
        this.balls.getChildren().forEach(b => (b as Ball).body!.stop());

        const width = DESIGN_WIDTH;
        const height = DESIGN_HEIGHT;

        // Semi-transparent dimming overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.75)
            .setOrigin(0)
            .setDepth(2000)
            .setInteractive();

        const container = this.add.container(width / 2, height / 2).setDepth(2001);

        // Glassmorphism panel
        const panel = this.add.rectangle(0, 0, 650, 480, 0x1a1a3e, 0.95);
        panel.setStrokeStyle(4, 0x00d4ff, 1);

        const titleText = this.add.text(0, -140, '关卡完成!', {
            fontSize: '84px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffd700',
            fontStyle: 'bold',
            shadow: { blur: 20, color: '#ffd700', fill: true }
        }).setOrigin(0.5);

        const levelText = this.add.text(0, -30, `第 ${completedLevel} 关`, {
            fontSize: '48px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 40, `当前得分: ${score.toLocaleString()}`, {
            fontSize: '42px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#00d4ff'
        }).setOrigin(0.5);

        // Modern Continue Button
        const btnWidth = 320;
        const btnHeight = 84;
        const btn = this.add.container(0, 160);

        const btnBg = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x00cc66);
        btnBg.setStrokeStyle(3, 0xffffff, 0.8);
        btnBg.setOrigin(0.5);

        const btnText = this.add.text(0, 0, '下一关', {
            fontSize: '42px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([btnBg, btnText]);
        btn.setSize(btnWidth, btnHeight);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scale: 1.05, duration: 150 });
            btnBg.setFillStyle(0x00ee77);
        });

        btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scale: 1, duration: 150 });
            btnBg.setFillStyle(0x00cc66);
        });

        btn.on('pointerdown', () => {
            audioManager.play('launch');
            this.currentLevelIndex++;
            this.scene.restart({ level: this.currentLevelIndex });
        });

        container.add([panel, titleText, levelText, scoreText, btn]);

        // Entry Animation
        container.setScale(0.5);
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            duration: 600,
            ease: 'Back.out'
        });
    }

    private handleBallLost(ball: Ball) {
        ball.destroy();
        audioManager.play('ballLost');

        if (this.balls.countActive() === 0) {
            this.lives--;
            this.hud.updateLives(this.lives);

            if (this.lives <= 0) {
                audioManager.play('lose');
                // Save high score and transition to GameOverScene
                const finalScore = this.hud.getScore;
                this.scene.start('GameOverScene', {
                    score: finalScore,
                    level: this.currentLevelIndex + 1
                });
            }
            else {
                const b = new Ball(this, this.paddle.x, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 50);
                this.balls.add(b);
                this.showLaunchInstruction();
            }
        }
    }

    private showLaunchInstruction() {
        this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.5, 'Click to Launch', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setName('instruction');
    }

    private clearLaunchInstruction() {
        const inst = this.children.getByName('instruction');
        if (inst) inst.destroy();
    }

    private setupPause(): void {
        // Keyboard input for pause
        this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard?.on('keydown-P', () => this.togglePause());

        // Listen for resume/restart/menu events from PauseMenu
        this.events.on('resumeGame', () => this.resumeGame());
        this.events.on('restartGame', () => this.restartGame());
        this.events.on('goToMenu', () => this.scene.start('MenuScene'));
    }

    private togglePause(): void {
        if (this.scene.isActive('PauseMenu')) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    private pauseGame(): void {
        // Pause physics
        this.physics.world.isPaused = true;

        // Stop starfield animation
        if (this.starfield) {
            this.starfield.setEnabled(false);
        }

        // Launch pause menu
        this.scene.launch('PauseMenu');
    }

    private resumeGame(): void {
        // Resume physics
        this.physics.world.isPaused = false;

        // Resume starfield animation
        if (this.starfield) {
            this.starfield.setEnabled(true);
        }

        // Stop pause menu
        this.scene.stop('PauseMenu');
    }

    private restartGame(): void {
        this.scene.restart();
    }

    private loadLevel(idx: number) {
        const conf = LEVELS[idx];
        const tW = conf.cols * conf.brickWidth + (conf.cols - 1) * conf.brickPaddingX;
        const sX = (DESIGN_WIDTH - tW) / 2 + conf.brickWidth / 2;
        conf.grid.forEach((row, rI) => {
            row.forEach((type, cI) => {
                if (type === 'EMPTY') return;
                const x = sX + cI * (conf.brickWidth + conf.brickPaddingX);
                const y = conf.offsetTop + rI * (conf.brickHeight + conf.brickPaddingY);
                const brick = new Brick(this, x, y, type);
                brick.setDisplaySize(conf.brickWidth, conf.brickHeight);
                this.bricks.add(brick);
                brick.refreshBody();
            });
        });
    }
}
