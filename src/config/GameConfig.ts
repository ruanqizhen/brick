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

/** 是否为移动设备（UA + 粗指针双重判断） */
export function isMobileDevice(): boolean {
    if (typeof navigator !== 'undefined') {
        const ua = navigator.userAgent || '';
        if (/Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
    }
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        try {
            if (window.matchMedia('(pointer: coarse)').matches) return true;
        } catch {
            // matchMedia 不可用时按桌面处理
        }
    }
    return false;
}

/** 是否为低端设备（内存/核心数过低的手机） */
function isLowEndDevice(): boolean {
    try {
        const nav = navigator as Navigator & { deviceMemory?: number };
        if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 3) return true;
        if (isMobileDevice() && typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true;
    } catch {
        // 能力探测失败时按普通设备处理
    }
    return false;
}

/** 按设备分级封顶渲染分辨率：低端机 1，普通手机 1.5，桌面 2 */
export function getCappedPixelRatio(): number {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    if (isLowEndDevice()) return Math.min(dpr, 1);
    return Math.min(dpr, isMobileDevice() ? 1.5 : 2);
}

/** 全屏 Bloom 只在桌面端开启，移动端关闭以省 GPU/省电 */
export function shouldEnableBloom(): boolean {
    return !isMobileDevice();
}

export function createPhaserConfig(): Phaser.Types.Core.GameConfig {
    const cappedResolution = getCappedPixelRatio();
    // 高像素密度下边缘已足够平滑，关掉 MSAA 省 GPU；低分辨率才开抗锯齿
    const useAntialias = cappedResolution <= 1.5;
    const config: any = {
        type: Phaser.AUTO,
        parent: 'game-wrapper',
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        resolution: cappedResolution,
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
        antialias: useAntialias,
        render: {
            pixelArt: false,
            antialias: useAntialias,
            roundPixels: true
        }
    };
    return config as Phaser.Types.Core.GameConfig;
}
