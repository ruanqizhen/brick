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
import { ObjectPool } from '../utils/ObjectPool';
import { GAME_EVENTS, SCENE_KEYS } from '../config/EventConstants';

// Silence unused import warnings
void GameOverScene;
void PauseMenu;

export class GameScene extends Phaser.Scene {
    public paddle!: Paddle;
    private ballPool!: ObjectPool<Ball>;
    private powerUpPool!: ObjectPool<PowerUp>;
    private brickPool!: ObjectPool<Brick>;
    private balls: Ball[] = [];
    private bricks: Brick[] = [];
    private powerUps: PowerUp[] = [];
    private hud!: HUD;
    private particles!: ParticleSystem;
    private starfield!: Starfield;
    private lives: number = 3;
    private currentLevelIndex: number = 0;
    private activeSpeedMultipliers: number[] = [];

    // Timed powerup trackers
    private fireballTimer: Phaser.Time.TimerEvent | null = null;
    private speedUpTimer: Phaser.Time.TimerEvent | null = null;
    private speedDownTimer: Phaser.Time.TimerEvent | null = null;
    private isFireballActive: boolean = false;

    // Boundary wall labels
    private static readonly WALL_TOP = 'wall_top';
    private static readonly WALL_LEFT = 'wall_left';
    private static readonly WALL_RIGHT = 'wall_right';
    private static readonly WALL_BOTTOM = 'wall_bottom';

    constructor() {
        super(SCENE_KEYS.GAME);
    }

    init(data?: { level?: number, resetLives?: boolean }) {
        if (data && typeof data.level === 'number') {
            this.currentLevelIndex = data.level;
        } else {
            this.currentLevelIndex = 0;
        }

        if (data?.resetLives || this.currentLevelIndex === 0) {
            this.lives = 3;
        }
    }

    create() {
        this.balls = [];
        this.powerUps = [];
        this.bricks = [];
        this.isFireballActive = false;

        this.starfield = new Starfield(this);

        // Bloom post-processing
        try {
            const BloomPipeline = (Phaser.Renderer.WebGL.Pipelines.FX as any)?.Bloom;
            if (BloomPipeline) {
                this.cameras.main.setPostPipeline(BloomPipeline, { intensity: 0.3 });
            }
        } catch (e) {
            console.warn('Bloom not supported:', e);
        }

        this.hud = new HUD(this);
        this.hud.updateLevel(this.currentLevelIndex + 1);
        this.hud.updateLives(this.lives);
        this.particles = new ParticleSystem(this);

        // Initialize object pools
        this.ballPool = new ObjectPool<Ball>(
            () => new Ball(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 55),
            5
        );
        this.powerUpPool = new ObjectPool<PowerUp>(
            () => new PowerUp(this, 0, 0, 'EXTRA_LIFE'),
            3
        );
        this.brickPool = new ObjectPool<Brick>(
            () => new Brick(this, 0, 0, '1'),
            200
        );

        // Create boundary walls as Matter static bodies
        this.createWorldBounds();

        // Load level
        this.loadLevel(this.currentLevelIndex);

        // Create paddle
        this.paddle = new Paddle(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION);

        // Get first ball from pool
        const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
        const mainBall = this.ballPool.get();
        mainBall.setPosition(DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 55);
        mainBall.setData('targetSpeed', baseSpeed);
        this.balls.push(mainBall);

        // Set up Matter collision detection
        this.matter.world.on('collisionstart', this.handleMatterCollision, this);
        this.matter.world.on('collisionactive', this.handleMatterCollisionActive, this);

        this.showLaunchInstruction();
        this.setupPause();
        this.input.on('pointerdown', () => this.handleBallLaunch());
    }

    private createWorldBounds() {
        const thickness = 50;
        const w = DESIGN_WIDTH;
        const h = DESIGN_HEIGHT;

        // Top wall
        const topWall = this.matter.add.rectangle(w / 2, -thickness / 2, w + thickness * 2, thickness, {
            isStatic: true, label: GameScene.WALL_TOP
        });

        // Left wall
        const leftWall = this.matter.add.rectangle(-thickness / 2, h / 2, thickness, h + thickness * 2, {
            isStatic: true, label: GameScene.WALL_LEFT
        });

        // Right wall
        const rightWall = this.matter.add.rectangle(w + thickness / 2, h / 2, thickness, h + thickness * 2, {
            isStatic: true, label: GameScene.WALL_RIGHT
        });

        // Bottom trigger (sensor) – detects ball lost
        const bottomWall = this.matter.add.rectangle(w / 2, h + thickness / 2, w + thickness * 2, thickness, {
            isStatic: true, isSensor: true, label: GameScene.WALL_BOTTOM
        });

        void topWall; void leftWall; void rightWall; void bottomWall;
    }

    private handleMatterCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
        const pairs = event.pairs;
        for (const pair of pairs) {
            const { bodyA, bodyB } = pair;

            // Helper to match labels
            const getLabel = (b: MatterJS.BodyType) => b.label || '';

            const labelA = getLabel(bodyA);
            const labelB = getLabel(bodyB);

            // Ball hit bottom wall → lost
            if ((labelA === 'ball' && labelB === GameScene.WALL_BOTTOM) ||
                (labelB === 'ball' && labelA === GameScene.WALL_BOTTOM)) {
                const ballBody = labelA === 'ball' ? bodyA : bodyB;
                const ball = ballBody.gameObject as Ball;
                if (ball) {
                    this.time.delayedCall(0, () => this.handleBallLost(ball));
                }
            }

            // Ball hit paddle
            if ((labelA === 'ball' && labelB === 'paddle') ||
                (labelB === 'ball' && labelA === 'paddle')) {
                const ballBody = labelA === 'ball' ? bodyA : bodyB;
                const ball = ballBody.gameObject as Ball;
                if (ball) {
                    ball.onPaddleHit(this.paddle);
                }
            }

            // Ball hit brick
            if ((labelA === 'ball' && labelB === 'brick') ||
                (labelB === 'ball' && labelA === 'brick')) {
                const ballBody = labelA === 'ball' ? bodyA : bodyB;
                const brickBody = labelA === 'brick' ? bodyA : bodyB;
                const ball = ballBody.gameObject as Ball;
                const brick = brickBody.gameObject as Brick;
                if (ball && brick && brick.active && brick.visible) {
                    // Turn off physical response for fireballs penetrating destructible bricks
                    if (ball.isFireball && !brick.isIndestructible) {
                        pair.isSensor = true;
                    }
                    this.handleBrickHit(ball, brick);
                }
            }

            // Paddle hit powerup
            if ((labelA === 'paddle' && labelB === 'powerup') ||
                (labelB === 'paddle' && labelA === 'powerup')) {
                const puBody = labelA === 'powerup' ? bodyA : bodyB;
                const pu = puBody.gameObject as PowerUp;
                if (pu && pu.isPoolActive()) {
                    this.time.delayedCall(0, () => this.handlePowerUpPickup(pu));
                }
            }
        }
    }

    private handleMatterCollisionActive(event: Phaser.Physics.Matter.Events.CollisionActiveEvent) {
        const pairs = event.pairs;
        for (const pair of pairs) {
            const labelA = pair.bodyA.label || '';
            const labelB = pair.bodyB.label || '';

            if ((labelA === 'ball' && labelB === 'brick') ||
                (labelB === 'ball' && labelA === 'brick')) {
                const ballBody = labelA === 'ball' ? pair.bodyA : pair.bodyB;
                const brickBody = labelA === 'brick' ? pair.bodyA : pair.bodyB;
                const ball = ballBody.gameObject as Ball;
                const brick = brickBody.gameObject as Brick;

                // Continuously suppress physical bounce for fireballs inside destructible bricks
                if (ball && brick && ball.isFireball && !brick.isIndestructible) {
                    pair.isSensor = true;
                }
            }
        }
    }

    update(time: number, delta: number) {
        if (this.starfield) this.starfield.update();
        if (this.paddle) this.paddle.update(time, delta);

        // Update balls
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            if (ball.active) {
                ball.update();
            }
        }

        // Update powerups (manual fall + off-screen cleanup)
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const pu = this.powerUps[i];
            if (!pu.isPoolActive()) continue;
            pu.update();
            if (pu.y > DESIGN_HEIGHT + 100) {
                this.powerUps.splice(i, 1);
                this.powerUpPool.release(pu);
            }
        }

        // Check world bounds manually for balls (since Matter walls are static)
        for (const ball of this.balls) {
            if (!ball.active || ball.getData('state') !== 'MOVING') continue;
            // Clamp ball to left/right walls (redundant safety)
            const r = ball.displayWidth / 2;
            if (ball.x - r < 0) ball.x = r;
            if (ball.x + r > DESIGN_WIDTH) ball.x = DESIGN_WIDTH - r;
        }
    }

    private handleBrickHit(ball: Ball, brick: Brick) {
        try {
            const isFireball = ball.isFireball;
            const isIndestructible = brick.isIndestructible;

            if (ball.isFireball && isIndestructible) {
                this.particles.spawnSparks(brick.x, brick.y);
            }

            const currentTime = this.time.now;
            if (ball.lastHitBrickId === brick.name && currentTime - ball.lastHitTime < 50) {
                return;
            }
            ball.lastHitBrickId = brick.name;
            ball.lastHitTime = currentTime;

            // Ball bounce logic for non-fireball or indestructible
            if (!isFireball || isIndestructible) {
                // Matter Physics handles the bounce automatically with restitution:1
                // Add jitter to avoid infinite loops
                ball.applyJitter(1.0);
            }

            if (isIndestructible) {
                audioManager.play('indestructible');
                if (isFireball) {
                    const bx = brick.x;
                    const by = brick.y;
                    this.hud.updateScore(500);
                    this.particles.spawnBrickParticles(bx, by, 0xaaaaaa);
                    ScreenShake.shake(this.cameras.main, 0.008, 150);
                    this.bricks.splice(this.bricks.indexOf(brick), 1);
                    this.brickPool.release(brick);
                }
                return;
            }

            const color = brick.tintTopLeft;
            const res = brick.hit(isFireball);

            if (res.points > 0) {
                const brickX = brick.x;
                const brickY = brick.y;

                this.hud.updateScore(res.points);
                const isHardSound = ['2', '3', '5', '8'].includes(brick.brickType);
                const soundType = isHardSound ? 'hard' : 'normal';

                if (res.destroyed) {
                    this.bricks.splice(this.bricks.indexOf(brick), 1);
                    this.brickPool.release(brick);

                    if (brick.brickType === '4') {
                        this.time.delayedCall(10, () => {
                            this.triggerExplosion(brickX, brickY);
                        });
                    }
                }

                audioManager.play(soundType as any);

                if (this.particles) {
                    try {
                        this.particles.spawnBrickParticles(brickX, brickY, color);
                    } catch (e) {
                        console.error('Particle error:', e);
                    }
                }

                const isLargeBall = ball.displayWidth > GameConfig.BALL_RADIUS * 2.2;
                if (isLargeBall) {
                    ScreenShake.shake(this.cameras.main, res.destroyed ? 0.005 : 0.002, 100);
                }

                this.triggerHitstop(res.destroyed ? 60 : 30);

                if (res.destroyed && Math.random() < GameConfig.POWERUPS.DROP_CHANCE) {
                    this.spawnPowerUp(brickX, brickY);
                }
            }

            if (this.checkWin()) {
                this.handleWin();
            }
        } catch (error) {
            console.error('handleBrickHit error:', error);
        }
    }

    private triggerExplosion(cx: number, cy: number) {
        ScreenShake.shake(this.cameras.main, 0.015, 200);
        this.triggerHitstop(60);

        if (this.particles && this.particles.spawnExplosion) {
            this.particles.spawnExplosion(cx, cy);
            audioManager.play('hard');
        }

        const conf = LEVELS[this.currentLevelIndex];
        const stepX = conf.brickWidth + conf.brickPaddingX;
        const stepY = conf.brickHeight + conf.brickPaddingY;
        const maxDx = stepX * 1.5;
        const maxDy = stepY * 1.5;

        const bricksToHit: Brick[] = [];
        for (const b of this.bricks) {
            if (!b.active || !b.visible) continue;
            if (b.x === cx && b.y === cy) continue;
            const dx = Math.abs(b.x - cx);
            const dy = Math.abs(b.y - cy);
            if (dx < maxDx && dy < maxDy) {
                bricksToHit.push(b);
            }
        }

        bricksToHit.sort((a, b) => {
            const da = (a.x - cx) ** 2 + (a.y - cy) ** 2;
            const db = (b.x - cx) ** 2 + (b.y - cy) ** 2;
            return da - db;
        }).forEach((b, index) => {
            this.time.delayedCall(index * 25, () => {
                if (!b.active || !b.visible) return;
                this.handleExplosionHit(b);
            });
        });
    }

    private handleExplosionHit(brick: Brick) {
        if (!brick.active || !brick.visible) return;

        const res = brick.hit(true);
        const brickX = brick.x;
        const brickY = brick.y;
        const color = (brick.tintTopLeft === 0xffffff) ? 0x00d4ff : brick.tintTopLeft;

        this.hud.updateScore(res.points);

        if (res.destroyed) {
            this.bricks.splice(this.bricks.indexOf(brick), 1);
            this.brickPool.release(brick);

            if (brick.brickType === '4') {
                this.time.delayedCall(10, () => {
                    this.triggerExplosion(brickX, brickY);
                });
            }
        }

        if (this.particles) {
            try {
                this.particles.spawnBrickParticles(brickX, brickY, color);
            } catch (e) { }
        }

        if (this.checkWin()) {
            this.handleWin();
        }
    }

    private getBaseSpeedForLevel(levelIndex: number): number {
        const multiplier = 1 + (levelIndex / GameConfig.LEVELS.SPEED_MULTIPLIER_MAX_LEVEL);
        return GameConfig.BALL_BASE_SPEED * multiplier;
    }

    private spawnPowerUp(x: number, y: number) {
        const positives: PowerUpType[] = ['PADDLE_EXPAND', 'FIREBALL', 'MULTI_BALL', 'BALL_ENLARGE', 'SPEED_DOWN', 'EXTRA_LIFE'];
        const negatives: PowerUpType[] = ['PADDLE_SHRINK', 'BALL_SHRINK', 'SPEED_UP'];

        const progress = Math.min(this.currentLevelIndex / 19, 1);
        const posWeight = Phaser.Math.Linear(5, 1, progress);
        const negWeight = Phaser.Math.Linear(0.5, 4, progress);

        const totalWeight = (positives.length * posWeight) + (negatives.length * negWeight);
        let rand = Math.random() * totalWeight;
        let selectedType: PowerUpType = 'EXTRA_LIFE';

        for (const type of positives) {
            if (rand < posWeight) { selectedType = type; break; }
            rand -= posWeight;
        }

        if (selectedType === 'EXTRA_LIFE' && rand > 0) {
            for (const type of negatives) {
                if (rand < negWeight) { selectedType = type; break; }
                rand -= negWeight;
            }
        }

        if (selectedType === 'EXTRA_LIFE' && Math.random() < 0.95) {
            selectedType = 'SPEED_UP';
        }

        const pu = this.powerUpPool.get();
        pu.setPosition(x, y);
        pu.setPowerUpType(selectedType);
        this.powerUps.push(pu);
    }

    private handlePowerUpPickup(pu: PowerUp) {
        const type = pu.powerUpType;
        const idx = this.powerUps.indexOf(pu);
        if (idx > -1) this.powerUps.splice(idx, 1);
        this.powerUpPool.release(pu);

        audioManager.play('powerup');
        const DURATION = GameConfig.POWERUP_DURATION;

        switch (type) {
            case 'PADDLE_EXPAND':  this.updatePaddleWidth(1.5); break;
            case 'PADDLE_SHRINK':  this.updatePaddleWidth(0.6); break;
            case 'FIREBALL':
                if (this.fireballTimer) { this.fireballTimer.remove(); this.fireballTimer = null; }
                this.setFireball(true);
                this.fireballTimer = this.time.delayedCall(DURATION, () => {
                    this.fireballTimer = null; this.setFireball(false);
                });
                break;
            case 'MULTI_BALL': this.doubleBalls(); break;
            case 'BALL_ENLARGE': this.updateBallsRadius(1.5); break;
            case 'BALL_SHRINK':  this.updateBallsRadius(0.7); break;
            case 'SPEED_UP':
                if (this.speedUpTimer) {
                    this.speedUpTimer.remove(); this.speedUpTimer = null;
                    const i = this.activeSpeedMultipliers.indexOf(1.3);
                    if (i !== -1) this.activeSpeedMultipliers.splice(i, 1);
                }
                this.updateBallsSpeed(1.3, DURATION);
                break;
            case 'SPEED_DOWN':
                if (this.speedDownTimer) {
                    this.speedDownTimer.remove(); this.speedDownTimer = null;
                    const i = this.activeSpeedMultipliers.indexOf(0.7);
                    if (i !== -1) this.activeSpeedMultipliers.splice(i, 1);
                }
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
        const finalScale = Math.min(newScale, maxScale);

        this.paddle.scaleX = finalScale;
        this.paddle.updateBodyWidth();
    }

    private setFireball(active: boolean) {
        this.isFireballActive = active;
        for (const ball of this.balls) {
            ball.activeFire(active);
            ball.setTint(active ? 0xffaa00 : 0xffffff);
        }
    }

    private doubleBalls() {
        const currentBalls = [...this.balls];
        for (const ball of currentBalls) {
            const newBall = this.ballPool.get();
            newBall.setPosition(ball.x, ball.y);
            newBall.setBallRadius(ball.displayWidth / 2);
            newBall.isFireball = ball.isFireball;
            if (this.isFireballActive) newBall.activeFire(true);
            newBall.setTint(ball.isFireball ? 0xffaa00 : 0xffffff);
            newBall.setData('targetSpeed', ball.getData('targetSpeed'));
            newBall.launch();
            // Mirror x velocity
            const v = ball.getVelocityPxPerSec();
            newBall.setVelocityPxPerSec(-v.x, v.y);
            this.balls.push(newBall);
        }
    }

    private updateBallsRadius(scaleFactor: number) {
        const maxRadius = (DESIGN_WIDTH * GameConfig.POWERUPS.MAX_BALL_DIAMETER_PERCENT) / 2;
        for (const ball of this.balls) {
            const currentRadius = ball.displayWidth / 2;
            let newRadius = currentRadius * scaleFactor;
            if (newRadius > maxRadius) newRadius = maxRadius;
            ball.setBallRadius(newRadius);
        }
    }

    private updateBallsSpeed(multiplier: number, duration: number) {
        this.activeSpeedMultipliers.push(multiplier);
        this.applyCurrentSpeedModifiers();

        const timer = this.time.delayedCall(duration, () => {
            const index = this.activeSpeedMultipliers.indexOf(multiplier);
            if (index !== -1) {
                this.activeSpeedMultipliers.splice(index, 1);
                this.applyCurrentSpeedModifiers();
            }
            if (multiplier === 1.3) this.speedUpTimer = null;
            else if (multiplier === 0.7) this.speedDownTimer = null;
        });

        if (multiplier === 1.3) this.speedUpTimer = timer;
        else if (multiplier === 0.7) this.speedDownTimer = timer;
    }

    private applyCurrentSpeedModifiers() {
        const totalMultiplier = this.activeSpeedMultipliers.reduce((acc, m) => acc * m, 1);
        const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
        const targetValue = baseSpeed * totalMultiplier;

        for (const ball of this.balls) {
            const currentTarget = ball.getData('targetSpeed') || baseSpeed;
            this.tweens.addCounter({
                from: currentTarget,
                to: targetValue,
                duration: 2000,
                onUpdate: (tween) => {
                    ball.setData('targetSpeed', tween.getValue());
                }
            });
        }
    }

    private triggerHitstop(duration: number) {
        // Matter doesn't have a timeScale for the world easily; we pause/resume the world
        // Simple delay for visual feel
        this.matter.world.enabled = false;
        this.time.delayedCall(duration, () => {
            this.matter.world.enabled = true;
        });
    }

    private checkWin() {
        for (const brick of this.bricks) {
            if (!brick.isIndestructible && brick.visible) {
                return false;
            }
        }
        return true;
    }

    private handleWin() {
        this.matter.world.enabled = false;
        audioManager.play('win');
        this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2, 'CLEAR!', { fontSize: '64px', color: '#00ff00' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => {
            const completedLevel = this.currentLevelIndex + 1;
            saveManager.saveLevel(completedLevel);
            if (completedLevel < LEVELS.length) {
                this.showWinOverlay(completedLevel, this.hud.getScore);
            } else {
                const finalScore = this.hud.getScore;
                this.scene.start(SCENE_KEYS.GAME_OVER, { score: finalScore, level: completedLevel });
            }
        });
    }

    private showWinOverlay(completedLevel: number, score: number) {
        this.matter.world.enabled = false;

        const width = DESIGN_WIDTH;
        const height = DESIGN_HEIGHT;

        const overlay = this.add.rectangle(0, 0, width, height, 0x0a0a12, 0.85)
            .setOrigin(0).setDepth(2000).setInteractive();

        const container = this.add.container(width / 2, height / 2).setDepth(2001);

        const panel = this.add.rectangle(0, 0, 650, 480, 0x1a1a3e, 0.95);
        panel.setStrokeStyle(4, 0x00d4ff, 1);

        const titleText = this.add.text(0, -140, '关卡完成!', {
            fontSize: '64px', fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#ffffff', fontStyle: '900', letterSpacing: 4
        }).setOrigin(0.5);
        titleText.setTint(0xffffff, 0xffffff, 0x00d4ff, 0xffcc00);
        titleText.setShadow(0, 0, 'rgba(0, 212, 255, 0.4)', 30, true, true);

        const levelText = this.add.text(0, -30, `第 ${completedLevel} 关`, {
            fontSize: '42px', fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif", color: '#ffffff'
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 40, `当前得分: ${score.toLocaleString()}`, {
            fontSize: '36px', fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif", color: '#00d4ff'
        }).setOrigin(0.5);

        const btnWidth = 280;
        const btnHeight = 64;
        const radius = btnHeight / 2;
        const btn = this.add.container(0, 160);

        const graphics = this.add.graphics();
        graphics.fillStyle(0x00d4ff, 0.15);
        graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
        graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
        graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);
        graphics.lineStyle(2, 0x00d4ff, 0.6);
        graphics.beginPath();
        graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
        graphics.lineTo(btnWidth / 2 - radius, -radius);
        graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
        graphics.closePath();
        graphics.strokePath();

        const btnText = this.add.text(0, 0, '下一关', {
            fontSize: '24px', fontFamily: "'Noto Sans SC', sans-serif",
            color: '#ffffff', fontStyle: 'bold', letterSpacing: 3
        }).setOrigin(0.5);

        const hitZone = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
        hitZone.setInteractive({ useHandCursor: true });
        btn.add([graphics, btnText, hitZone]);

        hitZone.on('pointerdown', () => {
            audioManager.play('launch');
            this.currentLevelIndex++;
            this.scene.restart({ level: this.currentLevelIndex });
        });

        void overlay;
        container.add([panel, titleText, levelText, scoreText, btn]);
        container.setScale(0.5).setAlpha(0);
        this.tweens.add({ targets: container, scale: 1, alpha: 1, duration: 600, ease: 'Back.out' });
    }

    private handleBallLost(ball: Ball) {
        const idx = this.balls.indexOf(ball);
        if (idx > -1) this.balls.splice(idx, 1);
        this.ballPool.release(ball);
        audioManager.play('ballLost');

        const activeBalls = this.balls.filter(b => b.active && b.getData('state') === 'MOVING');
        if (activeBalls.length === 0) {
            this.lives--;
            this.hud.updateLives(this.lives);

            if (this.lives <= 0) {
                audioManager.play('lose');
                const finalScore = this.hud.getScore;
                this.scene.start(SCENE_KEYS.GAME_OVER, { score: finalScore, level: this.currentLevelIndex + 1 });
            } else {
                const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
                const totalMultiplier = this.activeSpeedMultipliers.reduce((acc, m) => acc * m, 1);

                const b = this.ballPool.get();
                b.setPosition(this.paddle.x, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 50);
                b.setData('targetSpeed', baseSpeed * totalMultiplier);
                if (this.isFireballActive) b.activeFire(true);
                this.balls.push(b);
                this.showLaunchInstruction();
            }
        }
    }

    private showLaunchInstruction() {
        this.clearLaunchInstruction();
        this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.5, 'Click to Launch', { fontSize: '32px', color: '#ffffff' })
            .setOrigin(0.5).setName('instruction');
    }

    private clearLaunchInstruction() {
        const inst = this.children.getByName('instruction');
        if (inst) inst.destroy();
    }

    private setupPause(): void {
        this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
        this.input.keyboard?.on('keydown-P', () => this.togglePause());
        this.input.keyboard?.on('keydown-SPACE', () => this.handleBallLaunch());
        this.events.on(GAME_EVENTS.RESUME, () => this.resumeGame());
        this.events.on(GAME_EVENTS.RESTART, () => this.restartGame());
        this.events.on(GAME_EVENTS.GO_TO_MENU, () => this.scene.start(SCENE_KEYS.MENU));
    }

    private togglePause(): void {
        if (this.scene.isActive('PauseMenu')) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    private pauseGame(): void {
        this.matter.world.enabled = false;
        if (this.starfield) this.starfield.setEnabled(false);
        this.scene.launch('PauseMenu');
    }

    private resumeGame(): void {
        this.matter.world.enabled = true;
        if (this.starfield) this.starfield.setEnabled(true);
        this.scene.stop('PauseMenu');
    }

    private restartGame(): void {
        this.scene.restart();
    }

    private handleBallLaunch() {
        let launched = false;
        for (const ball of this.balls) {
            if (ball.getData('state') === 'READY') {
                ball.launch();
                audioManager.play('launch');
                launched = true;
            }
        }
        if (launched) this.clearLaunchInstruction();
    }

    private loadLevel(idx: number) {
        const conf = LEVELS[idx];
        const tW = conf.cols * conf.brickWidth + (conf.cols - 1) * conf.brickPaddingX;
        const sX = (DESIGN_WIDTH - tW) / 2 + conf.brickWidth / 2;

        // Release all existing bricks
        for (const brick of this.bricks) {
            this.brickPool.release(brick);
        }
        this.bricks = [];

        const gridCopied = conf.grid.map(row => [...row]);

        let normalBrickCount = 0;
        gridCopied.forEach(row => {
            row.forEach(cell => {
                if (cell === '1' || cell === '2' || cell === '3') normalBrickCount++;
            });
        });

        if (idx >= 2) {
            let numSpecial = Math.floor(normalBrickCount / 20);
            if (Math.random() < (normalBrickCount % 20) / 20) numSpecial++;
            numSpecial = Math.max(1, numSpecial);

            for (let i = 0; i < numSpecial; i++) {
                const specialTypes: import('../config/LevelData').BrickType[] = ['4', '5', '6'];
                const st = Phaser.Math.RND.pick(specialTypes);

                let possibleCoords: { r: number, c: number }[] = [];
                const maxRows = st === '5' ? conf.rows + 3 : conf.rows;

                for (let r = 0; r < maxRows; r++) {
                    for (let c = 0; c < conf.cols; c++) {
                        const cell = r < gridCopied.length ? gridCopied[r][c] : '0';
                        if (st === '5') {
                            if (cell === '0') possibleCoords.push({ r, c });
                        } else {
                            if (cell === '1' || cell === '2' || cell === '3') possibleCoords.push({ r, c });
                        }
                    }
                }

                if (possibleCoords.length > 0) {
                    const rCoord = Phaser.Math.RND.pick(possibleCoords);
                    while (gridCopied.length <= rCoord.r) {
                        gridCopied.push(new Array(conf.cols).fill('0'));
                    }
                    gridCopied[rCoord.r][rCoord.c] = st;
                }
            }
        }

        gridCopied.forEach((row, rI) => {
            row.forEach((type, cI) => {
                if (type === '0') return;
                const x = sX + cI * (conf.brickWidth + conf.brickPaddingX);
                const y = conf.offsetTop + rI * (conf.brickHeight + conf.brickPaddingY);
                const brick = this.brickPool.get();
                brick.reset(x, y, type);
                brick.setDisplaySize(conf.brickWidth, conf.brickHeight);
                this.bricks.push(brick);
            });
        });
    }

    shutdown(): void {
        if (this.fireballTimer) { this.fireballTimer.remove(); this.fireballTimer = null; }
        if (this.speedUpTimer) { this.speedUpTimer.remove(); this.speedUpTimer = null; }
        if (this.speedDownTimer) { this.speedDownTimer.remove(); this.speedDownTimer = null; }

        if (this.paddle) this.paddle.cleanupEventListeners();
        if (this.hud) this.hud.shutdown();
        if (this.particles) this.particles.destroy();

        if (this.matter && this.matter.world) {
            this.matter.world.off('collisionstart', this.handleMatterCollision, this);
        }

        if (this.ballPool) { this.ballPool.releaseAll(); this.ballPool.destroy(); }
        if (this.powerUpPool) { this.powerUpPool.releaseAll(); this.powerUpPool.destroy(); }
        if (this.brickPool) { this.brickPool.releaseAll(); this.brickPool.destroy(); }

        this.balls = [];
        this.powerUps = [];
        this.bricks = [];
    }
}
