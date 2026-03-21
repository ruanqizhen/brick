import Phaser from 'phaser';
import { BrickType } from '../config/LevelData';
import { GameConfig } from '../config/GameConfig';

export class Brick extends Phaser.Physics.Matter.Image {
    public brickType: BrickType;
    private _hp: number;
    private maxHp: number;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;
    private baseTextureKey: string;
    private shadeVal: number;
    private damageVariantSeed: number;
    private crackGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, type: BrickType) {
        super(scene.matter.world, x, y, 'brick', undefined, {
            isStatic: true,
            label: 'brick',
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0,
            restitution: 1,
            isSensor: false,
            chamfer: { radius: 2 }
        });
        this.sceneRef = scene;

        // Initialize with default values. reset() will override these.
        this.brickType = type;
        this._hp = 1;
        this.maxHp = 1;
        this.baseTextureKey = 'brick';
        this.shadeVal = 1;
        this.damageVariantSeed = 0;

        scene.add.existing(this);

        // Graphics for rendering dynamic cracks over the brick
        this.crackGraphics = scene.add.graphics();
        this.crackGraphics.setDepth(this.depth + 0.1);

        // Call reset to setup the actual properties
        this.reset(x, y, type);
        this.setPoolActive(false);
    }

    hit(instant: boolean = false): { destroyed: boolean, points: number } {
        if (this.brickType === '8') {
            return { destroyed: false, points: 0 };
        }

        if (instant) {
            this._hp = 0;
        } else {
            this._hp--;
        }

        if (this._hp <= 0) {
            this.setVisible(false);
            this.crackGraphics.setVisible(false);
            return { destroyed: true, points: 100 };
        }

        if (this.brickType === '5' && this.alpha === 0) {
            this.sceneRef.tweens.add({
                targets: this,
                alpha: 1,
                duration: 250,
                ease: 'Power2'
            });
        }

        this.updateAppearance();
        if (!this.isIndestructible) {
            this.drawRandomCracks(2);
        }

        return { destroyed: false, points: 50 };
    }

    reset(x: number, y: number, type: BrickType): void {
        this.brickType = type;

        if (this.brickType === '1' && Math.random() < 0.15) {
            this.brickType = '2';
        }

        if (this.brickType === '8') {
            this._hp = Infinity;
        } else if (this.brickType === '5') {
            this._hp = 2;
        } else if (this.brickType === '3') {
            this._hp = 3;
        } else if (this.brickType === '2') {
            this._hp = 2;
        } else {
            this._hp = 1;
        }
        this.maxHp = this._hp;

        this.shadeVal = Phaser.Math.Between(85, 100) / 100;
        const varIndex = Math.floor(Math.random() * 5);
        this.baseTextureKey = `brick_var_${varIndex}`;
        this.damageVariantSeed = Math.floor(Math.random() * 5);

        this.setPosition(x, y);
        this.crackGraphics.setPosition(x, y);
        this.crackGraphics.clear();
        this.crackGraphics.setVisible(true);
        this.setPoolActive(true);

        // Reset specific behavioral effects
        this.sceneRef.tweens.killTweensOf(this);
        this.setAlpha(this.brickType === '5' ? 0 : 1);

        if (this.brickType === '6') {
            this.x -= 30;
            this.sceneRef.tweens.add({
                targets: this,
                x: this.x + 60,
                duration: Math.random() * 500 + 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    this.setPosition(this.x, this.y);
                    this.crackGraphics.setPosition(this.x, this.y);
                }
            });
        }

        this.updateAppearance();
    }

    private updateAppearance() {
        let baseColor: number;
        let finalTexture = this.baseTextureKey;

        switch (this.brickType) {
            case '8':
                baseColor = GameConfig.COLORS.BRICK_8;
                finalTexture = 'brick_metal';
                break;
            case '6':
                baseColor = 0xcc00ff;
                break;
            case '5':
                baseColor = 0x33ff99;
                break;
            case '4':
                baseColor = 0xff3300;
                break;
            case '3':
                baseColor = GameConfig.COLORS.BRICK_3;
                break;
            case '2':
                baseColor = GameConfig.COLORS.BRICK_2;
                break;
            default:
                baseColor = GameConfig.COLORS.BRICK_1;
        }

        if (this.brickType !== '8') {
            const damage = this.maxHp - this._hp;
            if (damage === 1 && this.maxHp >= 2) {
                this.damageVariantSeed = Math.floor(Math.random() * 5);
                finalTexture = `brick_cr_1_var_${this.damageVariantSeed}`;
            } else if (damage >= 2) {
                this.damageVariantSeed = Math.floor(Math.random() * 5);
                finalTexture = `brick_cr_2_var_${this.damageVariantSeed}`;
            }
        }

        this.setTexture(finalTexture);

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

            let startX, startY;
            if (Math.random() > 0.5) {
                startX = (Math.random() * bW) - halfW;
                startY = Math.random() > 0.5 ? -halfH : halfH;
            } else {
                startX = Math.random() > 0.5 ? -halfW : halfW;
                startY = (Math.random() * bH) - halfH;
            }

            let currX = startX;
            let currY = startY;
            const steps = 3 + Math.floor(Math.random() * 3);

            this.crackGraphics.moveTo(currX, currY);

            const pointsX = [currX];
            const pointsY = [currY];

            const targetX = (Math.random() - 0.5) * halfW;
            const targetY = (Math.random() - 0.5) * halfH;

            for (let i = 0; i < steps; i++) {
                currX += (targetX - currX) / (steps - i) + (Math.random() - 0.5) * 15;
                currY += (targetY - currY) / (steps - i) + (Math.random() - 0.5) * 10;

                currX = Math.max(-halfW + 2, Math.min(halfW - 2, currX));
                currY = Math.max(-halfH + 2, Math.min(halfH - 2, currY));

                this.crackGraphics.lineTo(currX, currY);
                pointsX.push(currX);
                pointsY.push(currY);
            }

            this.crackGraphics.strokePath();

            this.crackGraphics.lineStyle(1.5, 0xffffff, 0.6 + Math.random() * 0.4);
            this.crackGraphics.beginPath();
            this.crackGraphics.moveTo(pointsX[0] + 1.5, pointsY[0]);
            for (let i = 1; i < pointsX.length; i++) {
                this.crackGraphics.lineTo(pointsX[i] + 1.5, pointsY[i]);
            }
            this.crackGraphics.strokePath();

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

    get isIndestructible(): boolean {
        return this.brickType === '8';
    }

    get hp(): number {
        return this._hp;
    }

    // Pool methods
    setPoolActive(active: boolean): void {
        this.isPooledActive = active;
        this.setVisible(active);
        this.setActive(active);
        this.crackGraphics.setVisible(active);
        if (this.body) {
            (this.body as MatterJS.BodyType).isSensor = !active;
        }
    }

    onRelease(): void {
        this.setPosition(0, -100);
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
