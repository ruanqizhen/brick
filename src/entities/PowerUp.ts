import Phaser from 'phaser';

export type PowerUpType =
    'PADDLE_EXPAND' | 'PADDLE_SHRINK' |
    'FIREBALL' | 'MULTI_BALL' |
    'BALL_ENLARGE' | 'BALL_SHRINK' |
    'SPEED_UP' | 'SPEED_DOWN' |
    'EXTRA_LIFE';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
    public powerUpType: PowerUpType;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
        // Create texture for this powerup type if not exists
        const textureKey = `powerup_${type}`;
        if (!scene.textures.exists(textureKey)) {
            PowerUp.createPowerUpTexture(scene, type, textureKey);
        }

        super(scene, x, y, textureKey);
        this.sceneRef = scene;
        this.powerUpType = type;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setVelocityY(200);
        this.setCircle(25);

        this.setPoolActive(false);
    }

    override update(): void {
        // Rotational animation or pulse could be added here in the future
    }

    // Pool methods
    setPoolActive(active: boolean): void {
        this.isPooledActive = active;
        this.setVisible(active);
        if (!active) {
            this.setPosition(0, -100);
            this.setVelocity(0, 0);
            if (this.body) {
                this.body.enable = false;
            }
        }
    }

    onRelease(): void {
        this.setPosition(0, -100);
        this.setVisible(false);
        if (this.body) {
            this.body.enable = false;
        }
    }

    isPoolActive(): boolean {
        return this.isPooledActive;
    }

    /**
     * Set the powerup type and update appearance
     */
    setPowerUpType(type: PowerUpType): void {
        this.powerUpType = type;
        const textureKey = `powerup_${type}`;
        if (!this.sceneRef.textures.exists(textureKey)) {
            PowerUp.createPowerUpTexture(this.sceneRef, type, textureKey);
        }
        this.setTexture(textureKey);
    }

    override destroy(fromScene?: boolean): void {
        if (!this.sceneRef) return;
        super.destroy(fromScene);
    }

    /**
     * Get the scene reference
     */
    getScene(): Phaser.Scene {
        return this.sceneRef;
    }

    /**
     * Create a texture for the powerup with a fluorescent glow ring
     */
    private static createPowerUpTexture(scene: Phaser.Scene, type: PowerUpType, textureKey: string): void {
        const graphics = scene.make.graphics({ x: 0, y: 0 });
        const size = 64; // Slightly larger for glow
        const center = size / 2;
        const radius = 24;

        const color = PowerUp.getColor(type);

        // 1. Outer Glow (Soft, wide)
        graphics.lineStyle(6, color, 0.2);
        graphics.strokeCircle(center, center, radius);

        // 2. Medium Glow
        graphics.lineStyle(3, color, 0.5);
        graphics.strokeCircle(center, center, radius);

        // 3. Core Neon (Sharp)
        graphics.lineStyle(1.5, color, 1);
        graphics.strokeCircle(center, center, radius);

        // 4. Inner Bright Spike (almost white)
        graphics.lineStyle(0.5, 0xFFFFFF, 0.8);
        graphics.strokeCircle(center, center, radius);

        // --- DRAW VECTOR ICON ---
        graphics.fillStyle(color, 1);
        
        switch (type) {
            case 'PADDLE_EXPAND':
                // Two outward arrows < >
                graphics.beginPath();
                graphics.moveTo(22, 32); graphics.lineTo(28, 26); graphics.lineTo(28, 38); graphics.closePath();
                graphics.moveTo(42, 32); graphics.lineTo(36, 26); graphics.lineTo(36, 38); graphics.closePath();
                graphics.fillPath();
                graphics.fillRect(26, 30, 12, 4);
                break;
            case 'PADDLE_SHRINK':
                // Two inward arrows > <
                graphics.beginPath();
                graphics.moveTo(28, 32); graphics.lineTo(22, 26); graphics.lineTo(22, 38); graphics.closePath();
                graphics.moveTo(36, 32); graphics.lineTo(42, 26); graphics.lineTo(42, 38); graphics.closePath();
                graphics.fillPath();
                graphics.fillRect(26, 30, 12, 4);
                break;
            case 'FIREBALL':
                // Flame using precise overlapping geometry
                graphics.fillStyle(0xFF4500, 1);
                graphics.fillCircle(32, 38, 10);
                graphics.fillTriangle(22, 38, 42, 38, 32, 18);
                // Inner yellow core
                graphics.fillStyle(0xFFFF00, 1);
                graphics.fillCircle(32, 38, 5);
                graphics.fillTriangle(27, 38, 37, 38, 32, 26);
                break;
            case 'MULTI_BALL':
                // Three circles
                graphics.fillCircle(32, 22, 5);
                graphics.fillCircle(25, 36, 5);
                graphics.fillCircle(39, 36, 5);
                // Connecting lines
                graphics.lineStyle(2, color, 0.8);
                graphics.beginPath();
                graphics.moveTo(32, 22); graphics.lineTo(25, 36); graphics.lineTo(39, 36); graphics.closePath();
                graphics.strokePath();
                break;
            case 'BALL_ENLARGE':
                // Big expanding circle
                graphics.fillCircle(32, 32, 10);
                // Cutout +
                graphics.fillStyle(0x000000, 1); 
                graphics.fillRect(29, 30, 6, 4);
                graphics.fillRect(30, 29, 4, 6);
                break;
            case 'BALL_SHRINK':
                // Tiny circle with inward lines
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
                // Lightning bolt
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
                // Glowing hourglass
                graphics.beginPath();
                graphics.moveTo(25, 21); graphics.lineTo(39, 21);
                graphics.lineTo(25, 43); graphics.lineTo(39, 43);
                graphics.closePath();
                graphics.fillPath();
                graphics.fillRect(23, 19, 18, 2);
                graphics.fillRect(23, 43, 18, 2);
                break;
            case 'EXTRA_LIFE':
                // Full elegant heart via geometry
                graphics.fillCircle(27, 26, 6);
                graphics.fillCircle(37, 26, 6);
                graphics.fillTriangle(21, 28, 43, 28, 32, 42);
                break;
        }

        graphics.generateTexture(textureKey, size, size);
        graphics.destroy();
    }

    /**
     * Get the neon color for each powerup type
     */
    private static getColor(type: PowerUpType): number {
        switch (type) {
            case 'PADDLE_EXPAND': return 0x00FFFF;    // Neon Cyan
            case 'PADDLE_SHRINK': return 0xBF00FF;    // Electric Purple
            case 'FIREBALL': return 0xFF4500;         // Neon Orange-Red
            case 'MULTI_BALL': return 0x32CD32;       // Electric Lime
            case 'BALL_ENLARGE': return 0xFFFF00;     // Sunshine Yellow
            case 'BALL_SHRINK': return 0xFF00FF;      // Magenta/Pink
            case 'SPEED_UP': return 0xFF0000;         // High-Voltage Red
            case 'SPEED_DOWN': return 0x00BFFF;       // Deep Sky Blue
            case 'EXTRA_LIFE': return 0xFF0000;       // Heart Red
            default: return 0xFFFFFF;
        }
    }
}
