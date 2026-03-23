import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Paddle } from './Paddle';
import { audioManager } from '../audio/AudioManager';
import { GameScene } from '../scenes/GameScene';
import { Brick } from './Brick';

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
     */
    public performSweptCircleCCD(paddle: Paddle, bricks: Brick[]) {
        const state = this.getData('state');
        if (state !== 'MOVING') {
            this.prevFramePos = { x: this.x, y: this.y };
            return;
        }

        const p1 = this.prevFramePos;
        const p2 = { x: this.x, y: this.y };

        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        const radius = this.displayWidth / 2;

        // Skip if movement is small (Matter.js can handle it) or initial frame
        if (dist < radius * 0.5 || (p1.x === 0 && p1.y === 0)) {
            this.prevFramePos = { x: this.x, y: this.y };
            return;
        }

        const pathLine = new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y);
        let earliestHit: any = null;

        // 1. Paddle Sweep Check
        // Expand the paddle bounds to include its previous position (for teleportation coverage)
        const paddleW = paddle.displayWidth;
        const paddleH = paddle.displayHeight;
        const padMinX = Math.min(paddle.previousX, paddle.x) - paddleW / 2 - radius;
        const padMaxX = Math.max(paddle.previousX, paddle.x) + paddleW / 2 + radius;
        const padMinY = paddle.y - paddleH / 2 - radius;
        const padMaxY = paddle.y + paddleH / 2 + radius;

        const expandedPaddle = new Phaser.Geom.Rectangle(padMinX, padMinY, padMaxX - padMinX, padMaxY - padMinY);

        if (Phaser.Geom.Intersects.LineToRectangle(pathLine, expandedPaddle)) {
            const hit = this.getLineRectangleIntersection(pathLine, padMinX, padMinY, padMaxX, padMaxY);
            if (hit && (!earliestHit || hit.t < earliestHit.t)) {
                earliestHit = { ...hit, entity: paddle };
            }
        }

        // 2. Brick Sweep Check
        for (const brick of bricks) {
            if (!brick.active || !brick.visible) continue;

            const bMinX = brick.x - brick.displayWidth / 2 - radius;
            const bMaxX = brick.x + brick.displayWidth / 2 + radius;
            const bMinY = brick.y - brick.displayHeight / 2 - radius;
            const bMaxY = brick.y + brick.displayHeight / 2 + radius;

            const expandedRect = new Phaser.Geom.Rectangle(bMinX, bMinY, bMaxX - bMinX, bMaxY - bMinY);
            if (Phaser.Geom.Intersects.LineToRectangle(pathLine, expandedRect)) {
                const hit = this.getLineRectangleIntersection(pathLine, bMinX, bMinY, bMaxX, bMaxY);
                if (hit && (!earliestHit || hit.t < earliestHit.t)) {
                    earliestHit = { ...hit, entity: brick };
                }
            }
        }

        if (earliestHit) {
            // Retroactively correct tunneling!
            const hitPoint = earliestHit.point;
            const normal = earliestHit.normal;

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
            if (earliestHit.entity instanceof Paddle) {
                this.onPaddleHit(earliestHit.entity as Paddle);
            } else if (earliestHit.entity instanceof Brick) {
                const gameScene = this.scene as GameScene;
                const brickEntity = earliestHit.entity as Brick;
                gameScene.handleBrickHit(this, brickEntity);
            }
        }

        // Save position for next frame's comparison
        this.prevFramePos = { x: this.x, y: this.y };
    }

    /**
     * Custom Slab-method raycast for Swept Circle AABB checking.
     */
    private getLineRectangleIntersection(line: Phaser.Geom.Line, left: number, top: number, right: number, bottom: number): { t: number, point: { x: number, y: number }, normal: { x: number, y: number } } | null {
        const p1x = line.x1;
        const p1y = line.y1;
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;

        let tMin = -Infinity;
        let tMax = Infinity;
        let normalMin = { x: 0, y: 0 };

        if (Math.abs(dx) < 0.0001) {
            if (p1x < left || p1x > right) return null;
        } else {
            let t1 = (left - p1x) / dx;
            let t2 = (right - p1x) / dx;
            let n1 = { x: -1, y: 0 };
            let n2 = { x: 1, y: 0 };

            if (t1 > t2) {
                const temp = t1; t1 = t2; t2 = temp;
                const tempN = n1; n1 = n2; n2 = tempN;
            }

            if (t1 > tMin) { tMin = t1; normalMin = n1; }
            if (t2 < tMax) tMax = t2;
            if (tMin > tMax) return null;
        }

        if (Math.abs(dy) < 0.0001) {
            if (p1y < top || p1y > bottom) return null;
        } else {
            let t1 = (top - p1y) / dy;
            let t2 = (bottom - p1y) / dy;
            let n1 = { x: 0, y: -1 };
            let n2 = { x: 0, y: 1 };

            if (t1 > t2) {
                const temp = t1; t1 = t2; t2 = temp;
                const tempN = n1; n1 = n2; n2 = tempN;
            }

            if (t1 > tMin) {
                tMin = t1;
                normalMin = n1;
            }
            if (t2 < tMax) tMax = t2;
            if (tMin > tMax) return null;
        }

        // Intersection must be exactly within the swept line segment
        if (tMin < 0 || tMin > 1) return null;

        return {
            t: tMin,
            point: {
                x: p1x + dx * tMin,
                y: p1y + dy * tMin
            },
            normal: normalMin
        };
    }

    onPaddleHit(paddle: Paddle) {
        const v = this.getVelocityPxPerSec();

        const now = this.scene.time.now;
        if (now - this.lastPaddleHitTime < GameConfig.PADDLE_HIT_COOLDOWN) return;
        this.lastPaddleHitTime = now;

        const hitFactor = Phaser.Math.Clamp((this.x - paddle.x) / (paddle.displayWidth / 2), -1, 1);
        const speed = this.getData('targetSpeed') || GameConfig.BALL_BASE_SPEED;

        // Base reflection angle (-90 deg is straight up)
        let angle = Phaser.Math.DegToRad(-90 + (hitFactor * 60));

        // Add paddle velocity influence ("English" / Momentum Transfer)
        // We normalize paddle.velocityX (px/frame) to px/sec by multiplying by 60 for framerate independence.
        // Sensitivity 0.002 provides a subtle ~10-15 degree shift at high speeds.
        const paddleVelocityPxPerSec = paddle.velocityX * 60;
        const angleModifier = Math.atan(0.002 * paddleVelocityPxPerSec);
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
            this.prevFramePos = { x: 0, y: 0 };
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
