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

export class GameScene extends Phaser.Scene {
    public paddle!: Paddle;
    private ballPool!: ObjectPool<Ball>;
    private powerUpPool!: ObjectPool<PowerUp>;
    private brickPool!: ObjectPool<Brick>;
    private balls!: Phaser.GameObjects.Group;
    private bricks!: Phaser.Physics.Arcade.StaticGroup;
    private powerUps!: Phaser.GameObjects.Group;
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

    constructor() {
        super(SCENE_KEYS.GAME);
    }

    init(data?: { level?: number, resetLives?: boolean }) {
        if (data && typeof data.level === 'number') {
            this.currentLevelIndex = data.level;
        } else {
            this.currentLevelIndex = 0; // 恢复从第一关开始
        }

        if (data?.resetLives || this.currentLevelIndex === 0) {
            this.lives = 3;
        }
    }

    create() {
        // 重置物理环境
        this.physics.world.timeScale = 1.0;
        this.physics.world.isPaused = false;
        const world = this.physics.world as Phaser.Physics.Arcade.World;
        world.TILE_BIAS = 40;
        world.OVERLAP_BIAS = 4;
        this.isFireballActive = false;

        this.starfield = new Starfield(this);

        // 启用相机辉光 (Phaser 3.60+)
        try {
            const BloomPipeline = (Phaser.Renderer.WebGL.Pipelines.FX as any)?.Bloom;
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

        // Initialize object pools BEFORE loading level
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

        this.bricks = this.physics.add.staticGroup();
        this.loadLevel(this.currentLevelIndex);

        // Use groups for collision management
        this.balls = this.add.group({ classType: Ball, runChildUpdate: false });
        this.powerUps = this.add.group({ classType: PowerUp, runChildUpdate: false });

        this.paddle = new Paddle(this, DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION);

        // Get first ball from pool
        const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
        const mainBall = this.ballPool.get();
        mainBall.setPosition(DESIGN_WIDTH / 2, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 55);
        mainBall.setData('targetSpeed', baseSpeed);
        this.balls.add(mainBall);

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

        // Optimized: Cache children array and use for loop
        const balls = this.balls.getChildren();
        const ballCount = balls.length;
        let maxVel = 0;

        // Custom CCD (Continuous Collision Detection) Pass
        // Perform raycasting to prevent tunneling through bricks at high speeds
        const bricks = this.bricks.getChildren();

        for (let i = 0; i < ballCount; i++) {
            const ball = balls[i] as Ball;
            const body = ball.body as Phaser.Physics.Arcade.Body;

            if (body?.enable && ball.active) {
                const velLen = body.velocity.length();
                if (velLen > maxVel) maxVel = velLen;

                // CCD Logic: Check if distance to be traveled this frame is greater than radius
                const stepDistance = velLen * delta / 1000;
                const radius = ball.displayWidth / 2;

                // Create a movement line from current center to next frame center
                const line = new Phaser.Geom.Line(
                    ball.x, ball.y,
                    ball.x + body.velocity.x * delta / 1000,
                    ball.y + body.velocity.y * delta / 1000
                );

                let closestIntersection: Phaser.Geom.Point | null = null;
                let closestBrick: Brick | null = null;
                let hitPaddle: boolean = false;
                let closestDistSq = Infinity;

                // 1. Check Paddle (Only if ball is moving DOWN towards it)
                if (this.paddle && body.velocity.y > 0) {
                    const pRect = new Phaser.Geom.Rectangle(
                        this.paddle.x - this.paddle.displayWidth / 2 - radius,
                        this.paddle.y - this.paddle.displayHeight / 2 - radius,
                        this.paddle.displayWidth + radius * 2,
                        this.paddle.displayHeight + radius * 2
                    );

                    const pPoints = [
                        this.getLineIntersection(line, new Phaser.Geom.Line(pRect.left, pRect.top, pRect.right, pRect.top)),
                        this.getLineIntersection(line, new Phaser.Geom.Line(pRect.right, pRect.top, pRect.right, pRect.bottom)),
                        this.getLineIntersection(line, new Phaser.Geom.Line(pRect.right, pRect.bottom, pRect.left, pRect.bottom)),
                        this.getLineIntersection(line, new Phaser.Geom.Line(pRect.left, pRect.bottom, pRect.left, pRect.top))
                    ].filter(p => p !== null) as Phaser.Geom.Point[];

                    for (const p of pPoints) {
                        const distSq = Phaser.Math.Distance.Squared(ball.x, ball.y, p.x, p.y);
                        if (distSq < closestDistSq) {
                            closestDistSq = distSq;
                            closestIntersection = p;
                            hitPaddle = true;
                            closestBrick = null;
                        }
                    }
                }

                // 2. Check Bricks (Only if distance to be traveled this frame is high/tunneling risk)
                if (stepDistance > radius * 0.8) {
                    for (let j = 0; j < bricks.length; j++) {
                        const brick = bricks[j] as Brick;
                        if (!brick.active) continue;

                        // Inflate brick bounds by ball radius for swept-sphere collision
                        const rect = new Phaser.Geom.Rectangle(
                            brick.x - brick.displayWidth / 2 - radius,
                            brick.y - brick.displayHeight / 2 - radius,
                            brick.displayWidth + radius * 2,
                            brick.displayHeight + radius * 2
                        );

                        const points = [
                            this.getLineIntersection(line, new Phaser.Geom.Line(rect.left, rect.top, rect.right, rect.top)),
                            this.getLineIntersection(line, new Phaser.Geom.Line(rect.right, rect.top, rect.right, rect.bottom)),
                            this.getLineIntersection(line, new Phaser.Geom.Line(rect.right, rect.bottom, rect.left, rect.bottom)),
                            this.getLineIntersection(line, new Phaser.Geom.Line(rect.left, rect.bottom, rect.left, rect.top))
                        ].filter(p => p !== null) as Phaser.Geom.Point[];

                        for (const p of points) {
                            const distSq = Phaser.Math.Distance.Squared(ball.x, ball.y, p.x, p.y);
                            if (distSq < closestDistSq) {
                                closestDistSq = distSq;
                                closestIntersection = p;
                                closestBrick = brick;
                                hitPaddle = false; // Override paddle if brick is closer
                            }
                        }
                    }

                    // Preemptively handle the collision
                    if (closestIntersection) {
                        // Move ball to point of impact (pull back slightly to avoid getting stuck)
                        const angle = Phaser.Math.Angle.Between(closestIntersection.x, closestIntersection.y, ball.x, ball.y);
                        ball.x = closestIntersection.x + Math.cos(angle) * 2;
                        ball.y = closestIntersection.y + Math.sin(angle) * 2;
                        body.updateFromGameObject();

                        if (hitPaddle) {
                            ball.onPaddleHit(this.paddle);
                        } else if (closestBrick) {
                            this.handleBrickHit(ball, closestBrick);
                        }
                    }
                }
            }

            ball.update();
        }

        // Dynamic physics bias adjustment for high-speed prevention
        const world = this.physics.world as Phaser.Physics.Arcade.World;
        const physicsFps = world.fps || 120;
        const stepTime = 1 / physicsFps;
        const distancePerStep = maxVel * stepTime;
        const bias = Math.max(40, distancePerStep * 1.5);
        world.TILE_BIAS = bias;
        world.OVERLAP_BIAS = Math.max(4, bias / 10);

        // Optimized: Cache powerups array
        // We use a regular array copy or backward loop because we might modify the group
        const powerUps = this.powerUps.getChildren();
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const pu = powerUps[i] as PowerUp;
            pu.update();

            // Handle off-screen cleanup
            if (pu.y > DESIGN_HEIGHT + 100) {
                this.powerUps.remove(pu, false);
                this.powerUpPool.release(pu);
            }
        }
    }

    private handleBrickHit(ball: Ball, brick: Brick) {
        try {
            const isFireball = ball.isFireball;
            const isIndestructible = brick.isIndestructible;

            // 火球碰撞金属砖块产生火珠/火星
            if (ball.isFireball && (brick.texture.key === 'brick_metal' || brick.isIndestructible)) {
                this.particles.spawnSparks(brick.x, brick.y);
            }

            const currentTime = this.time.now;
            // 防连击 (Debounce): 如果在50毫秒内再次碰撞同一个砖块，忽略此次碰撞计算
            if (ball.lastHitBrickId === brick.name && currentTime - ball.lastHitTime < 50) {
                return;
            }

            ball.lastHitBrickId = brick.name;
            ball.lastHitTime = currentTime;

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
                    ball.x += separation + (Math.sign(separation) * 1); // 额外反推 1px 确保彻底脱离重叠区
                } else {
                    // 上下侧碰撞
                    if ((ball.y < brick.y && ball.body!.velocity.y > 0) ||
                        (ball.y > brick.y && ball.body!.velocity.y < 0)) {
                        ball.body!.velocity.y *= -1;
                        ball.applyJitter(1.0);
                    }
                    const separation = (ball.y > brick.y) ? overlapY : -overlapY;
                    ball.y += separation + (Math.sign(separation) * 1); // 额外反推 1px 确保彻底脱离重叠区
                }

                // 更新物理体位置
                if (ball.body) ball.body.updateFromGameObject();
            }

            // 金刚砖逻辑：无论是否火球，撞击到就发出声音
            if (isIndestructible) {
                audioManager.play('indestructible');
                // If it's an indestructible brick and a fireball, destroy it
                if (isFireball) {
                    const bx = brick.x;
                    const by = brick.y;
                    this.hud.updateScore(500);
                    this.particles.spawnBrickParticles(bx, by, 0xaaaaaa);
                    ScreenShake.shake(this.cameras.main, 0.008, 150);
                    // 从物理组移除并归还到对象池（不使用 destroy）
                    this.bricks.remove(brick, false);
                    this.brickPool.release(brick);
                }
                return;
            }

            const color = brick.tintTopLeft;
            const res = brick.hit(isFireball);

            if (res.points > 0) {
                // 获取砖块位置 BEFORE 隐藏它
                const brickX = brick.x;
                const brickY = brick.y;

                this.hud.updateScore(res.points);

                // 砖块销毁逻辑：从组和场景中移除，并回收到池
                // 在回收前先读取声音类型
                const isHardSound = ['2', '3', '5', '8'].includes(brick.brickType);
                const soundType = isHardSound ? 'hard' : 'normal';

                if (res.destroyed) {
                    this.bricks.remove(brick, false);
                    this.brickPool.release(brick);

                    if (brick.brickType === '4') {
                        // Delay explosion slightly to allow full hit resolution
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

                // 只有大球才产生震屏
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
        this.triggerHitstop(60); // slightly longer hitstop for powerful feel
        
        if (this.particles && this.particles.spawnExplosion) {
            this.particles.spawnExplosion(cx, cy);
            audioManager.play('hard'); // Reusing hard hit sound for explosion
        }
        
        // Use level configuration to determine exact 3x3 adjacent area
        const conf = LEVELS[this.currentLevelIndex];
        const stepX = conf.brickWidth + conf.brickPaddingX;
        const stepY = conf.brickHeight + conf.brickPaddingY;
        const maxDx = stepX * 1.5;
        const maxDy = stepY * 1.5;
        
        // Find visible active bricks within the 3x3 grid
        const activeBricks = this.bricks.getChildren() as Brick[];
        const bricksToHit: Brick[] = [];
        
        for (const b of activeBricks) {
            if (!b.active || !b.visible) continue;
            // Skip the exploding brick itself
            if (b.x === cx && b.y === cy) continue;
            
            const dx = Math.abs(b.x - cx);
            const dy = Math.abs(b.y - cy);
            
            // Check if within 1 grid cell in any direction (including diagonals)
            if (dx < maxDx && dy < maxDy) {
                bricksToHit.push(b);
            }
        }
        
        // Chain reaction slight delay sorting by distance
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

        const res = brick.hit(true); // Instant kill for most bricks in explosion radius
        const brickX = brick.x;
        const brickY = brick.y;
        const color = (brick.tintTopLeft === 0xffffff) ? 0x00d4ff : brick.tintTopLeft;

        this.hud.updateScore(res.points);

        if (res.destroyed) {
            this.bricks.remove(brick, false);
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
        if (selectedType === 'EXTRA_LIFE' && Math.random() < 0.95) {
            selectedType = 'SPEED_UP';
        }

        // Get powerup from pool (position will be set after)
        const pu = this.powerUpPool.get();

        // IMPORTANT: Set position BEFORE making visible and enabling physics
        pu.setPosition(x, y);

        // Update powerup type (this also recreates the icon text at current position)
        pu.setPowerUpType(selectedType);

        // Make visible and enable physics correctly restoring body state
        pu.enableBody(true, x, y, true, true);
        if (pu.body) {
            pu.setVelocityY(200);
            (pu.body as Phaser.Physics.Arcade.Body).setCircle(25);
        }

        this.powerUps.add(pu);
    }

    private handlePowerUpPickup(pu: PowerUp) {
        // Get type BEFORE returning to pool
        const type = pu.powerUpType;

        // Remove from group and return to pool (this hides the powerup and icon)
        this.powerUps.remove(pu, false);
        this.powerUpPool.release(pu);

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
                // Cancel existing fireball timer and reset
                if (this.fireballTimer) {
                    this.fireballTimer.remove();
                    this.fireballTimer = null;
                }
                this.setFireball(true);
                this.fireballTimer = this.time.delayedCall(DURATION, () => {
                    this.fireballTimer = null;
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
                // Cancel existing speed up timer and reset
                if (this.speedUpTimer) {
                    this.speedUpTimer.remove();
                    this.speedUpTimer = null;
                    // Remove old multiplier
                    const index = this.activeSpeedMultipliers.indexOf(1.3);
                    if (index !== -1) {
                        this.activeSpeedMultipliers.splice(index, 1);
                    }
                }
                this.updateBallsSpeed(1.3, DURATION);
                break;
            case 'SPEED_DOWN':
                // Cancel existing speed down timer and reset
                if (this.speedDownTimer) {
                    this.speedDownTimer.remove();
                    this.speedDownTimer = null;
                    // Remove old multiplier
                    const index = this.activeSpeedMultipliers.indexOf(0.7);
                    if (index !== -1) {
                        this.activeSpeedMultipliers.splice(index, 1);
                    }
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

        // Apply limit
        const finalScale = Math.min(newScale, maxScale);

        this.paddle.scaleX = finalScale;
        const body = this.paddle.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(GameConfig.PADDLE_WIDTH * finalScale, GameConfig.PADDLE_HEIGHT);
        body.updateFromGameObject();
    }

    private setFireball(active: boolean) {
        this.isFireballActive = active;
        const balls = this.balls.getChildren();
        const ballCount = balls.length;
        for (let i = 0; i < ballCount; i++) {
            const ball = balls[i] as Ball;
            ball.activeFire(active);
            ball.setTint(active ? 0xffaa00 : 0xffffff);
        }
    }

    private doubleBalls() {
        const currentBalls = this.balls.getChildren();
        const ballCount = currentBalls.length;

        for (let i = 0; i < ballCount; i++) {
            const ball = currentBalls[i] as Ball;
            const newBall = this.ballPool.get();
            newBall.setPosition(ball.x, ball.y);
            this.balls.add(newBall);

            newBall.setBallRadius(ball.displayWidth / 2);
            newBall.isFireball = ball.isFireball;
            if (this.isFireballActive) {
                newBall.activeFire(true);
            }
            newBall.setTint(ball.isFireball ? 0xffaa00 : 0xffffff);
            newBall.setData('targetSpeed', ball.getData('targetSpeed'));

            newBall.launch();
            if (ball.body && newBall.body) {
                const vel = ball.body.velocity;
                newBall.body.velocity.set(vel.x * -1, vel.y);
            }
        }
    }

    private updateBallsRadius(scaleFactor: number) {
        const maxRadius = (DESIGN_WIDTH * GameConfig.POWERUPS.MAX_BALL_DIAMETER_PERCENT) / 2;
        const balls = this.balls.getChildren();
        const ballCount = balls.length;

        for (let i = 0; i < ballCount; i++) {
            const ball = balls[i] as Ball;
            const currentRadius = ball.displayWidth / 2;
            let newRadius = currentRadius * scaleFactor;

            if (newRadius > maxRadius) {
                newRadius = maxRadius;
            }

            ball.setBallRadius(newRadius);
        }
    }

    private updateBallsSpeed(multiplier: number, duration: number) {
        // 记录新倍数
        this.activeSpeedMultipliers.push(multiplier);
        this.applyCurrentSpeedModifiers();

        // Create timer and store reference based on multiplier
        const timer = this.time.delayedCall(duration, () => {
            const index = this.activeSpeedMultipliers.indexOf(multiplier);
            if (index !== -1) {
                this.activeSpeedMultipliers.splice(index, 1);
                this.applyCurrentSpeedModifiers();
            }
            // Clear timer reference
            if (multiplier === 1.3) {
                this.speedUpTimer = null;
            } else if (multiplier === 0.7) {
                this.speedDownTimer = null;
            }
        });

        // Store timer reference
        if (multiplier === 1.3) {
            this.speedUpTimer = timer;
        } else if (multiplier === 0.7) {
            this.speedDownTimer = timer;
        }
    }

    private applyCurrentSpeedModifiers() {
        const totalMultiplier = this.activeSpeedMultipliers.reduce((acc, m) => acc * m, 1);
        const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
        const targetValue = baseSpeed * totalMultiplier;
        const balls = this.balls.getChildren();
        const ballCount = balls.length;

        for (let i = 0; i < ballCount; i++) {
            const ball = balls[i] as Ball;
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
        this.physics.world.timeScale = 1.5;
        this.time.delayedCall(duration, () => {
            this.physics.world.timeScale = 1.0;
        });
    }

    private checkWin() {
        // Check if all non-indestructible bricks are destroyed (not visible)
        const bricks = this.bricks.getChildren();
        for (let i = 0; i < bricks.length; i++) {
            const brick = bricks[i] as Brick;
            if (!brick.isIndestructible && brick.visible) {
                return false;
            }
        }
        return true;
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
                this.scene.start(SCENE_KEYS.GAME_OVER, {
                    score: finalScore,
                    level: completedLevel
                });
            }
        });
    }

    private showWinOverlay(completedLevel: number, score: number) {
        // Pause physics and ball trails
        this.physics.world.isPaused = true;
        const balls = this.balls.getChildren();
        for (let i = 0; i < balls.length; i++) {
            (balls[i] as Ball).body!.stop();
        }

        const width = DESIGN_WIDTH;
        const height = DESIGN_HEIGHT;

        const overlay = this.add.rectangle(0, 0, width, height, 0x0a0a12, 0.85)
            .setOrigin(0)
            .setDepth(2000)
            .setInteractive();

        const container = this.add.container(width / 2, height / 2).setDepth(2001);

        // Glassmorphism panel
        const panel = this.add.rectangle(0, 0, 650, 480, 0x1a1a3e, 0.95);
        panel.setStrokeStyle(4, 0x00d4ff, 1);

        const titleText = this.add.text(0, -140, '关卡完成!', {
            fontSize: '64px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#ffffff',
            fontStyle: '900',
            letterSpacing: 4
        }).setOrigin(0.5);
        titleText.setTint(0xffffff, 0xffffff, 0x00d4ff, 0xffcc00);
        titleText.setShadow(0, 0, 'rgba(0, 212, 255, 0.4)', 30, true, true);

        const levelText = this.add.text(0, -30, `第 ${completedLevel} 关`, {
            fontSize: '42px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#ffffff'
        }).setOrigin(0.5);

        const scoreText = this.add.text(0, 40, `当前得分: ${score.toLocaleString()}`, {
            fontSize: '36px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#00d4ff'
        }).setOrigin(0.5);

        // Modern Continue Button (Cyberpunk style)
        const btnWidth = 280;
        const btnHeight = 64;
        const radius = btnHeight / 2;
        const btn = this.add.container(0, 160);

        const graphics = this.add.graphics();

        // Base fill
        graphics.fillStyle(0x00d4ff, 0.15);
        graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
        graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
        graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

        // Border
        graphics.lineStyle(2, 0x00d4ff, 0.6);
        graphics.beginPath();
        graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
        graphics.lineTo(btnWidth / 2 - radius, -radius);
        graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
        graphics.closePath();
        graphics.strokePath();

        const btnText = this.add.text(0, 0, '下一关', {
            fontSize: '24px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#ffffff',
            fontStyle: 'bold',
            letterSpacing: 3
        }).setOrigin(0.5);

        // Reliable Hit Zone
        const hitZone = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
        hitZone.setInteractive({ useHandCursor: true });

        btn.add([graphics, btnText, hitZone]);
        btn.setSize(btnWidth, btnHeight);

        hitZone.on('pointerover', () => {
            graphics.clear();
            graphics.fillStyle(0x00d4ff, 0.3);
            graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
            graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
            graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

            graphics.lineStyle(3, 0x00d4ff, 1);
            graphics.beginPath();
            graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
            graphics.lineTo(btnWidth / 2 - radius, -radius);
            graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
            graphics.closePath();
            graphics.strokePath();

            this.tweens.add({ targets: btn, y: 158, duration: 200, ease: 'Power2' });
        });

        hitZone.on('pointerout', () => {
            graphics.clear();
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

            this.tweens.add({ targets: btn, y: 160, duration: 200, ease: 'Power2' });
        });

        hitZone.on('pointerdown', () => {
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
        // Return ball to pool instead of destroying
        this.balls.remove(ball, false);
        this.ballPool.release(ball);
        audioManager.play('ballLost');

        if (this.balls.countActive() === 0) {
            this.lives--;
            this.hud.updateLives(this.lives);

            if (this.lives <= 0) {
                audioManager.play('lose');
                const finalScore = this.hud.getScore;
                this.scene.start(SCENE_KEYS.GAME_OVER, {
                    score: finalScore,
                    level: this.currentLevelIndex + 1
                });
            } else {
                const baseSpeed = this.getBaseSpeedForLevel(this.currentLevelIndex);
                const totalMultiplier = this.activeSpeedMultipliers.reduce((acc, m) => acc * m, 1);

                const b = this.ballPool.get();
                b.setPosition(this.paddle.x, DESIGN_HEIGHT * GameConfig.PADDLE_Y_POSITION - 50);
                b.setData('targetSpeed', baseSpeed * totalMultiplier);
                if (this.isFireballActive) {
                    b.activeFire(true);
                }
                this.balls.add(b);
                this.showLaunchInstruction();
            }
        }
    }

    private showLaunchInstruction() {
        // 先清除旧指示文本，防止重复创建导致内存泄漏
        this.clearLaunchInstruction();
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
        const balls = this.balls.getChildren();
        const ballCount = balls.length;
        for (let i = 0; i < ballCount; i++) {
            const ball = balls[i] as Ball;
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

        // Clear existing bricks from pool
        this.bricks.clear(true, true);
        this.brickPool.releaseAll();

        // 深度复制关卡网格
        const gridCopied = conf.grid.map(row => [...row]);

        let normalBrickCount = 0;
        gridCopied.forEach(row => {
            row.forEach(cell => {
                if (cell === '1' || cell === '2' || cell === '3') normalBrickCount++;
            });
        });

        // 从第三关 (idx >= 2) 开始，随机加入特殊砖块
        if (idx >= 2) {
            // 每 20 个普通砖块产生 1 个特殊砖块
            let numSpecial = Math.floor(normalBrickCount / 20);
            if (Math.random() < (normalBrickCount % 20) / 20) {
                numSpecial++;
            }
            // 确保至少有 1 个特殊砖块
            numSpecial = Math.max(1, numSpecial);

            for (let i = 0; i < numSpecial; i++) {
                const specialTypes: import('../config/LevelData').BrickType[] = ['4', '5', '6'];
                const st = Phaser.Math.RND.pick(specialTypes);

                let possibleCoords: { r: number, c: number }[] = [];
                // 隐形砖块允许在现有网格下方额外生成最多3行空行
                const maxRows = st === '5' ? conf.rows + 3 : conf.rows;

                for (let r = 0; r < maxRows; r++) {
                    for (let c = 0; c < conf.cols; c++) {
                        // 如果超出现有网格，则视为空地 ('0')
                        const cell = r < gridCopied.length ? gridCopied[r][c] : '0';
                        if (st === '5') {
                            // 隐形砖块 ('5') 只能出现在原本没有砖块的地方 ('0') 或扩充的空行
                            if (cell === '0') possibleCoords.push({ r, c });
                        } else {
                            // 爆炸 ('4') 和移动 ('6') 替换普通砖块
                            if (cell === '1' || cell === '2' || cell === '3') {
                                possibleCoords.push({ r, c });
                            }
                        }
                    }
                }

                if (possibleCoords.length > 0) {
                    const rCoord = Phaser.Math.RND.pick(possibleCoords);
                    // 动态补全可能缺少的行
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
                this.bricks.add(brick);
                brick.refreshBody();
            });
        });
    }

    shutdown(): void {
        // Clean up timed powerup timers
        if (this.fireballTimer) {
            this.fireballTimer.remove();
            this.fireballTimer = null;
        }
        if (this.speedUpTimer) {
            this.speedUpTimer.remove();
            this.speedUpTimer = null;
        }
        if (this.speedDownTimer) {
            this.speedDownTimer.remove();
            this.speedDownTimer = null;
        }

        // Clean up paddle event listeners
        if (this.paddle) {
            this.paddle.cleanupEventListeners();
        }
        // Clean up HUD
        if (this.hud) {
            this.hud.shutdown();
        }
        // Clean up particle system
        if (this.particles) {
            this.particles.destroy();
        }
        // Release all pooled objects
        if (this.ballPool) {
            this.ballPool.releaseAll();
            this.ballPool.destroy();
        }
        if (this.powerUpPool) {
            this.powerUpPool.releaseAll();
            this.powerUpPool.destroy();
        }
        if (this.brickPool) {
            this.brickPool.releaseAll();
            this.brickPool.destroy();
        }
    }

    private getLineIntersection(line1: Phaser.Geom.Line, line2: Phaser.Geom.Line): Phaser.Geom.Point | null {
        // Wrapper for Phaser's line intersection utility that returns a Point or null
        const point = new Phaser.Geom.Point();
        const intersects = Phaser.Geom.Intersects.LineToLine(line1, line2, point);
        return intersects ? point : null;
    }
}
