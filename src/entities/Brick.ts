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
    private crackGraphics: Phaser.GameObjects.Graphics;

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

        // Graphics for rendering dynamic cracks over the brick
        this.crackGraphics = scene.add.graphics();
        this.crackGraphics.setDepth(this.depth + 0.1);

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
        
        if (this._hp > 0 && !this.isIndestructible) {
            this.drawRandomCracks(2);
        }

        if (this._hp <= 0) {
            // 隐藏砖块而非销毁
            this.setVisible(false);
            this.crackGraphics.setVisible(false);
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
        this.crackGraphics.setPosition(x, y); // Sync graphics pos
        this.crackGraphics.clear(); // Clear old cracks
        this.setVisible(true);
        this.crackGraphics.setVisible(true);
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

    private drawRandomCracks(count: number) {
        if (!this.crackGraphics) return;

        const bW = this.displayWidth;
        const bH = this.displayHeight;
        const halfW = bW / 2;
        const halfH = bH / 2;

        for (let j = 0; j < count; j++) {
            this.crackGraphics.lineStyle(2 + Math.random() * 1.5, 0x000000, 0.7 + Math.random() * 0.3);
            this.crackGraphics.beginPath();
            
            // Random start point on an edge (relative to center 0,0)
            let startX, startY;
            if (Math.random() > 0.5) {
                // Top or bottom edge
                startX = (Math.random() * bW) - halfW;
                startY = Math.random() > 0.5 ? -halfH : halfH;
            } else {
                // Left or right edge
                startX = Math.random() > 0.5 ? -halfW : halfW;
                startY = (Math.random() * bH) - halfH;
            }
            
            let currX = startX;
            let currY = startY;
            const steps = 3 + Math.floor(Math.random() * 3);
            
            this.crackGraphics.moveTo(currX, currY);
            
            const pointsX = [currX];
            const pointsY = [currY];

            // Target roughly the center (0,0)
            const targetX = (Math.random() - 0.5) * halfW;
            const targetY = (Math.random() - 0.5) * halfH;

            for (let i = 0; i < steps; i++) {
                // Move towards target with randomness
                currX += (targetX - currX) / (steps - i) + (Math.random() - 0.5) * 15;
                currY += (targetY - currY) / (steps - i) + (Math.random() - 0.5) * 10;
                
                currX = Math.max(-halfW + 2, Math.min(halfW - 2, currX));
                currY = Math.max(-halfH + 2, Math.min(halfH - 2, currY));
                
                this.crackGraphics.lineTo(currX, currY);
                pointsX.push(currX);
                pointsY.push(currY);
            }
            
            this.crackGraphics.strokePath();
            
            // Highlight for depth (glass edge)
            this.crackGraphics.lineStyle(1.5, 0xffffff, 0.6 + Math.random() * 0.4);
            this.crackGraphics.beginPath();
            this.crackGraphics.moveTo(pointsX[0] + 1.5, pointsY[0]);
            for (let i = 1; i < pointsX.length; i++) {
                this.crackGraphics.lineTo(pointsX[i] + 1.5, pointsY[i]);
            }
            this.crackGraphics.strokePath();

            // Sometime split off a sub-crack
            if (Math.random() > 0.5 && pointsX.length > 2) {
                const splitIdx = Math.floor(pointsX.length / 2);
                this.crackGraphics.lineStyle(1.5, 0x000000, 0.6);
                this.crackGraphics.beginPath();
                this.crackGraphics.moveTo(pointsX[splitIdx], pointsY[splitIdx]);
                
                let branchX = pointsX[splitIdx] + (Math.random() > 0.5 ? 15 : -15);
                let branchY = pointsY[splitIdx] + (Math.random() > 0.5 ? 10 : -10);
                
                branchX = Math.max(-halfW + 2, Math.min(halfW - 2, branchX));
                branchY = Math.max(-halfH + 2, Math.min(halfH - 2, branchY));
                
                this.crackGraphics.lineTo(branchX, branchY);
                this.crackGraphics.strokePath();
            }
        }
    }

    override preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        if (this.crackGraphics && this.crackGraphics.visible) {
            this.crackGraphics.setPosition(this.x, this.y);
            this.crackGraphics.setAlpha(this.alpha);
        }
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
        this.crackGraphics.setVisible(active);
    }

    onRelease(): void {
        this.setPosition(0, -100);
        this.setVisible(false);
        this.crackGraphics.clear();
        this.crackGraphics.setVisible(false);
    }

    isPoolActive(): boolean {
        return this.isPooledActive;
    }

    getScene(): Phaser.Scene {
        return this.sceneRef;
    }

    override destroy(fromScene?: boolean): void {
        if (!this.sceneRef) return;
        if (this.crackGraphics) {
            this.crackGraphics.destroy();
        }
        super.destroy(fromScene);
    }
}
