import Phaser from 'phaser';
import { BrickType } from '../config/LevelData';
import { GameConfig } from '../config/GameConfig';

export class Brick extends Phaser.Physics.Arcade.Sprite {
    private brickType: BrickType;
    private _hp: number;
    private maxHp: number;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;
    private baseTextureKey: string;
    private shadeVal: number;
    private damageVariantSeed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, type: BrickType) {
        super(scene, x, y, 'brick');
        this.sceneRef = scene;
        
        // Initialize with default values. reset() will override these.
        this.brickType = type;
        this._hp = 1;
        this.maxHp = 1;
        this.baseTextureKey = 'brick';
        this.shadeVal = 1;
        this.damageVariantSeed = 0;

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        // Call reset to setup the actual properties organically
        this.reset(x, y, type);
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
        
        // Organic upgrade: 15% chance for a NORMAL brick to become HARD_2
        if (this.brickType === 'NORMAL' && Math.random() < 0.15) {
            this.brickType = 'HARD_2';
        }

        this._hp = this.brickType === 'INDESTRUCTIBLE' ? Infinity : (this.brickType === 'HARD_3' ? 3 : this.brickType === 'HARD_2' ? 2 : 1);
        this.maxHp = this._hp;
        
        // Organic shading (slight darkening, up to 15%)
        this.shadeVal = Phaser.Math.Between(85, 100) / 100;
        
        // Random base texture for organic look (from brick_var_0 to brick_var_4)
        const varIndex = Math.floor(Math.random() * 5);
        this.baseTextureKey = `brick_var_${varIndex}`;
        
        // Also seed the damage texture variant
        this.damageVariantSeed = Math.floor(Math.random() * 5);

        this.setPosition(x, y);
        this.setVisible(true);
        this.setPoolActive(true);
        this.updateAppearance();
    }

    private updateAppearance() {
        let baseColor: number;
        let finalTexture = this.baseTextureKey;

        switch (this.brickType) {
            case 'INDESTRUCTIBLE':
                baseColor = GameConfig.COLORS.BRICK_INDESTRUCTIBLE;
                finalTexture = 'brick_metal';
                break;
            case 'HARD_3':
                baseColor = GameConfig.COLORS.BRICK_HARD_3;
                break;
            case 'HARD_2':
                baseColor = GameConfig.COLORS.BRICK_HARD_2;
                break;
            default:
                baseColor = GameConfig.COLORS.BRICK_NORMAL;
        }

        // Determine damage texture (if not indestructible)
        if (this.brickType !== 'INDESTRUCTIBLE') {
            const damage = this.maxHp - this._hp;
            if (damage === 1 && this.maxHp >= 2) {
                // To make crack entirely random on hit, we re-roll the seed here
                this.damageVariantSeed = Math.floor(Math.random() * 5);
                finalTexture = `brick_cr_1_var_${this.damageVariantSeed}`;
            } else if (damage >= 2) {
                // Re-roll again for heavy hit to ensure completely different fracture
                this.damageVariantSeed = Math.floor(Math.random() * 5);
                finalTexture = `brick_cr_2_var_${this.damageVariantSeed}`;
            }
        }

        this.setTexture(finalTexture);

        // Apply shade value to base color manually for tinting
        const r = ((baseColor >> 16) & 0xff) * this.shadeVal;
        const g = ((baseColor >> 8) & 0xff) * this.shadeVal;
        const b = (baseColor & 0xff) * this.shadeVal;
        const tintedColor = (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);

        this.setTint(tintedColor);
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
