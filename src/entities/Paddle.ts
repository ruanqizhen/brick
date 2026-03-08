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
    }

    override update(time: number, delta: number) {
        const pointer = this.scene.input.activePointer;
        this.prevX = this.x;

        // 1. 处理鼠标/触摸相对位移 (PRD 2.2, 7.3: 全域追踪)
        if (pointer.isDown) {
            // 鲁棒性坐标提取：尝试从不同来源获取 clientX (支持 PointerEvent, TouchEvent, MouseEvent)
            const anyPointer = pointer as any;
            const event = pointer.event as any;

            let currentClientX: number | undefined = anyPointer.clientX;

            if (currentClientX === undefined && event) {
                if (event.clientX !== undefined) {
                    currentClientX = event.clientX;
                } else if (event.touches && event.touches[0]) {
                    currentClientX = event.touches[0].clientX;
                } else if (event.changedTouches && event.changedTouches[0]) {
                    currentClientX = event.changedTouches[0].clientX;
                }
            }

            // 如果依然无法获取（极端情况），回退到 clamped 的 pointer.x
            if (currentClientX === undefined || isNaN(currentClientX)) {
                currentClientX = pointer.x;
            }

            if (!this.wasPointerDown) {
                this.lastClientX = currentClientX;
                this.wasPointerDown = true;
            } else {
                const clientDeltaX = currentClientX - this.lastClientX;

                // 重要修正：在高分屏 (Retina) 下，displayScale.x 追踪的是物理像素，而 clientX 是 CSS 像素。
                // 我们需要使用 CSS 层次的缩放比例来保持 1:1 的手感。
                const cssScale = this.scene.scale.displaySize.width / DESIGN_WIDTH;
                const gameDeltaX = clientDeltaX / (cssScale || 1);

                // 最终防御：确保不是 NaN 才应用位移，防止挡板消失
                if (!isNaN(gameDeltaX)) {
                    this.x += gameDeltaX;
                    this.lastClientX = currentClientX;
                } else {
                    // 如果发生异常，重新校准起始点以防阻塞
                    this.lastClientX = currentClientX;
                }
            }
        } else {
            this.wasPointerDown = false;
        }

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
            // 物理体比视觉精灵宽 10 像素（左右各 5），确保与世界边界无缝对接
            body.setSize(this.displayWidth + 10, GameConfig.PADDLE_HEIGHT);
            body.setOffset(-5, 0);
            body.updateFromGameObject();
        }
    }

    get velocityX(): number {
        return this._velocityX;
    }
}
