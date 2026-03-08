import Phaser from 'phaser';

export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1920;
export const ASPECT_RATIO = DESIGN_WIDTH / DESIGN_HEIGHT;

export const GameConfig = {
    // 物理参数
    BALL_BASE_SPEED: 12,
    BALL_RADIUS: 10,
    PADDLE_WIDTH: 200,
    PADDLE_HEIGHT: 24,
    PADDLE_Y_POSITION: 0.9, // 底部向上 10%

    // 颜色
    COLORS: {
        BG: '#000010',
        PADDLE: '#FFFFFF',
        BALL: '#FFFFFF',
        BRICK_NORMAL: 0x4FC3F7,
        BRICK_HARD_2: 0xEF6C00,
        BRICK_HARD_3: 0xB71C1C,
        BRICK_INDESTRUCTIBLE: 0xC0C0C0
    },

    // 道具
    POWERUPS: {
        DROP_CHANCE: 0.2
    }
};

export function createPhaserConfig(): Phaser.Types.Core.GameConfig {
    return {
        type: Phaser.AUTO,
        parent: 'game-wrapper',
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false
            }
        },
        backgroundColor: GameConfig.COLORS.BG
    };
}
