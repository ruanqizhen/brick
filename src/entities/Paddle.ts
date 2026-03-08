import Phaser from 'phaser';
import { DESIGN_WIDTH, GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
    private prevX: number = 0;
    private _velocityX: number = 0;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    private aKey: Phaser.Input.Keyboard.Key | undefined;
    private dKey: Phaser.Input.Keyboard.Key | undefined;
    private keyboardSpeed: number = 18; // 键盘移动速度 (像素/帧)

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

        // 1. 优先处理鼠标/触摸跟随 (灵敏度最高)
        if ((pointer.active || pointer.isDown) && pointer.x !== pointer.prevPosition.x) {
            this.x = pointer.x;
        }
        // 2. 处理键盘输入 (引入 delta time 补偿，16.666ms 为 60fps 基准)
        else if (this.cursors || this.aKey || this.dKey) {
            const frameRatio = delta / 16.666;
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
