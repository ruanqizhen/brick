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

        // ============================================
        // 1. PARTICLE — Soft gradient circle
        // ============================================
        if (!this.textures.exists('particle')) {
            const pSize = 32;
            graphics.clear();
            // Multi-layer soft circle for smooth falloff
            for (let r = pSize / 2; r > 0; r -= 2) {
                const alpha = (r / (pSize / 2)) * 0.8;
                graphics.fillStyle(0xffffff, alpha);
                graphics.fillCircle(pSize / 2, pSize / 2, r);
            }
            graphics.generateTexture('particle', pSize, pSize);
        }

        // ============================================
        // 2. PADDLE — Crystal glass paddle
        // ============================================
        if (!this.textures.exists('paddle')) {
            const pW = GameConfig.PADDLE_WIDTH;
            const pH = GameConfig.PADDLE_HEIGHT;
            graphics.clear();

            // Outer glow halo (positioned within bounds)
            graphics.fillStyle(0x44aaff, 0.08);
            graphics.fillRoundedRect(0, 0, pW, pH, pH / 2);

            // Glass body — hyper vibrant cyan
            graphics.fillStyle(0x00e5ff, 0.95);
            graphics.fillRoundedRect(2, 1, pW - 4, pH - 2, pH / 2 - 1);

            // Inner glass layer — bright white/cyan
            graphics.fillStyle(0xb3ffff, 0.6);
            graphics.fillRoundedRect(5, 3, pW - 10, pH - 6, (pH - 6) / 2);

            // Top specular reflection — bright white streak
            graphics.fillStyle(0xffffff, 0.45);
            graphics.fillRoundedRect(pW * 0.12, 2, pW * 0.76, pH * 0.3, 4);

            // Secondary mid-reflection
            graphics.fillStyle(0x88ccff, 0.2);
            graphics.fillRoundedRect(pW * 0.2, pH * 0.35, pW * 0.6, pH * 0.25, 3);

            // Crystal edge highlight — top
            graphics.lineStyle(1.5, 0xaaddff, 0.7);
            graphics.beginPath();
            graphics.arc(pH / 2, pH / 2, pH / 2 - 1, Math.PI, Math.PI * 1.5);
            graphics.lineTo(pW - pH / 2, 1);
            graphics.arc(pW - pH / 2, pH / 2, pH / 2 - 1, Math.PI * 1.5, Math.PI * 2);
            graphics.strokePath();

            // Crystal edge — bottom (dimmer)
            graphics.lineStyle(1, 0x6699cc, 0.4);
            graphics.beginPath();
            graphics.arc(pH / 2, pH / 2, pH / 2 - 1, Math.PI * 0.5, Math.PI);
            graphics.strokePath();
            graphics.beginPath();
            graphics.arc(pW - pH / 2, pH / 2, pH / 2 - 1, 0, Math.PI * 0.5);
            graphics.strokePath();
            graphics.beginPath();
            graphics.moveTo(pH / 2, pH - 1);
            graphics.lineTo(pW - pH / 2, pH - 1);
            graphics.strokePath();

            // Sparkle dots
            graphics.fillStyle(0xffffff, 0.6);
            graphics.fillCircle(pW * 0.2, pH * 0.3, 1.5);
            graphics.fillCircle(pW * 0.8, pH * 0.3, 1.5);
            graphics.fillCircle(pW * 0.5, pH * 0.25, 1);

            graphics.generateTexture('paddle', pW, pH);
        }

        // ============================================
        // 3. BALL — Crystal energy sphere (high-res)
        // ============================================
        if (!this.textures.exists('ball')) {
            const radius = 128;
            const size = radius * 2;
            graphics.clear();

            // Main glass body
            graphics.fillStyle(0xbbff44, 0.95);
            graphics.fillCircle(radius, radius, radius);

            // Inner light core
            graphics.fillStyle(0xeeffaa, 0.8);
            graphics.fillCircle(radius, radius, radius * 0.75);

            // Bright center
            graphics.fillStyle(0xffffff, 0.9);
            graphics.fillCircle(radius, radius, radius * 0.4);

            // Specular highlight (top-left crescent)
            graphics.fillStyle(0xffffff, 0.8);
            graphics.fillEllipse(radius * 0.6, radius * 0.55, radius * 0.5, radius * 0.35);

            // Secondary caustic reflection (bottom-right)
            graphics.fillStyle(0xffffff, 0.35);
            graphics.fillEllipse(radius * 1.3, radius * 1.35, radius * 0.3, radius * 0.2);

            // Glass rim highlight
            graphics.lineStyle(6, 0xffffff, 0.4);
            graphics.strokeCircle(radius, radius, radius - 3);

            graphics.generateTexture('ball', size, size);
        }

        // ============================================
        // 4. BRICK — Crystal glass brick
        // ============================================
        if (!this.textures.exists('brick')) {
            const bW = 100;
            const bH = 36;
            
            // Helper to generate a brick variant
            const drawBrick = (textureKey: string, noiseFactor: number, crackLevel: number) => {
                graphics.clear();

                // 1. Base vibrant block
                graphics.fillStyle(0xffffff, 0.95); // White base, will be tinted
                graphics.fillRect(0, 0, bW, bH);

                // 2. Bevels (3D edge effect)
                // Top bevel (bright)
                graphics.fillStyle(0xffffff, 0.4);
                graphics.beginPath();
                graphics.moveTo(0, 0);
                graphics.lineTo(bW, 0);
                graphics.lineTo(bW - 4, 4);
                graphics.lineTo(4, 4);
                graphics.closePath();
                graphics.fillPath();

                // Left bevel (bright)
                graphics.fillStyle(0xffffff, 0.25);
                graphics.beginPath();
                graphics.moveTo(0, 0);
                graphics.lineTo(4, 4);
                graphics.lineTo(4, bH - 4);
                graphics.lineTo(0, bH);
                graphics.closePath();
                graphics.fillPath();

                // Bottom bevel (dark)
                graphics.fillStyle(0x000000, 0.3);
                graphics.beginPath();
                graphics.moveTo(0, bH);
                graphics.lineTo(4, bH - 4);
                graphics.lineTo(bW - 4, bH - 4);
                graphics.lineTo(bW, bH);
                graphics.closePath();
                graphics.fillPath();

                // Right bevel (dark)
                graphics.fillStyle(0x000000, 0.2);
                graphics.beginPath();
                graphics.moveTo(bW, 0);
                graphics.lineTo(bW, bH);
                graphics.lineTo(bW - 4, bH - 4);
                graphics.lineTo(bW - 4, 4);
                graphics.closePath();
                graphics.fillPath();

                // 3. Procedural Grit / Noise (Highly randomized)
                graphics.fillStyle(0x000000, 0.15 + (Math.random() * 0.15)); // Dark grit
                const dotCount = 50 + (noiseFactor * 60) + (Math.random() * 40);
                for (let i = 0; i < dotCount; i++) {
                    const dx = 5 + Math.random() * (bW - 10);
                    const dy = 5 + Math.random() * (bH - 10);
                    const size = 1 + Math.random() * 2.5; // Bigger random particles
                    graphics.fillRect(dx, dy, size, size);
                }
                
                // Add some light grit for contrast
                graphics.fillStyle(0xffffff, 0.1 + (Math.random() * 0.2));
                for (let i = 0; i < dotCount / 2; i++) {
                    const dx = 5 + Math.random() * (bW - 10);
                    const dy = 5 + Math.random() * (bH - 10);
                    graphics.fillRect(dx, dy, 1, 1 + Math.random());
                }

                // 4. Cracks (based on damage level - highly randomized per variant parameter)
                // Let's use the noiseFactor (seed simulation) to decide the crack aesthetic
                if (crackLevel > 0) {
                    graphics.lineStyle(2 + Math.random() * 1.5, 0x000000, 0.7 + Math.random() * 0.3); // Randomly thick dark crack line
                    graphics.beginPath();
                    
                    // Generate random points for the crack
                    const startX = bW * (0.1 + Math.random() * 0.8);
                    const startY = Math.random() < 0.5 ? 0 : bH;
                    let currX = startX;
                    let currY = startY;
                    const steps = 3 + Math.floor(Math.random() * 3);
                    
                    graphics.moveTo(currX, currY);
                    
                    const pointsX = [currX];
                    const pointsY = [currY];

                    for (let i = 0; i < steps; i++) {
                        currX += (Math.random() - 0.5) * (bW * 0.4);
                        currY += (startY === 0 ? 1 : -1) * (bH / steps);
                        
                        // Keep within bounds
                        currX = Math.max(2, Math.min(bW - 2, currX));
                        currY = Math.max(2, Math.min(bH - 2, currY));
                        
                        graphics.lineTo(currX, currY);
                        pointsX.push(currX);
                        pointsY.push(currY);
                    }
                    
                    if (crackLevel === 2) {
                        // Heavy crack: Add a secondary branch or chip
                        graphics.moveTo(pointsX[1], pointsY[1]);
                        graphics.lineTo(pointsX[1] + (Math.random() > 0.5 ? 20 : -20), pointsY[1] + (Math.random() > 0.5 ? 15 : -15));
                        
                        // Edge chip
                        graphics.moveTo(0, bH * Math.random());
                        graphics.lineTo(bW * 0.15, bH * Math.random());
                        graphics.lineTo(0, bH * Math.random());
                    }
                    graphics.strokePath();
                    
                    // Highlight (Depth)
                    graphics.lineStyle(1.5, 0xffffff, 0.6 + Math.random() * 0.4);
                    graphics.beginPath();
                    graphics.moveTo(pointsX[0] + 1.5, pointsY[0]);
                    for (let i = 1; i < pointsX.length; i++) {
                        graphics.lineTo(pointsX[i] + 1.5, pointsY[i]);
                    }
                    graphics.strokePath();
                }

                graphics.generateTexture(textureKey, bW, bH);
            };

            // Generate 5 completely distinct pristine variants
            drawBrick('brick_var_0', 0.5, 0);
            drawBrick('brick_var_1', 1.0, 0);
            drawBrick('brick_var_2', 1.5, 0);
            drawBrick('brick_var_3', 2.0, 0);
            drawBrick('brick_var_4', 2.5, 0);
            drawBrick('brick', 1.0, 0); // fallback

            // Generate 5 light crack variants
            drawBrick('brick_cr_1_var_0', 0.5, 1);
            drawBrick('brick_cr_1_var_1', 1.0, 1);
            drawBrick('brick_cr_1_var_2', 1.5, 1);
            drawBrick('brick_cr_1_var_3', 2.0, 1);
            drawBrick('brick_cr_1_var_4', 2.5, 1);
            drawBrick('brick_cracked_1', 1.0, 1); // fallback

            // Generate 5 heavy crack variants
            drawBrick('brick_cr_2_var_0', 0.5, 2);
            drawBrick('brick_cr_2_var_1', 1.0, 2);
            drawBrick('brick_cr_2_var_2', 1.5, 2);
            drawBrick('brick_cr_2_var_3', 2.0, 2);
            drawBrick('brick_cr_2_var_4', 2.5, 2);
            drawBrick('brick_cracked_2', 1.0, 2); // fallback
        }

        // ============================================
        // 5. METAL BRICK — Frosted crystal titanium
        // ============================================
        if (!this.textures.exists('brick_metal')) {
            const bW = 100;
            const bH = 36;
            graphics.clear();

            // Frosted glass base
            graphics.fillStyle(0x99aabb, 0.9);
            graphics.fillRoundedRect(0, 0, bW, bH, 7);

            // Inner frosted layer
            graphics.fillStyle(0xbbccdd, 0.4);
            graphics.fillRoundedRect(3, 3, bW - 6, bH - 6, 5);

            // Top specular band
            graphics.fillStyle(0xffffff, 0.4);
            graphics.fillRoundedRect(5, 2, bW - 10, bH * 0.3, 4);

            // Diagonal caustic shimmer
            graphics.fillStyle(0xffffff, 0.2);
            graphics.beginPath();
            graphics.moveTo(bW * 0.2, 0);
            graphics.lineTo(bW * 0.5, 0);
            graphics.lineTo(bW * 0.3, bH);
            graphics.lineTo(bW * 0.0, bH);
            graphics.closePath();
            graphics.fillPath();

            // Crystal outline
            graphics.lineStyle(2, 0xddeeff, 0.6);
            graphics.strokeRoundedRect(1, 1, bW - 2, bH - 2, 6);

            // Diamond sparkle dots
            graphics.fillStyle(0xffffff, 0.65);
            graphics.fillCircle(12, bH / 2, 2);
            graphics.fillCircle(bW - 12, bH / 2, 2);
            graphics.fillCircle(bW / 2, 6, 1.5);

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
