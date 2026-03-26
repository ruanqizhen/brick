import Phaser from 'phaser';

export type PowerUpType =
    'PADDLE_EXPAND' | 'PADDLE_SHRINK' |
    'FIREBALL' | 'MULTI_BALL' |
    'BALL_ENLARGE' | 'BALL_SHRINK' |
    'SPEED_UP' | 'SPEED_DOWN' |
    'EXTRA_LIFE';

export class PowerUp extends Phaser.Physics.Matter.Image {
    public powerUpType: PowerUpType;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;
    private difficulty: 'SIMPLE' | 'HARD' = 'SIMPLE';
    private isLocked: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
        const textureKey = `powerup_${type}`;
        if (!scene.textures.exists(textureKey)) {
            PowerUp.createPowerUpTexture(scene, type, textureKey);
        }

        super(scene.matter.world, x, y, textureKey, undefined, {
            label: 'powerup',
            isSensor: false,    // Active physical entity!
            ignoreGravity: true,
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            density: 0.1 // Give it some weight against the ball
        });
        this.sceneRef = scene;
        this.powerUpType = type;

        scene.add.existing(this);
        this.setCircle(25);
        if (this.body) {
            const b = this.body as MatterJS.BodyType;
            b.label = 'powerup';
            b.restitution = 1;
            b.friction = 0;
            b.frictionAir = 0;
            b.frictionStatic = 0;
            this.setSensor(true); // Start as sensor while pooled
            this.setIgnoreGravity(true);
        }

        this.setPoolActive(false);
    }

    override update(): void {
        if (this.isLocked) return;
        // Movement is now natively handled by Matter.js velocity rather than position overrides!
        // We constrain its max speed slightly so it doesn't fly off screen instantly if hit
        if (this.body && this.isPooledActive) {
            const v = this.body.velocity;
            // Introduce a soft drag towards downward drifting
            if (v.y < 3) this.applyForce(new Phaser.Math.Vector2(0, 0.0005));
        }
    }

    setPoolActive(active: boolean): void {
        this.isPooledActive = active;
        this.setVisible(active);
        this.setActive(active);
        if (this.body) {
            if (!active) {
                // Freeze the physics body to remove it from dynamic simulation
                this.setSensor(true);
                this.setStatic(true);
                this.setPosition(0, -200);
                this.setVelocity(0, 0);
            } else {
                // Re-enable dynamic physics
                this.setStatic(false);
                const targetSensor = this.difficulty === 'SIMPLE';
                this.setSensor(targetSensor);
                this.setVelocity(0, 3);
            }
        } else if (!active) {
            this.setPosition(0, -200);
        }
        this.isLocked = false;
    }

    setLocked(locked: boolean): void {
        this.isLocked = locked;
        if (locked) {
            this.setVelocity(0, 0);
            this.setAngularVelocity(0);
        }
    }

    onRelease(): void {
        this.setPoolActive(false);
    }

    isPoolActive(): boolean {
        return this.isPooledActive;
    }

    setDifficulty(difficulty: 'SIMPLE' | 'HARD'): void {
        this.difficulty = difficulty;
        if (this.body && this.isPooledActive) {
            this.setSensor(difficulty === 'SIMPLE');
        }
    }

    setPowerUpType(type: PowerUpType): void {
        this.powerUpType = type;
        const textureKey = `powerup_${type}`;
        if (!this.sceneRef.textures.exists(textureKey)) {
            PowerUp.createPowerUpTexture(this.sceneRef, type, textureKey);
        }
        this.setTexture(textureKey);

        // setTexture can recreate the body, wiping our custom properties. Re-apply them.
        if (this.body) {
            (this.body as MatterJS.BodyType).label = 'powerup';
            const targetSensor = this.isPooledActive ? (this.difficulty === 'SIMPLE') : true;
            this.setSensor(targetSensor);
            this.setIgnoreGravity(true);
            this.setMass(0.5); // Ensure it has good bouncy mass
        }
    }

    override destroy(fromScene?: boolean): void {
        if (!this.sceneRef) return;
        super.destroy(fromScene);
    }

    getScene(): Phaser.Scene {
        return this.sceneRef;
    }

    /**
     * Create a texture for the powerup with a fluorescent glow ring
     */
    public static createPowerUpTexture(scene: Phaser.Scene, type: PowerUpType, textureKey: string): void {
        const graphics = scene.make.graphics({ x: 0, y: 0 });
        const size = 64;
        const center = size / 2;
        const radius = 24;

        const color = PowerUp.getColor(type);

        graphics.lineStyle(6, color, 0.2);
        graphics.strokeCircle(center, center, radius);

        graphics.lineStyle(3, color, 0.5);
        graphics.strokeCircle(center, center, radius);

        graphics.lineStyle(1.5, color, 1);
        graphics.strokeCircle(center, center, radius);

        graphics.lineStyle(0.5, 0xFFFFFF, 0.8);
        graphics.strokeCircle(center, center, radius);

        graphics.fillStyle(color, 1);

        switch (type) {
            case 'PADDLE_EXPAND':
                graphics.beginPath();
                graphics.moveTo(22, 32); graphics.lineTo(28, 26); graphics.lineTo(28, 38); graphics.closePath();
                graphics.moveTo(42, 32); graphics.lineTo(36, 26); graphics.lineTo(36, 38); graphics.closePath();
                graphics.fillPath();
                graphics.fillRect(26, 30, 12, 4);
                break;
            case 'PADDLE_SHRINK':
                graphics.beginPath();
                graphics.moveTo(28, 32); graphics.lineTo(22, 26); graphics.lineTo(22, 38); graphics.closePath();
                graphics.moveTo(36, 32); graphics.lineTo(42, 26); graphics.lineTo(42, 38); graphics.closePath();
                graphics.fillPath();
                graphics.fillRect(26, 30, 12, 4);
                break;
            case 'FIREBALL':
                graphics.fillStyle(0xFF4500, 1);
                graphics.fillCircle(32, 38, 10);
                graphics.fillTriangle(22, 38, 42, 38, 32, 18);
                graphics.fillStyle(0xFFFF00, 1);
                graphics.fillCircle(32, 38, 5);
                graphics.fillTriangle(27, 38, 37, 38, 32, 26);
                break;
            case 'MULTI_BALL':
                graphics.fillCircle(32, 22, 5);
                graphics.fillCircle(25, 36, 5);
                graphics.fillCircle(39, 36, 5);
                graphics.lineStyle(2, color, 0.8);
                graphics.beginPath();
                graphics.moveTo(32, 22); graphics.lineTo(25, 36); graphics.lineTo(39, 36); graphics.closePath();
                graphics.strokePath();
                break;
            case 'BALL_ENLARGE':
                graphics.fillCircle(32, 32, 10);
                graphics.fillStyle(0x000000, 1);
                graphics.fillRect(29, 30, 6, 4);
                graphics.fillRect(30, 29, 4, 6);
                break;
            case 'BALL_SHRINK':
                graphics.fillCircle(32, 32, 4);
                graphics.lineStyle(2, color, 1);
                graphics.beginPath();
                graphics.moveTo(32, 16); graphics.lineTo(32, 24);
                graphics.moveTo(32, 48); graphics.lineTo(32, 40);
                graphics.moveTo(16, 32); graphics.lineTo(24, 32);
                graphics.moveTo(48, 32); graphics.lineTo(40, 32);
                graphics.strokePath();
                break;
            case 'SPEED_UP':
                graphics.beginPath();
                graphics.moveTo(35, 18);
                graphics.lineTo(25, 33);
                graphics.lineTo(32, 33);
                graphics.lineTo(29, 46);
                graphics.lineTo(39, 29);
                graphics.lineTo(32, 29);
                graphics.closePath();
                graphics.fillPath();
                break;
            case 'SPEED_DOWN':
                graphics.beginPath();
                graphics.moveTo(25, 21); graphics.lineTo(39, 21);
                graphics.lineTo(25, 43); graphics.lineTo(39, 43);
                graphics.closePath();
                graphics.fillPath();
                graphics.fillRect(23, 19, 18, 2);
                graphics.fillRect(23, 43, 18, 2);
                break;
            case 'EXTRA_LIFE':
                graphics.fillCircle(27, 26, 6);
                graphics.fillCircle(37, 26, 6);
                graphics.fillTriangle(21, 28, 43, 28, 32, 42);
                break;
        }

        graphics.generateTexture(textureKey, size, size);
        graphics.destroy();
    }

    private static getColor(type: PowerUpType): number {
        switch (type) {
            case 'PADDLE_EXPAND': return 0x00FFFF;
            case 'PADDLE_SHRINK': return 0xBF00FF;
            case 'FIREBALL': return 0xFF4500;
            case 'MULTI_BALL': return 0x32CD32;
            case 'BALL_ENLARGE': return 0xFFFF00;
            case 'BALL_SHRINK': return 0xFF00FF;
            case 'SPEED_UP': return 0xFF0000;
            case 'SPEED_DOWN': return 0x00BFFF;
            case 'EXTRA_LIFE': return 0xFF0000;
            default: return 0xFFFFFF;
        }
    }
}
