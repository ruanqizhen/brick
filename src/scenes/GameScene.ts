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
    private activeSpeedMultipliers: number[] = []; // 追踪当前所有激活的速度倍数

    constructor() {
        super('GameScene');
    }

    init(data?: { level?: number }) {
        if (data && typeof data.level === 'number') {
            this.currentLevelIndex = data.level;
        } else {
            this.currentLevelIndex = 0; // 恢复从第一关开始
        }
        this.lives = 3;
    }

    create() {
        // 重置物理环境
        this.physics.world.timeScale = 1.0;
        this.physics.world.isPaused = false;
        (this.physics.world as any).TILE_BIAS = 40; // 优化后的平衡值，兼顾防穿透与视觉精准
        (this.physics.world as any).OVERLAP_BIAS = 4; // 恢复标准重叠容差，修复“虚空反弹”

        this.starfield = new Starfield(this);

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
        this.hud = new HUD(this);
        this.hud.updateLevel(this.currentLevelIndex + 1);
        this.hud.updateLives(this.lives);
        this.particles = new ParticleSystem(this);

        this.bricks = this.physics.add.staticGroup();
        this.loadLevel(this.currentLevelIndex);

        // 使用普通组管理小球，手动控制碰撞
        this.balls = this.add.group({ classType: Ball });
        this.powerUps = this.add.group({ classType: PowerUp });

        this.paddle = new Paddle(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION);

        const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
        const mainBall = new Ball(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 55);
        mainBall.setData('targetSpeed', baseSpeed);
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

        // 增强版发射监听 (点击/触摸)
        this.input.on('pointerdown', () => this.handleBallLaunch());
    }

    update(time: number, delta: number) {
        if (this.starfield) this.starfield.update();
        if (this.paddle) this.paddle.update(time, delta);

        let maxVel = 0;
        this.balls.getChildren().forEach(b => {
            const ball = b as Ball;
            ball.update();
            const body = ball.body as Phaser.Physics.Arcade.Body;
            if (body && body.enable) {
                const vel = body.velocity.length();
                if (vel > maxVel) maxVel = vel;
            }
        });

        // --- HIGH SPEED REDESIGN: DYNAMIC BIAS ---
        // Ensure TILE_BIAS is always larger than the distance traveled in a single physics step.
        // At 120Hz, step is ~8.3ms. 
        const physicsFps = (this.physics.world as any).fps || 120;
        const stepTime = 1 / physicsFps;
        const distancePerStep = maxVel * stepTime;
        // Bias should be at least 40 (standard) or 1.5x the max distance moved per step
        const bias = Math.max(40, distancePerStep * 1.5);
        (this.physics.world as any).TILE_BIAS = bias;
        // Also scale OVERLAP_BIAS to prevent balls skipping narrow overlaps
        (this.physics.world as any).OVERLAP_BIAS = Math.max(4, bias / 10);

        this.powerUps.getChildren().forEach(p => (p as PowerUp).update());
    }

    private handleBrickHit(ball: Ball, brick: Brick) {
        try {
            const isFireball = ball.isFireball;
            const isIndestructible = brick.isIndestructible;

            // 火球碰撞金属砖块产生火珠/火星
            if (ball.isFireball && (brick.texture.key === 'brick_metal' || brick.isIndestructible)) {
                this.particles.spawnSparks(brick.x, brick.y);
            }

            // 反弹逻辑：
            // - 普通球撞击任何砖块都会反弹
            // - 火球撞击金刚砖会反弹
            // - 火球撞击普通砖块不会反弹 (穿透)
            if (!isFireball || isIndestructible) {
                const overlapX = (ball.displayWidth / 2 + brick.displayWidth / 2) - Math.abs(ball.x - brick.x);
                const overlapY = (ball.displayHeight / 2 + brick.displayHeight / 2) - Math.abs(ball.y - brick.y);

                if (overlapX < overlapY) {
                    // 左右侧碰撞：重叠厚度在 X 轴更窄，说明是侧撞
                    // 安全检查：只有当小球正向砖块移动时才反弹（解决在内部振动/卡住问题）
                    if ((ball.x < brick.x && ball.body!.velocity.x > 0) ||
                        (ball.x > brick.x && ball.body!.velocity.x < 0)) {
                        ball.body!.velocity.x *= -1;
                        ball.applyJitter(1.0);
                    }
                    const separation = (ball.x > brick.x) ? overlapX : -overlapX;
                    ball.x += separation;
                } else {
                    // 上下侧碰撞
                    if ((ball.y < brick.y && ball.body!.velocity.y > 0) ||
                        (ball.y > brick.y && ball.body!.velocity.y < 0)) {
                        ball.body!.velocity.y *= -1;
                        ball.applyJitter(1.0);
                    }
                    const separation = (ball.y > brick.y) ? overlapY : -overlapY;
                    ball.y += separation;
                }

                // 更新物理体位置
                if (ball.body) ball.body.updateFromGameObject();
            }

            // 金刚砖逻辑：无论是否火球，撞击到就发出声音
            if (isIndestructible) {
                audioManager.play('indestructible');
                if (isFireball) {
                    brick.destroy();
                    this.hud.updateScore(500);
                    this.particles.spawnBrickParticles(brick.x, brick.y, 0xaaaaaa);
                    ScreenShake.shake(this.cameras.main, 0.008, 150);
                }
                return;
            }

            const color = brick.tintTopLeft;
            const res = brick.hit();

            if (res.points > 0) {
                this.hud.updateScore(res.points);
                audioManager.play(brick.isIndestructible ? 'indestructible' : brick.hp > 1 ? 'hard' : 'normal');

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

    private getBaseSpeedForLevel(levelIndex: number): number {
        const multiplier = 1 + (levelIndex / GameConfig.LEVELS.SPEED_MULTIPLIER_MAX_LEVEL);
        return GameConfig.BALL_BASE_SPEED * multiplier;
    }

    private spawnPowerUp(x: number, y: number) {
        const positives: PowerUpType[] = ['PADDLE_EXPAND', 'FIREBALL', 'MULTI_BALL', 'BALL_ENLARGE', 'SPEED_DOWN', 'EXTRA_LIFE'];
        const negatives: PowerUpType[] = ['PADDLE_SHRINK', 'BALL_SHRINK', 'SPEED_UP'];

        // 计算当前关卡的权重偏移 (0.0 到 1.0)
        // 0关: 正面极高, 负面极低
        // 19关: 正面降低, 负面提升
        const progress = Math.min(this.currentLevelIndex / 19, 1);

        // 权重设计：
        // 初始：Pos=5, Neg=0.5
        // 20关：Pos=1, Neg=4
        const posWeight = Phaser.Math.Linear(5, 1, progress);
        const negWeight = Phaser.Math.Linear(0.5, 4, progress);

        const totalWeight = (positives.length * posWeight) + (negatives.length * negWeight);
        let rand = Math.random() * totalWeight;
        let selectedType: PowerUpType = 'EXTRA_LIFE';

        // 顺序累加概率进行加权选择
        for (const type of positives) {
            if (rand < posWeight) {
                selectedType = type;
                break;
            }
            rand -= posWeight;
        }

        if (selectedType === 'EXTRA_LIFE' && rand > 0) {
            for (const type of negatives) {
                if (rand < negWeight) {
                    selectedType = type;
                    break;
                }
                rand -= negWeight;
            }
        }

        // 额外生命道具：独立判定，极低掉落率 (5%)
        // 只有当已经选中一个道具时才有机会额外出现
        if (selectedType === 'EXTRA_LIFE' && Math.random() < 0.95) {
            selectedType = 'SPEED_UP';
        }

        const pu = new PowerUp(this, x, y, selectedType);
        this.powerUps.add(pu);
    }

    private handlePowerUpPickup(pu: PowerUp) {
        const type = pu.powerUpType;
        pu.destroy();
        audioManager.play('powerup');

        const DURATION = GameConfig.POWERUP_DURATION;

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
                this.updateBallsRadius(1.5);
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
            case 'EXTRA_LIFE':
                this.lives++;
                this.hud.updateLives(this.lives);
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
            const ball = b as Ball;
            ball.activeFire(active);
            ball.setTint(active ? 0xffaa00 : 0xffffff);
        });
    }

    private doubleBalls() {
        const currentBalls = this.balls.getChildren() as Ball[];
        currentBalls.forEach(ball => {
            const newBall = new Ball(this, ball.x, ball.y);
            this.balls.add(newBall);

            newBall.setBallRadius(ball.displayWidth / 2);
            newBall.isFireball = ball.isFireball;
            newBall.setTint(ball.isFireball ? 0xffaa00 : 0xffffff);

            // 继承当前小球的目标速度（已包含所有倍数）
            newBall.setData('targetSpeed', ball.getData('targetSpeed'));

            newBall.launch();
            if (ball.body && newBall.body) {
                const vel = ball.body.velocity;
                newBall.body.velocity.set(vel.x * -1, vel.y);
            }
        });
    }

    private updateBallsRadius(scaleFactor: number) {
        const maxRadius = (DESIGN_WIDTH * GameConfig.POWERUPS.MAX_BALL_DIAMETER_PERCENT) / 2;

        this.balls.getChildren().forEach(b => {
            const ball = b as Ball;
            const currentRadius = ball.displayWidth / 2;
            let newRadius = currentRadius * scaleFactor;

            // Apply limit
            if (newRadius > maxRadius) {
                newRadius = maxRadius;
            }

            ball.setBallRadius(newRadius);
        });
    }

    private updateBallsSpeed(multiplier: number, duration: number) {
        // 记录新倍数
        this.activeSpeedMultipliers.push(multiplier);
        this.applyCurrentSpeedModifiers();

        // 到时后移除并恢复
        this.time.delayedCall(duration, () => {
            const index = this.activeSpeedMultipliers.indexOf(multiplier);
            if (index !== -1) {
                this.activeSpeedMultipliers.splice(index, 1);
                this.applyCurrentSpeedModifiers();
            }
        });
    }

    private applyCurrentSpeedModifiers() {
        // 计算当前总倍数
        const totalMultiplier = this.activeSpeedMultipliers.reduce((acc, m) => acc * m, 1);
        const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
        const targetValue = baseSpeed * totalMultiplier;

        this.balls.getChildren().forEach(b => {
            const ball = b as Ball;
            const currentTarget = ball.getData('targetSpeed') || baseSpeed;

            // 使用 Tween 逐步过渡到新速度，手感更丝滑
            this.tweens.addCounter({
                from: currentTarget,
                to: targetValue,
                duration: 2000,
                onUpdate: (tween) => {
                    ball.setData('targetSpeed', tween.getValue());
                }
            });
        });
    }

    private triggerHitstop(duration: number) {
        this.physics.world.timeScale = 1.5;
        this.time.delayedCall(duration, () => {
            this.physics.world.timeScale = 1.0;
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
                const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
                const totalMultiplier = this.activeSpeedMultipliers.reduce((acc, m) => acc * m, 1);

                const b = new Ball(this, this.paddle.x, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 50);
                // 确保新球也应用当前所有倍数
                b.setData('targetSpeed', baseSpeed * totalMultiplier);
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

        // Spacebar to launch ball
        this.input.keyboard?.on('keydown-SPACE', () => this.handleBallLaunch());

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

    private handleBallLaunch() {
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

    shutdown(): void {
        // Clean up paddle event listeners to prevent memory leaks
        if (this.paddle) {
            this.paddle.cleanupEventListeners();
        }
        // Clean up HUD resize listener
        if (this.hud) {
            this.hud.shutdown();
        }
        // Clean up particle system
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
