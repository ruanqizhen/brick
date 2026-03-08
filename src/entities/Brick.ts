import Phaser from 'phaser';
import { BrickType } from '../config/LevelData';
import { GameConfig } from '../config/GameConfig';

export class Brick extends Phaser.Physics.Arcade.Sprite {
    private brickType: BrickType;
    private _hp: number;

    constructor(scene: Phaser.Scene, x: number, y: number, type: BrickType) {
        const texture = type === 'INDESTRUCTIBLE' ? 'brick_metal' : 'brick';
        super(scene, x, y, texture);
        this.brickType = type;

        // 设置初始 HP
        switch (type) {
            case 'HARD_3': this._hp = 3; break;
            case 'HARD_2': this._hp = 2; break;
            case 'INDESTRUCTIBLE': this._hp = Infinity; break;
            default: this._hp = 1;
        }

        scene.add.existing(this);
        scene.physics.add.existing(this, true); // 静态物体

        this.updateAppearance();
    }

    hit(): { destroyed: boolean, points: number } {
        if (this.brickType === 'INDESTRUCTIBLE') {
            return { destroyed: false, points: 0 };
        }

        this._hp--;
        this.updateAppearance();

        if (this._hp <= 0) {
            this.destroy();
            return { destroyed: true, points: 100 };
        }

        return { destroyed: false, points: 50 };
    }

    private updateAppearance() {
        let color: number;

        switch (this.brickType) {
            case 'INDESTRUCTIBLE':
                // Use a very light silver/white to show off the metal texture details
                color = 0xEEEEEE;
                break;
            case 'HARD_3':
                color = this._hp === 3 ? GameConfig.COLORS.BRICK_HARD_3 : (this._hp === 2 ? GameConfig.COLORS.BRICK_HARD_2 : 0xF9A825);
                break;
            case 'HARD_2':
                color = this._hp === 2 ? GameConfig.COLORS.BRICK_HARD_2 : 0xF9A825;
                break;
            default:
                color = GameConfig.COLORS.BRICK_NORMAL;
        }

        this.setTint(color);
    }

    get isIndestructible(): boolean {
        return this.brickType === 'INDESTRUCTIBLE';
    }

    get hp(): number {
        return this._hp;
    }
}
