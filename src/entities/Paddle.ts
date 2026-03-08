import Phaser from 'phaser';
import { DESIGN_WIDTH, GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
    private prevX: number = 0;
    private _velocityX: number = 0;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private aKey: Phaser.Input.Keyboard.Key | undefined;
    private dKey: Phaser.Input.Keyboard.Key | undefined;
    private keyboardSpeed: number = 18; // 键盘移动速度 (像素/帧)
    private lastClientX: number = 0;
    private wasPointerDown: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'paddle');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 静态物体，由于手动控制位置

        this.setOrigin(0.5);
        this.prevX = x;

        // 设置键盘控制
        if (scene.input.keyboard) {
            this.cursors = scene.input.keyboard.createCursorKeys();
            this.aKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.dKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        }

        // 全局全域追踪
        window.addEventListener('pointerdown', this.handleWindowPointerDown);
        window.addEventListener('pointermove', this.handleWindowPointerMove);
        window.addEventListener('pointerup', this.handleWindowPointerUp);
        window.addEventListener('pointercancel', this.handleWindowPointerUp);
    }

    private handleWindowPointerDown = (event: PointerEvent) => {
        this.wasPointerDown = true;
        this.lastClientX = event.clientX;
    };

    private handleWindowPointerMove = (event: PointerEvent) => {
        if (!this.wasPointerDown) return;

        const currentClientX = event.clientX;
        const clientDeltaX = currentClientX - this.lastClientX;

        // 重要修正：使用 CSS 层级的缩放比例来保持 1:1 的手感
        const cssScale = this.scene.scale.displaySize.width / DESIGN_WIDTH;
        const gameDeltaX = clientDeltaX / (cssScale || 1);

        if (!isNaN(gameDeltaX)) {
            this.x += gameDeltaX;
            this.lastClientX = currentClientX;
        }
    };

    private handleWindowPointerUp = () => {
        this.wasPointerDown = false;
    };

    override update(time: number, delta: number) {
        this.prevX = this.x;

        // 1. 无需在 update 中处理 Phaser 指针，改用 window 全局事件捕获 (已在成员方法中实现)

        // 2. 键盘输入 (独立处理，允许共存)
        if (this.cursors || this.aKey || this.dKey) {
            // 使用 (1000 / 60) 作为基准，delta 是当前帧经过的毫秒数
            // 如果是 60Hz，delta 约为 16.6ms -> ratio 为 1.0
            // 如果是 120Hz，delta 约为 8.3ms -> ratio 为 0.5
            const frameRatio = delta / (1000 / 60);
            if (this.cursors?.left.isDown || this.aKey?.isDown) {
                this.x -= this.keyboardSpeed * frameRatio;
            } else if (this.cursors?.right.isDown || this.dKey?.isDown) {
                this.x += this.keyboardSpeed * frameRatio;
            }
        }

        // 约束边界：允许 5 像素的重叠以防止小球从极端边缘漏过
        const halfWidth = this.displayWidth / 2;
        this.x = Phaser.Math.Clamp(this.x, halfWidth - 5, DESIGN_WIDTH - halfWidth + 5);

        // 计算速度用于球的摩擦力反弹
        this._velocityX = this.x - this.prevX;

        // 必须同步物理体（StaticBody 不会自动跟随 GameObject 移动）
        if (this.body) {
            const body = this.body as Phaser.Physics.Arcade.StaticBody;

            // 鲁棒性检查：仅在宽度发生物理变化时更新 Body 尺寸，避免每帧重设导致碰撞丢失
            const targetWidth = this.displayWidth + 10;
            if (body.width !== targetWidth) {
                body.setSize(targetWidth, GameConfig.PADDLE_HEIGHT);
                body.setOffset(-5, 0);
            }

            body.updateFromGameObject();
        }
    }

    get velocityX(): number {
        return this._velocityX;
    }

    override destroy(fromScene?: boolean) {
        window.removeEventListener('pointerdown', this.handleWindowPointerDown);
        window.removeEventListener('pointermove', this.handleWindowPointerMove);
        window.removeEventListener('pointerup', this.handleWindowPointerUp);
        window.removeEventListener('pointercancel', this.handleWindowPointerUp);
        super.destroy(fromScene);
    }
}
