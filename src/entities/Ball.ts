import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Paddle } from './Paddle';
import { audioManager } from '../audio/AudioManager';
import { GameScene } from '../scenes/GameScene';
import { Brick } from './Brick';
import { SpatialHash } from '../utils/SpatialHash';

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
    private isLocked: boolean = false;
    private prevFramePos: { x: number, y: number } = { x: 0, y: 0 };

    // Cached physics constants (avoids repeated property lookups per frame)
    private cachedStepsPerSec: number = 120; // 60Hz * 2 substeps
    // Reusable velocity object (avoids GC pressure from per-call allocations)
    private _velPxPerSec: { x: number, y: number } = { x: 0, y: 0 };

    // Persistent geometry objects for GC-friendly Swept Circle CCD
    private ccdPathLine: Phaser.Geom.Line = new Phaser.Geom.Line();
    private ccdExpandedRect: Phaser.Geom.Rectangle = new Phaser.Geom.Rectangle();
    private ccdCandidateBricks: Set<Brick> = new Set();
    
    // Pre-allocated CCD structures for GC-free operations
    private ccdPenetratedBricks: { brick: Brick, t: number }[] = [];
    private ccdPenetratedCount: number = 0;
    private ccdHitResult = { t: 0, point: { x: 0, y: 0 }, normal: { x: 0, y: 0 }, valid: false };
    private ccdEarliestHit = { t: 0, point: { x: 0, y: 0 }, normal: { x: 0, y: 0 }, entity: null as any };
    private hasEarliestHit: boolean = false;
    
    // Extracted static normals for GC-free checks
    private static readonly N_LEFT = { x: -1, y: 0 };
    private static readonly N_RIGHT = { x: 1, y: 0 };
    private static readonly N_UP = { x: 0, y: -1 };
    private static readonly N_DOWN = { x: 0, y: 1 };

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

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        this.setVelocityPxPerSec(vx, vy);
    }

    override update() {
        if (this.isLocked) return;
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
        const currentSpeed = Math.sqrt(vx * vx + vy * vy) * this.getStepsPerSecond(); // Convert from per-step to px/s
        let color = 0x4FC3F7;

        if (this.isFireball) {
            color = 0xffaa00;
        } else {
            const baseSpeed = GameConfig.BALL_BASE_SPEED;
            if (currentSpeed <= baseSpeed) {
                color = 0xFFFFFF;
            } else {
                // Smoothly transition from White to Cyber Blue (0x00D4FF) based on speed.
                // Reaches max blue at 2x base speed.
                const t = Phaser.Math.Clamp((currentSpeed - baseSpeed) / baseSpeed, 0, 1);
                const r = Math.floor(255 * (1 - t));
                const g = Math.floor(255 - (43 * t)); // 255 -> 212
                const b = 255;
                color = Phaser.Display.Color.GetColor(r, g, b);
            }
        }

        this.trailEmitter.setParticleTint(color);
    }

    private getStepsPerSecond(): number {
        return this.cachedStepsPerSec;
    }

    getVelocityPxPerSec(): { x: number, y: number } {
        const b = this.body as MatterJS.BodyType;
        this._velPxPerSec.x = b.velocity.x * this.cachedStepsPerSec;
        this._velPxPerSec.y = b.velocity.y * this.cachedStepsPerSec;
        return this._velPxPerSec;
    }

    setVelocityPxPerSec(vx: number, vy: number) {
        const stepsPerSec = this.cachedStepsPerSec;
        this.setVelocity(vx / stepsPerSec, vy / stepsPerSec);
    }

    getSpeedPxPerSec(): number {
        const v = this.getVelocityPxPerSec();
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    setBallRadius(radius: number) {
        this._radius = radius;

        // Phaser 3 Matter automatically scales the underlying physics body when display size/scale changes.
        // Retain native display size scaling to avoid desyncing the 256x256 texture origin from the body.
        this.setDisplaySize(radius * 2, radius * 2);

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
            // Apply speed normalization with a soft "lerp" factor to prevent jitter
            // at different frame rates or during micro-stutters.
            const ratio = clampedTarget / currentSpeed;
            if (Math.abs(ratio - 1) > 0.001) {
                // Smoothly nudge the velocity towards target speed (10% correction per frame)
                const smoothRatio = 1 + (ratio - 1) * 0.1;
                const v = this.getVelocityPxPerSec();
                this.setVelocityPxPerSec(v.x * smoothRatio, v.y * smoothRatio);
            }
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

    /**
     * Ensures the ball never moves too horizontally (prevents horizontal traps).
     * Called after wall or brick hits.
     */
    public enforceMinimumVerticalAngle() {
        const v = this.getVelocityPxPerSec();
        const currentSpeed = this.getSpeedPxPerSec();
        if (currentSpeed < 10) return;

        let angle = Math.atan2(v.y, v.x);
        let deg = Phaser.Math.RadToDeg(angle);

        // Define a safe vertical zone (at least 15 degrees away from perfectly horizontal)
        const minAngle = 15;

        if (v.y <= 0) {
            // Moving UP: Avoid -180 and 0. Clamp between -180 + minAngle and -minAngle.
            deg = Phaser.Math.Clamp(deg, -180 + minAngle, -minAngle);
        } else {
            // Moving DOWN: Avoid 180 and 0. Clamp between minAngle and 180 - minAngle.
            deg = Phaser.Math.Clamp(deg, minAngle, 180 - minAngle);
        }

        const newRad = Phaser.Math.DegToRad(deg);
        this.setVelocityPxPerSec(Math.cos(newRad) * currentSpeed, Math.sin(newRad) * currentSpeed);
    }

    /**
     * Performs a Custom Swept Circle Continuous Collision Detection (CCD)
     * checking the ball's trajectory against the paddle and bricks.
     * Fixes tunneling caused by paddle teleportation or massive frame drops.
     * Uses spatial hash for O(1) average-case brick lookups.
     */
    public performSweptCircleCCD(paddle: Paddle, spatialHash: SpatialHash) {
        const state = this.getData('state');
        if (state !== 'MOVING') {
            this.prevFramePos.x = this.x; this.prevFramePos.y = this.y;
            return;
        }

        const p1x = this.prevFramePos.x;
        const p1y = this.prevFramePos.y;
        const p2x = this.x;
        const p2y = this.y;

        const dist = Phaser.Math.Distance.Between(p1x, p1y, p2x, p2y);
        const radius = this.displayWidth / 2;

        // Skip if movement is small (Matter.js can handle it) or initial frame
        if (dist < radius * 0.5 || (p1x === 0 && p1y === 0)) {
            this.prevFramePos.x = this.x; this.prevFramePos.y = this.y;
            return;
        }

        this.ccdPathLine.setTo(p1x, p1y, p2x, p2y);
        this.hasEarliestHit = false;
        this.ccdPenetratedCount = 0;

        // 1. Paddle Sweep Check
        // Expand the paddle bounds to include its previous position (for teleportation coverage)
        const paddleW = paddle.displayWidth;
        const paddleH = paddle.displayHeight;
        const padMinX = Math.min(paddle.previousX, paddle.x) - paddleW / 2 - radius;
        const padMaxX = Math.max(paddle.previousX, paddle.x) + paddleW / 2 + radius;
        const padMinY = paddle.y - paddleH / 2 - radius;
        const padMaxY = paddle.y + paddleH / 2 + radius;

        this.ccdExpandedRect.setTo(padMinX, padMinY, padMaxX - padMinX, padMaxY - padMinY);

        if (Phaser.Geom.Intersects.LineToRectangle(this.ccdPathLine, this.ccdExpandedRect)) {
            this.getLineRectangleIntersection(this.ccdPathLine, padMinX, padMinY, padMaxX, padMaxY);
            if (this.ccdHitResult.valid && (!this.hasEarliestHit || this.ccdHitResult.t < this.ccdEarliestHit.t)) {
                this.ccdEarliestHit.t = this.ccdHitResult.t;
                this.ccdEarliestHit.point.x = this.ccdHitResult.point.x;
                this.ccdEarliestHit.point.y = this.ccdHitResult.point.y;
                this.ccdEarliestHit.normal = this.ccdHitResult.normal;
                this.ccdEarliestHit.entity = paddle;
                this.hasEarliestHit = true;
            }
        }

        // 2. Brick Sweep Check — using spatial hash for O(1) lookup
        const sweepMinX = Math.min(p1x, p2x) - radius;
        const sweepMaxX = Math.max(p1x, p2x) + radius;
        const sweepMinY = Math.min(p1y, p2y) - radius;
        const sweepMaxY = Math.max(p1y, p2y) + radius;

        // Query spatial hash for candidate bricks near the sweep path
        this.ccdCandidateBricks.clear();
        spatialHash.query(sweepMinX - 10, sweepMinY - 10, sweepMaxX + 10, sweepMaxY + 10, this.ccdCandidateBricks);

        for (const brick of this.ccdCandidateBricks) {
            if (!brick.active || !brick.visible) continue;

            // Coarse AABB reject: skip bricks far from the swept path
            const bHalfW = brick.displayWidth / 2;
            const bHalfH = brick.displayHeight / 2;
            if (brick.x + bHalfW < sweepMinX - 10 || brick.x - bHalfW > sweepMaxX + 10) continue;
            if (brick.y + bHalfH < sweepMinY - 10 || brick.y - bHalfH > sweepMaxY + 10) continue;

            const bMinX = brick.x - bHalfW - radius;
            const bMaxX = brick.x + bHalfW + radius;
            const bMinY = brick.y - bHalfH - radius;
            const bMaxY = brick.y + bHalfH + radius;

            this.ccdExpandedRect.setTo(bMinX, bMinY, bMaxX - bMinX, bMaxY - bMinY);
            if (Phaser.Geom.Intersects.LineToRectangle(this.ccdPathLine, this.ccdExpandedRect)) {
                this.getLineRectangleIntersection(this.ccdPathLine, bMinX, bMinY, bMaxX, bMaxY);
                if (this.ccdHitResult.valid) {
                    if (this.isFireball && !brick.isIndestructible) {
                        if (this.ccdPenetratedCount >= this.ccdPenetratedBricks.length) {
                            this.ccdPenetratedBricks.push({ brick, t: this.ccdHitResult.t });
                        } else {
                            this.ccdPenetratedBricks[this.ccdPenetratedCount].brick = brick;
                            this.ccdPenetratedBricks[this.ccdPenetratedCount].t = this.ccdHitResult.t;
                        }
                        this.ccdPenetratedCount++;
                    } else if (!this.hasEarliestHit || this.ccdHitResult.t < this.ccdEarliestHit.t) {
                        this.ccdEarliestHit.t = this.ccdHitResult.t;
                        this.ccdEarliestHit.point.x = this.ccdHitResult.point.x;
                        this.ccdEarliestHit.point.y = this.ccdHitResult.point.y;
                        this.ccdEarliestHit.normal = this.ccdHitResult.normal;
                        this.ccdEarliestHit.entity = brick;
                        this.hasEarliestHit = true;
                    }
                }
            }
        }

        const gameScene = this.scene as GameScene;

        // Process penetrated bricks first
        for (let i = 0; i < this.ccdPenetratedCount; i++) {
            const p = this.ccdPenetratedBricks[i];
            // Only process if it is before the earliest reflection hit
            if (!this.hasEarliestHit || p.t <= this.ccdEarliestHit.t) {
                gameScene.handleBrickHit(this, p.brick);
            }
        }

        if (this.hasEarliestHit) {
            // Retroactively correct tunneling!
            const hitPoint = this.ccdEarliestHit.point;
            const normal = this.ccdEarliestHit.normal;

            // Move ball to point of impact (pull back microscopically to prevent snagging)
            this.setPosition(hitPoint.x + normal.x * 0.1, hitPoint.y + normal.y * 0.1);

            // Reflect velocity
            const v = this.getVelocityPxPerSec();
            const dot = v.x * normal.x + v.y * normal.y;

            // Only reflect if moving towards the surface
            if (dot < 0) {
                const newVx = v.x - 2 * dot * normal.x;
                const newVy = v.y - 2 * dot * normal.y;
                this.setVelocityPxPerSec(newVx, newVy);
                this.applyJitter(1.0);
                this.enforceMinimumVerticalAngle();
            }

            // Trigger actual game logic
            if (this.ccdEarliestHit.entity instanceof Paddle) {
                this.onPaddleHit(this.ccdEarliestHit.entity);
            } else if (this.ccdEarliestHit.entity instanceof Brick) {
                gameScene.handleBrickHit(this, this.ccdEarliestHit.entity);
            }
        }

        // Save position for next frame's comparison
        this.prevFramePos.x = this.x; this.prevFramePos.y = this.y;
    }

    /**
     * Custom Slab-method raycast for Swept Circle AABB checking.
     */
    private getLineRectangleIntersection(line: Phaser.Geom.Line, left: number, top: number, right: number, bottom: number): void {
        this.ccdHitResult.valid = false;
        const p1x = line.x1;
        const p1y = line.y1;
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;

        let tMin = -Infinity;
        let tMax = Infinity;
        let normalMin = Ball.N_LEFT;

        if (Math.abs(dx) < 0.0001) {
            if (p1x < left || p1x > right) return;
        } else {
            let t1 = (left - p1x) / dx;
            let t2 = (right - p1x) / dx;
            let n1 = Ball.N_LEFT;
            let n2 = Ball.N_RIGHT;

            if (t1 > t2) {
                const temp = t1; t1 = t2; t2 = temp;
                const tempN = n1; n1 = n2; n2 = tempN;
            }

            if (t1 > tMin) { tMin = t1; normalMin = n1; }
            if (t2 < tMax) tMax = t2;
            if (tMin > tMax) return;
        }

        if (Math.abs(dy) < 0.0001) {
            if (p1y < top || p1y > bottom) return;
        } else {
            let t1 = (top - p1y) / dy;
            let t2 = (bottom - p1y) / dy;
            let n1 = Ball.N_UP;
            let n2 = Ball.N_DOWN;

            if (t1 > t2) {
                const temp = t1; t1 = t2; t2 = temp;
                const tempN = n1; n1 = n2; n2 = tempN;
            }

            if (t1 > tMin) {
                tMin = t1;
                normalMin = n1;
            }
            if (t2 < tMax) tMax = t2;
            if (tMin > tMax) return;
        }

        // Intersection must be exactly within the swept line segment
        if (tMin < 0 || tMin > 1) return;

        this.ccdHitResult.t = tMin;
        this.ccdHitResult.point.x = p1x + dx * tMin;
        this.ccdHitResult.point.y = p1y + dy * tMin;
        this.ccdHitResult.normal = normalMin;
        this.ccdHitResult.valid = true;
    }

    onPaddleHit(paddle: Paddle) {
        const now = this.scene.time.now;
        if (now - this.lastPaddleHitTime < GameConfig.PADDLE_HIT_COOLDOWN) return;
        this.lastPaddleHitTime = now;

        const hitFactor = Phaser.Math.Clamp((this.x - paddle.x) / (paddle.displayWidth / 2), -1, 1);
        const speed = this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED;

        // 基础反射角度
        let angle = Phaser.Math.DegToRad(-90 + (hitFactor * 60));

        // 加入挡板惯性 (搓球效果)
        // 使用当前 delta 将挡板位移 (px/frame) 转换为 px/sec
        const delta = this.scene.game.loop.delta || 16.6;
        const paddleVelocityPxPerSec = paddle.velocityX * (1000 / delta);
        const angleModifier = Math.atan(0.0002 * paddleVelocityPxPerSec);
        angle += angleModifier;

        // 限制角度，防止水平死循环或向下钻
        let deg = Phaser.Math.RadToDeg(angle);
        deg = Phaser.Math.Clamp(deg, -170, -10);

        const finalAngle = Phaser.Math.DegToRad(deg);
        this.setVelocityPxPerSec(Math.cos(finalAngle) * speed, Math.sin(finalAngle) * speed);

        // 如果有微小扰动逻辑
        this.applyJitter(2.0);

        audioManager.play('paddle');
    }

    isSensor(): boolean {
        return (this.body as MatterJS.BodyType).isSensor;
    }

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
            this.isLocked = false;
            this.prevFramePos.x = 0; this.prevFramePos.y = 0;
            this.ccdPenetratedCount = 0;
        } else {
            this.setActive(true);
            this.setVisible(true);
        }
    }

    onRelease(): void {
        this.setPosition(0, -100);
        this.setSensor(true);
        this.setActive(false);
        this.setVisible(false);
        this.setVelocity(0, 0);
        this.trailEmitter.stop();
        this.fireEmitter.stop();
    }

    isPoolActive(): boolean {
        return this.isPooledActive;
    }

    setLocked(locked: boolean) {
        this.isLocked = locked;
        if (locked) {
            this.setVelocity(0, 0);
            this.setAngularVelocity(0);
            this.trailEmitter.stop();
            this.fireEmitter.stop();
        }
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
