import Phaser from 'phaser';
import { BrickType } from '../config/LevelData';
import { GameConfig } from '../config/GameConfig';

export class Brick extends Phaser.Physics.Arcade.Sprite {
    private brickType: BrickType;
    private _hp: number;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, type: BrickType) {
        const texture = type === 'INDESTRUCTIBLE' ? 'brick_metal' : 'brick';
        super(scene, x, y, texture);
        this.sceneRef = scene;
        this.brickType = type;

        this._hp = type === 'INDESTRUCTIBLE' ? Infinity : (type === 'HARD_3' ? 3 : type === 'HARD_2' ? 2 : 1);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.updateAppearance();
        this.setPoolActive(false);
    }

    hit(): { destroyed: boolean, points: number } {
        if (this.brickType === 'INDESTRUCTIBLE') {
            return { destroyed: false, points: 0 };
        }

        this._hp--;
        this.updateAppearance();

        if (this._hp <= 0) {
            // 隐藏砖块而非销毁
            this.setVisible(false);
            return { destroyed: true, points: 100 };
        }

        return { destroyed: false, points: 50 };
    }

    /**
     * Reset brick for reuse from pool
     */
    reset(x: number, y: number, type: BrickType): void {
        this.brickType = type;
        this._hp = type === 'INDESTRUCTIBLE' ? Infinity : (type === 'HARD_3' ? 3 : type === 'HARD_2' ? 2 : 1);
        this.setPosition(x, y);
        this.setTexture(type === 'INDESTRUCTIBLE' ? 'brick_metal' : 'brick');
        this.setVisible(true);
        this.setPoolActive(true);
        this.updateAppearance();
    }

    private updateAppearance() {
        let color: number;

        switch (this.brickType) {
            case 'INDESTRUCTIBLE':
                color = GameConfig.COLORS.BRICK_INDESTRUCTIBLE;
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

    // Pool methods
    setPoolActive(active: boolean): void {
        this.isPooledActive = active;
        this.setVisible(active);
    }

    onRelease(): void {
        this.setPosition(0, -100);
        this.setVisible(false);
    }

    isPoolActive(): boolean {
        return this.isPooledActive;
    }

    getScene(): Phaser.Scene {
        return this.sceneRef;
    }

    override destroy(fromScene?: boolean): void {
        if (!this.sceneRef) return;
        super.destroy(fromScene);
    }
}
