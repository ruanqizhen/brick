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

    create() {
        // 重置物理环境
        this.physics.world.timeScale = 1.0;
        this.physics.world.isPaused = false;
        (this.physics.world as any).TILE_BIAS = 32; // 默认值 16，增加以处理高速碰撞
        (this.physics.world as any).OVERLAP_BIAS = 4; // 默认值 4

        this.createTextures();

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

    private createTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0 });
        graphics.fillStyle(0xffffff);
        graphics.fillRoundedRect(0, 0, GameConfig.PADDLE_WIDTH, GameConfig.PADDLE_HEIGHT, 10);
        graphics.generateTexture('paddle', GameConfig.PADDLE_WIDTH, GameConfig.PADDLE_HEIGHT);

        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(GameConfig.BALL_RADIUS, GameConfig.BALL_RADIUS, GameConfig.BALL_RADIUS);
        graphics.generateTexture('ball', GameConfig.BALL_RADIUS * 2, GameConfig.BALL_RADIUS * 2);

        graphics.clear();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 80, 30);
        graphics.generateTexture('brick', 80, 30);
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

                ScreenShake.shake(this.cameras.main, res.destroyed ? 0.005 : 0.002, 100);
                this.triggerHitstop(res.destroyed ? 60 : 30);

                if (res.destroyed && Math.random() < GameConfig.POWERUPS.DROP_CHANCE) {
                    this.spawnPowerUp(brick.x, brick.y);
                }
            }

            if (this.checkWin()) {
                this.handleWin();
            } else if (this.bricks.getChildren().filter(b => !(b as Brick).isIndestructible).length === 1) {
                this.triggerSlowMo();
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

        switch (type) {
            case 'PADDLE_EXPAND':
                this.updatePaddleWidth(1.5);
                this.hud.addPowerUp(type); // Permanent until replaced
                break;
            case 'PADDLE_SHRINK':
                this.updatePaddleWidth(0.6);
                this.hud.addPowerUp(type); // Permanent until replaced
                break;
            case 'FIREBALL':
                this.setFireball(true);
                this.hud.addPowerUp(type, 8000);
                this.time.delayedCall(8000, () => {
                    this.setFireball(false);
                    this.hud.removePowerUp(type);
                });
                break;
            case 'MULTI_BALL':
                this.spawnMultiBalls(3);
                this.hud.addPowerUp(type); // Permanent until life lost
                break;
            case 'BALL_ENLARGE':
                this.updateBallsRadius(1.4);
                this.hud.addPowerUp(type); // Permanent
                break;
            case 'BALL_SHRINK':
                this.updateBallsRadius(0.7);
                this.hud.addPowerUp(type); // Permanent
                break;
            case 'SPEED_UP':
                this.updateBallsSpeed(1.3, 8000);
                this.hud.addPowerUp(type, 8000);
                break;
            case 'SPEED_DOWN':
                this.updateBallsSpeed(0.7, 8000);
                this.hud.addPowerUp(type, 8000);
                break;
        }
    }

    private updatePaddleWidth(scale: number) {
        const targetWidth = Math.min(DESIGN_WIDTH * 0.7, GameConfig.PADDLE_WIDTH * scale);
        // 这里只是简单设置，PRD 说是永久，但并没有说能否继续叠加，暂定允许
        this.paddle.scaleX = scale;
        const body = this.paddle.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(GameConfig.PADDLE_WIDTH * scale, GameConfig.PADDLE_HEIGHT);
        body.updateFromGameObject();
    }

    private setFireball(active: boolean) {
        this.balls.getChildren().forEach(b => {
            (b as Ball).isFireball = active;
            (b as Ball).setTint(active ? 0xffaa00 : 0xffffff);
        });
    }

    private spawnMultiBalls(count: number) {
        const main = this.balls.getFirstAlive() as Ball;
        if (!main) return;
        for (let i = 0; i < count - 1; i++) {
            const ball = new Ball(this, main.x, main.y);
            this.balls.add(ball);
            ball.launch();
        }
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
            this.currentLevelIndex++;
            if (this.currentLevelIndex < LEVELS.length) {
                this.scene.restart();
            } else {
                // Completed all levels - show victory in GameOverScene
                const finalScore = this.hud.getScore;
                const isNewHighScore = GameOverScene.saveHighScore(finalScore);
                this.scene.start('GameOverScene', {
                    score: finalScore,
                    level: this.currentLevelIndex,
                    isNewHighScore
                });
            }
        });
    }

    private handleBallLost(ball: Ball) {
        ball.destroy();
        audioManager.play('ballLost');

        if (this.balls.countActive() === 0) {
            this.lives--;
            this.hud.updateLives(this.lives);
            // Clear all powerups when life is lost
            this.hud.clearAllPowerUps();
            
            if (this.lives <= 0) {
                audioManager.play('lose');
                // Save high score and transition to GameOverScene
                const finalScore = this.hud.getScore;
                const isNewHighScore = GameOverScene.saveHighScore(finalScore);
                this.scene.start('GameOverScene', {
                    score: finalScore,
                    level: this.currentLevelIndex + 1,
                    isNewHighScore
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
