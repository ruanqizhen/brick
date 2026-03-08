import Phaser from 'phaser';
import { DESIGN_WIDTH, GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
    private prevX: number = 0;
    private _velocityX: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'paddle');
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 静态物体，由于手动控制位置

        this.setOrigin(0.5);
        this.prevX = x;
    }

    override update() {
        const pointer = this.scene.input.activePointer;
        this.prevX = this.x;

        // 无论移动端还是桌面端，直接跟随指针 X 坐标是最灵敏的
        // 只有当指针处于激活状态（按下或在移动）时更新
        if (pointer.active || pointer.isDown) {
            this.x = pointer.x;
        }

        // 约束边界
        const halfWidth = this.displayWidth / 2;
        this.x = Phaser.Math.Clamp(this.x, halfWidth, DESIGN_WIDTH - halfWidth);

        // 计算速度用于球的摩擦力反弹
        this._velocityX = this.x - this.prevX;

        // 必须同步物理体（StaticBody 不会自动跟随 GameObject 移动）
        if (this.body) {
            (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
        }
    }

    get velocityX(): number {
        return this._velocityX;
    }
}
