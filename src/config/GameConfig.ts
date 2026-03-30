import Phaser from 'phaser';

export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 1440;
export const ASPECT_RATIO = DESIGN_WIDTH / DESIGN_HEIGHT;

export const GameConfig = {
    // 物理参数
    BALL_BASE_SPEED: 1000,
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
        SPEED_MULTIPLIER_MAX_LEVEL: 60,
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
        BRICK_1: 0x00e5ff,
        BRICK_2: 0xffea00,
        BRICK_3: 0xff00d4,
        BRICK_8: 0xffffff
    }
};

export function createPhaserConfig(): Phaser.Types.Core.GameConfig {
    const config: any = {
        type: Phaser.AUTO,
        parent: 'game-wrapper',
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        resolution: window.devicePixelRatio || 1,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.NO_CENTER
        },
        physics: {
            default: 'matter',
            matter: {
                gravity: { x: 0, y: 0 },
                debug: false,
                positionIterations: 8,
                velocityIterations: 6,
                enableSleeping: false,
                runner: {
                    isFixed: true,    // Use fixed timestep for physics stability
                    delta: 1000 / 60, // 60Hz physics update rate
                    subSteps: 2       // 2 sub-steps per physics update (120 total steps/sec)
                }
            }
        },
        fps: {
            min: 10,
            smoothStep: false,
            forceSetTimeOut: false
        },
        backgroundColor: GameConfig.COLORS.BG,
        antialias: true,
        render: {
            pixelArt: false,
            antialias: true,
            roundPixels: true
        }
    };
    return config as Phaser.Types.Core.GameConfig;
}
