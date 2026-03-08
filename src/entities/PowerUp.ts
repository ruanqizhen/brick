import Phaser from 'phaser';

export type PowerUpType =
    'PADDLE_EXPAND' | 'PADDLE_SHRINK' |
    'FIREBALL' | 'MULTI_BALL' |
    'BALL_ENLARGE' | 'BALL_SHRINK' |
    'SPEED_UP' | 'SPEED_DOWN';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
    public powerUpType: PowerUpType;

    constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
        super(scene, x, y, 'brick'); // 临时使用 brick 纹理
        this.powerUpType = type;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setTint(this.getColor(type));
        this.setVelocityY(200); // 向下掉落
        this.setScale(0.5);
    }

    private getColor(type: PowerUpType): number {
        switch (type) {
            case 'PADDLE_EXPAND': return 0x0000ff; // 蓝色
            case 'PADDLE_SHRINK': return 0x5555ff; // 浅蓝
            case 'FIREBALL': return 0xff4400;      // 橙红
            case 'MULTI_BALL': return 0x00ff00;    // 绿色
            case 'BALL_ENLARGE': return 0xffff00;  // 黄色
            case 'BALL_SHRINK': return 0x888800;   // 暗黄
            case 'SPEED_UP': return 0xff0000;      // 红色
            case 'SPEED_DOWN': return 0x00ffff;    // 青色
            default: return 0xffffff;
        }
    }

    override update() {
        if (this.y > (this.scene.game.config.height as number)) {
            this.destroy();
        }
    }
}
