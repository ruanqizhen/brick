import Phaser from 'phaser';

export type PowerUpType =
    'PADDLE_EXPAND' | 'PADDLE_SHRINK' |
    'FIREBALL' | 'MULTI_BALL' |
    'BALL_ENLARGE' | 'BALL_SHRINK' |
    'SPEED_UP' | 'SPEED_DOWN';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
    public powerUpType: PowerUpType;
    private iconText!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
        // Create texture for this powerup type if not exists
        const textureKey = `powerup_${type}`;
        if (!scene.textures.exists(textureKey)) {
            PowerUp.createPowerUpTexture(scene, type, textureKey);
        }

        super(scene, x, y, textureKey);
        this.powerUpType = type;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setVelocityY(200); // 向下掉落
        this.setCircle(25); // Circular collision

        // Add emoji icon overlay (large and prominent)
        this.createIconText(scene);
    }

    private createIconText(scene: Phaser.Scene): void {
        const icon = PowerUp.getIcon(this.powerUpType);
        const color = PowerUp.getColor(this.powerUpType);
        const colorStr = `#${color.toString(16).padStart(6, '0')}`;

        this.iconText = scene.add.text(this.x, this.y, icon, {
            fontSize: '32px',
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setShadow(0, 0, colorStr, 12, true, true);
    }

    override update(): void {
        // Sync icon position with sprite
        if (this.iconText) {
            this.iconText.setPosition(this.x, this.y);
        }

        if (this.y > (this.scene.game.config.height as number)) {
            this.destroy();
        }
    }

    override destroy(fromScene?: boolean): void {
        if (this.iconText) {
            this.iconText.destroy();
        }
        super.destroy(fromScene);
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

        graphics.generateTexture(textureKey, size, size);
        graphics.destroy();
    }

    /**
     * Get the icon symbol for each powerup type
     */
    static getIcon(type: PowerUpType): string {
        switch (type) {
            case 'PADDLE_EXPAND': return '↔️';
            case 'PADDLE_SHRINK': return '🔹';
            case 'FIREBALL': return '☄️';
            case 'MULTI_BALL': return '🧬';
            case 'BALL_ENLARGE': return '➕';
            case 'BALL_SHRINK': return '➖';
            case 'SPEED_UP': return '⚡';
            case 'SPEED_DOWN': return '🐌';
            default: return '❓';
        }
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
            default: return 0xFFFFFF;
        }
    }
}
