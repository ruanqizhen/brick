import { DESIGN_WIDTH, DESIGN_HEIGHT, GameConfig } from '../config/GameConfig';
import { saveManager } from '../storage/SaveManager';
import { audioManager } from '../audio/AudioManager';
import Phaser from 'phaser'; // Re-add Phaser for type safety if needed, though usually standard

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create all procedural textures once
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // 1. Particle texture
        if (!this.textures.exists('particle')) {
            graphics.clear();
            graphics.fillStyle(0xffffff, 1);
            graphics.fillCircle(8, 8, 8);
            graphics.generateTexture('particle', 16, 16);
        }

        // 2. Paddle texture (Light Wood / Beige with Curved Grain)
        if (!this.textures.exists('paddle')) {
            const pW = GameConfig.PADDLE_WIDTH;
            const pH = GameConfig.PADDLE_HEIGHT;
            graphics.clear();

            // Base wood color (Warm Yellow / Golden Oak)
            graphics.fillStyle(0xFAD55C);
            graphics.fillRoundedRect(0, 0, pW, pH, 8);

            // Curved Wood Grain Lines
            graphics.lineStyle(1, 0x8B4513, 0.25);
            for (let i = 0; i < 12; i++) {
                const y = Phaser.Math.Between(4, pH - 4);
                graphics.beginPath();
                graphics.moveTo(2, y);

                // Increased waviness for "curved" look
                for (let x = 20; x < pW; x += 30) {
                    const wave = Phaser.Math.Between(-3, 3);
                    graphics.lineTo(x, y + wave);
                }
                graphics.lineTo(pW - 2, y);
                graphics.strokePath();
            }

            // Subtle Knots
            graphics.fillStyle(0x8B4513, 0.1);
            for (let i = 0; i < 2; i++) {
                const kX = Phaser.Math.Between(pW * 0.1, pW * 0.9);
                const kY = Phaser.Math.Between(pH * 0.2, pH * 0.8);
                graphics.fillEllipse(kX, kY, 12, 5);
            }

            // High-quality Bevel/Highlights for light theme
            // Top highlight
            graphics.lineStyle(2, 0xFFFFFF, 0.5);
            graphics.strokeLineShape(new Phaser.Geom.Line(5, 1, pW - 5, 1));

            // Bottom shadow (Soft brown)
            graphics.lineStyle(2, 0xA0522D, 0.3);
            graphics.strokeLineShape(new Phaser.Geom.Line(5, pH - 1, pW - 5, pH - 1));

            graphics.generateTexture('paddle', pW, pH);
        }

        // 3. Ball texture (Tennis Ball - High Res for scaling)
        if (!this.textures.exists('ball')) {
            const radius = 128; // Higher res base (256x256)
            const size = radius * 2;
            graphics.clear();

            // Base shadow (subtle)
            graphics.fillStyle(0x000000, 0.2);
            graphics.fillCircle(radius + 4, radius + 4, radius);

            // Fluorescent Yellow Base
            graphics.fillStyle(0xCCFF00);
            graphics.fillCircle(radius, radius, radius);

            // Tennis Ball Seams (White S-curves)
            graphics.lineStyle(12, 0xFFFFFF, 0.8); // Thicker lines for high res

            // Top-left curve
            graphics.beginPath();
            graphics.arc(0, 0, radius * 1.1, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(90), false);
            graphics.strokePath();

            // Bottom-right curve
            graphics.beginPath();
            graphics.arc(size, size, radius * 1.1, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(270), false);
            graphics.strokePath();

            // Highlight (Volume)
            graphics.fillStyle(0xFFFFFF, 0.3);
            graphics.fillCircle(radius * 0.6, radius * 0.6, radius * 0.3);

            graphics.generateTexture('ball', size, size);
        }

        // 4. Standard Brick texture (with bevel for texture)
        if (!this.textures.exists('brick')) {
            const bW = 80;
            const bH = 30;
            graphics.clear();

            // Base fill
            graphics.fillStyle(0xffffff);
            graphics.fillRect(0, 0, bW, bH);

            // Bevel - lighter top and left
            graphics.lineStyle(2, 0xffffff, 0.5);
            graphics.strokeLineShape(new Phaser.Geom.Line(1, 1, bW - 1, 1));
            graphics.strokeLineShape(new Phaser.Geom.Line(1, 1, 1, bH - 1));

            // Bevel - darker bottom and right
            graphics.lineStyle(2, 0x000000, 0.3);
            graphics.strokeLineShape(new Phaser.Geom.Line(1, bH - 1, bW - 1, bH - 1));
            graphics.strokeLineShape(new Phaser.Geom.Line(bW - 1, 1, bW - 1, bH - 1));

            // Inner texture pattern (subtle pinstripes)
            graphics.lineStyle(1, 0xffffff, 0.1);
            for (let i = 5; i < bW; i += 10) {
                graphics.strokeLineShape(new Phaser.Geom.Line(i, 3, i, bH - 3));
            }

            graphics.generateTexture('brick', bW, bH);
        }

        // 5. Metal Brick texture (Stainless Steel look)
        if (!this.textures.exists('brick_metal')) {
            const bW = 80;
            const bH = 30;
            graphics.clear();

            // Metallic gradient base (simulated)
            graphics.fillStyle(0xdddddd);
            graphics.fillRect(0, 0, bW, bH);

            // Brushed metal lines (horizontal)
            graphics.lineStyle(1, 0x999999, 0.4);
            for (let i = 2; i < bH; i += 2) {
                const offset = (i % 4 === 0) ? 0 : 5;
                graphics.strokeLineShape(new Phaser.Geom.Line(offset, i, bW - offset, i));
            }

            // Diagonal shine/highlight
            graphics.fillStyle(0xffffff, 0.3);
            graphics.beginPath();
            graphics.moveTo(bW * 0.2, 0);
            graphics.lineTo(bW * 0.5, 0);
            graphics.lineTo(bW * 0.3, bH);
            graphics.lineTo(0, bH);
            graphics.fillPath();

            // Sharp bevel
            graphics.lineStyle(2, 0xffffff, 0.8);
            graphics.strokeRect(0, 0, bW, bH);
            graphics.lineStyle(1, 0x444444, 1);
            graphics.strokeLineShape(new Phaser.Geom.Line(0, bH, bW, bH));
            graphics.strokeLineShape(new Phaser.Geom.Line(bW, 0, bW, bH));

            graphics.generateTexture('brick_metal', bW, bH);
        }

        graphics.destroy();

        // Initialize SaveManager early
        saveManager.init();

        // Create animated gradient background
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a1a);
        bg.setOrigin(0);

        // Create loading text with modern style
        const loadingText = this.add.text(width / 2, height * 0.45, '正在加载', {
            fontSize: '36px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#00d4ff',
            fontStyle: 'bold',
            shadow: {
                blur: 15,
                color: '#00d4ff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        // Loading bar background
        const barBg = this.add.rectangle(width / 2, height * 0.52, 400, 12, 0x1a1a3e);
        barBg.setOrigin(0.5);
        barBg.setStrokeStyle(2, 0x00d4ff, 0.5);

        // Loading bar fill
        const barFill = this.add.rectangle(width / 2 - 195, height * 0.52, 0, 8, 0x00d4ff);
        barFill.setOrigin(0, 0.5);

        // Loading percentage
        const percentText = this.add.text(width / 2, height * 0.58, '0%', {
            fontSize: '24px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#88aaff'
        }).setOrigin(0.5);

        // Particle effect
        const particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 3000,
            speed: { min: 20, max: 50 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            quantity: 2,
            frequency: 100,
            tint: [0x00d4ff, 0x0099ff]
        });

        this.load.on('progress', (value: number) => {
            const percent = Math.floor(value * 100);
            barFill.width = 390 * value;
            percentText.setText(`${percent}%`);
        });

        this.load.on('complete', () => {
            // Fade out effect
            this.tweens.add({
                targets: [bg, loadingText, barBg, barFill, percentText],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    particles.destroy();
                }
            });
        });
    }

    create() {
        // Brief delay before transitioning to allow fade outs and data prep
        this.time.delayedCall(200, () => {
            this.scene.start('MenuScene');
        });
    }
}
