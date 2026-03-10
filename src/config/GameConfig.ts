import Phaser from 'phaser';

export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1440;
export const ASPECT_RATIO = DESIGN_WIDTH / DESIGN_HEIGHT;

export const GameConfig = {
    // 物理参数
    BALL_BASE_SPEED: 20,
    BALL_RADIUS: 10,
    PADDLE_WIDTH: 200,
    PADDLE_HEIGHT: 24,
    PADDLE_Y_POSITION: 0.9,

    // 道具
    POWERUPS: {
        DROP_CHANCE: 0.3,
        MAX_PADDLE_WIDTH_PERCENT: 0.7,
        MAX_BALL_DIAMETER_PERCENT: 0.2
    },

    // 关卡难度配置
    LEVELS: {
        EASY_COUNT: 5,
        MEDIUM_COUNT: 10,
        HARD_COUNT: 5,
        SPEED_MULTIPLIER_MAX_LEVEL: 30, // Level at which ball speed reaches 2x
    },

    // 道具持续时间 (毫秒)
    POWERUP_DURATION: 10000,

    // 碰撞 CD (毫秒)
    PADDLE_HIT_COOLDOWN: 150,

    // 速度限制
    BALL_MAX_SAFE_SPEED: 2500,

    // 颜色
    COLORS: {
        BG: '#050510',
        PADDLE: '#FFFFFF',
        BALL: '#FFFFFF',
        BRICK_NORMAL: 0x00bcd4,
        BRICK_HARD_2: 0xff6d00,
        BRICK_HARD_3: 0xe91e63,
        BRICK_INDESTRUCTIBLE: 0xb0bec5
    }
};

export function createPhaserConfig(): Phaser.Types.Core.GameConfig {
    return {
        type: Phaser.AUTO,
        parent: 'game-wrapper',
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        scale: {
            mode: Phaser.Scale.FIT
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 },
                debug: false,
                fps: 120,
                fixedStep: true
            }
        },
        fps: {
            min: 60,
            smoothStep: true,
            forceSetTimeOut: false
        },
        backgroundColor: GameConfig.COLORS.BG
    };
}
