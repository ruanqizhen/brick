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

        // 2. Paddle texture
        if (!this.textures.exists('paddle')) {
            graphics.clear();
            graphics.fillStyle(0xffffff);
            graphics.fillRoundedRect(0, 0, GameConfig.PADDLE_WIDTH, GameConfig.PADDLE_HEIGHT, 10);
            graphics.generateTexture('paddle', GameConfig.PADDLE_WIDTH, GameConfig.PADDLE_HEIGHT);
        }

        // 3. Ball texture
        if (!this.textures.exists('ball')) {
            graphics.clear();
            graphics.fillStyle(0xffffff);
            graphics.fillCircle(GameConfig.BALL_RADIUS, GameConfig.BALL_RADIUS, GameConfig.BALL_RADIUS);
            graphics.generateTexture('ball', GameConfig.BALL_RADIUS * 2, GameConfig.BALL_RADIUS * 2);
        }

        // 4. Brick texture
        if (!this.textures.exists('brick')) {
            graphics.clear();
            graphics.fillStyle(0xffffff);
            graphics.fillRect(0, 0, 80, 30);
            graphics.generateTexture('brick', 80, 30);
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
        // Unlock audio on first interaction
        this.input.once('pointerdown', () => {
            audioManager.unlock();
        });

        // Brief delay before transitioning
        this.time.delayedCall(200, () => {
            this.scene.start('MenuScene');
        });
    }
}
