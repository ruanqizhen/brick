import Phaser from 'phaser';
import { BrickType } from '../config/LevelData';
import { GameConfig } from '../config/GameConfig';
import { CrackRenderer, CrackSegment } from '../systems/CrackRenderer';

// Auto-incrementing unique ID for each brick instance
let nextBrickId = 0;

export class Brick extends Phaser.Physics.Matter.Image {
    public brickType: BrickType;
    private _hp: number;
    private maxHp: number;
    private isPooledActive: boolean = false;
    private sceneRef: Phaser.Scene;
    private baseTextureKey: string;
    private shadeVal: number;
    private damageVariantSeed: number;
    private crackRenderer: CrackRenderer | null = null;
    private crackSegments: CrackSegment[] = [];
    private _uniqueId: number;

    /** Unique key for the batched crack renderer */
    private get crackKey(): string {
        return String(this._uniqueId);
    }

    constructor(scene: Phaser.Scene, x: number, y: number, type: BrickType) {
        super(scene.matter.world, x, y, 'brick', undefined, {
            isStatic: true,
            label: 'brick',
            friction: 0,
            frictionStatic: 0,
            frictionAir: 0,
            restitution: 1,
            isSensor: false,
            chamfer: { radius: 5 }
        });
        this.sceneRef = scene;

        // Assign a unique ID for crack renderer keying
        this._uniqueId = nextBrickId++;

        // Initialize with default values. reset() will override these.
        this.brickType = type;
        this._hp = 1;
        this.maxHp = 1;
        this.baseTextureKey = 'brick';
        this.shadeVal = 1;
        this.damageVariantSeed = 0;
        this.crackSegments = [];

        scene.add.existing(this);

        // Call reset to setup the actual properties
        this.reset(x, y, type);
        this.setPoolActive(false);
    }

    hit(instant: boolean = false, force: boolean = false): { destroyed: boolean, points: number } {
        if (this.brickType === '8' && !force) {
            return { destroyed: false, points: 0 };
        }

        if (instant || force) {
            this._hp = 0;
        } else {
            this._hp--;
        }

        if (this._hp <= 0) {
            this.setVisible(false);
            if (this.crackRenderer) this.crackRenderer.removeBrick(this.crackKey);
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
            this.generateCracks(2);
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
        this.crackSegments = [];

        this.setPosition(x, y);
        this.setPoolActive(true);

        // Reset specific behavioral effects
        this.sceneRef.tweens.killTweensOf(this);
        this.setAlpha(this.brickType === '5' ? 0 : 1);

        if (this.crackRenderer) this.crackRenderer.removeBrick(this.crackKey);

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
                    if (this.crackRenderer && this.crackSegments.length > 0) {
                        this.crackRenderer.markDirty(this.crackKey);
                    }
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

    /**
     * Generate crack line data in local brick space and register with the batch renderer.
     */
    private generateCracks(count: number) {
        if (!this.crackRenderer) return;

        const bW = this.displayWidth;
        const bH = this.displayHeight;
        const halfW = bW / 2;
        const halfH = bH / 2;

        this.crackSegments = [];

        for (let j = 0; j < count; j++) {
            let startX: number, startY: number;
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

            const points: { x: number; y: number }[] = [{ x: currX, y: currY }];

            const targetX = (Math.random() - 0.5) * halfW;
            const targetY = (Math.random() - 0.5) * halfH;

            for (let i = 0; i < steps; i++) {
                currX += (targetX - currX) / (steps - i) + (Math.random() - 0.5) * 15;
                currY += (targetY - currY) / (steps - i) + (Math.random() - 0.5) * 10;

                currX = Math.max(-halfW + 2, Math.min(halfW - 2, currX));
                currY = Math.max(-halfH + 2, Math.min(halfH - 2, currY));

                points.push({ x: currX, y: currY });
            }

            // Main dark crack line
            this.crackSegments.push({
                points,
                color: 0x000000,
                alpha: 0.7 + Math.random() * 0.3,
                lineWidth: 2 + Math.random() * 1.5
            });

            // White highlight offset
            const highlightPoints = points.map(p => ({ x: p.x + 1.5, y: p.y }));
            this.crackSegments.push({
                points: highlightPoints,
                color: 0xffffff,
                alpha: 0.6 + Math.random() * 0.4,
                lineWidth: 1.5
            });

            // Optional branch
            if (Math.random() > 0.5 && points.length > 2) {
                const splitIdx = Math.floor(points.length / 2);
                const branchPoints: { x: number; y: number }[] = [
                    { x: points[splitIdx].x, y: points[splitIdx].y }
                ];

                let branchX = points[splitIdx].x + (Math.random() > 0.5 ? 15 : -15);
                let branchY = points[splitIdx].y + (Math.random() > 0.5 ? 10 : -10);

                branchX = Math.max(-halfW + 2, Math.min(halfW - 2, branchX));
                branchY = Math.max(-halfH + 2, Math.min(halfH - 2, branchY));

                branchPoints.push({ x: branchX, y: branchY });

                this.crackSegments.push({
                    points: branchPoints,
                    color: 0x000000,
                    alpha: 0.6,
                    lineWidth: 1.5
                });
            }
        }

        // Register with the batch renderer
        this.crackRenderer.setCracks(this.crackKey, this.crackSegments);
        this.crackRenderer.registerBrick(this.crackKey, this);
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
        if (this.crackRenderer) {
            if (!active) {
                this.crackRenderer.removeBrick(this.crackKey);
            }
        }
        if (this.body) {
            (this.body as MatterJS.BodyType).isSensor = !active;
        }
    }

    onRelease(): void {
        this.setPosition(0, -100);
        if (this.crackRenderer) this.crackRenderer.removeBrick(this.crackKey);
        this.crackSegments = [];
    }

    isPoolActive(): boolean {
        return this.isPooledActive;
    }

    getScene(): Phaser.Scene {
        return this.sceneRef;
    }

    setCrackRenderer(renderer: CrackRenderer | null): void {
        this.crackRenderer = renderer;
    }

    override destroy(fromScene?: boolean): void {
        if (!this.sceneRef) return;
        if (this.crackRenderer) {
            this.crackRenderer.removeBrick(this.crackKey);
        }
        super.destroy(fromScene);
    }
}
