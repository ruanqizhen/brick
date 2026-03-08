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
        this.iconText = scene.add.text(this.x, this.y, icon, {
            fontSize: '56px',
            fontStyle: 'bold'
        }).setOrigin(0.5);
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
     * Create a texture for the powerup with icon and color
     */
    private static createPowerUpTexture(scene: Phaser.Scene, type: PowerUpType, textureKey: string): void {
        const graphics = scene.make.graphics({ x: 0, y: 0 });
        const size = 50;

        // Background circle (subtle, light color)
        const color = PowerUp.getColor(type);
        graphics.fillStyle(color, 0.4);
        graphics.fillCircle(size / 2, size / 2, size / 2);

        // Thin border
        graphics.lineStyle(2, color, 0.6);
        graphics.strokeCircle(size / 2, size / 2, size / 2);

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
            case 'BALL_ENLARGE': return '⬆️';
            case 'BALL_SHRINK': return '⬇️';
            case 'SPEED_UP': return '⚡';
            case 'SPEED_DOWN': return '🐌';
            default: return '❓';
        }
    }

    /**
     * Get the color for each powerup type
     */
    private static getColor(type: PowerUpType): number {
        switch (type) {
            case 'PADDLE_EXPAND': return 0x2196F3;    // Blue
            case 'PADDLE_SHRINK': return 0x64B5F6;    // Light Blue
            case 'FIREBALL': return 0xFF5722;         // Deep Orange
            case 'MULTI_BALL': return 0x4CAF50;       // Green
            case 'BALL_ENLARGE': return 0xFFC107;     // Amber
            case 'BALL_SHRINK': return 0xFFEB3B;      // Yellow
            case 'SPEED_UP': return 0xF44336;         // Red
            case 'SPEED_DOWN': return 0x00BCD4;       // Cyan
            default: return 0x9E9E9E;
        }
    }
}
