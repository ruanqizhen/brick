import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';
import { saveManager } from '../storage/SaveManager';

export class MenuScene extends Phaser.Scene {
    private highScoreText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private startBtn!: Phaser.GameObjects.Container;
    private instructions!: Phaser.GameObjects.Text;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Unlock audio on first interaction in this scene
        this.input.once('pointerdown', () => {
            audioManager.unlock();
        });

        // Create animated background gradient
        this.createBackground(width, height);

        // Create title with gradient and glow effect
        this.titleText = this.add.text(width / 2, height * 0.22, '弹力砖块', {
            fontSize: '88px',
            fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#00d4ff',
            strokeThickness: 12,
            shadow: {
                blur: 20,
                color: '#00d4ff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        // Add subtitle
        const subtitle = this.add.text(width / 2, height * 0.29, 'BREAKOUT', {
            fontSize: '28px',
            fontFamily: '"Arial", sans-serif',
            color: '#88ccff',
            letterSpacing: 15
        }).setOrigin(0.5);

        // High score display with modern style - load async but don't block
        this.highScoreText = this.add.text(width / 2, height * 0.36, '🏆 最高分：0', {
            fontSize: '28px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffd700',
            fontStyle: 'bold',
            shadow: {
                blur: 10,
                color: '#ffd700',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        saveManager.getHighScore().then(highScore => {
            if (this.highScoreText.active) {
                this.highScoreText.setText(`🏆 最高分：${highScore.toLocaleString()}`);
            }
        });

        // Start button with modern gradient effect
        this.startBtn = this.createModernButton(width / 2, height * 0.5, '开始游戏', 0x00d4ff, 0x0099cc, () => {
            // Immediate feedback: disable and slightly dim
            this.startBtn.setAlpha(0.8);

            // Play launch sound
            audioManager.play('launch');

            // Transition to game
            this.time.delayedCall(100, () => {
                this.scene.start('GameScene');
            });
        });

        // Instructions with modern styling
        this.instructions = this.add.text(width / 2, height * 0.75,
            '鼠标 / 触摸移动 • 点击发射\nESC / P 暂停游戏', {
            fontSize: '22px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#6688aa',
            align: 'center',
            lineSpacing: 12
        }).setOrigin(0.5);

        // Listen for resize
        this.scale.on('resize', this.handleResize, this);
    }

    private createBackground(width: number, height: number): void {
        // Dark gradient background
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a1a);
        bg.setOrigin(0);

        // Add grid pattern overlay
        const grid = this.add.grid(
            width / 2, height / 2,
            width, height,
            50, 50,
            0x1a1a3e, 0.3,
            0x0a0a1a, 0
        );

        // Create floating particles
        this.particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 5000,
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            quantity: 2,
            frequency: 100
        });
    }

    private createModernButton(x: number, y: number, text: string, color1: number, color2: number, onClick: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 280;
        const btnHeight = 70;

        // Gradient background using multiple rectangles
        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color1);
        bg.setOrigin(0.5);
        bg.setStrokeStyle(3, 0xffffff, 0.8);

        // Inner highlight
        const highlight = this.add.rectangle(-btnWidth / 2 + 10, -btnHeight / 2 + 10, btnWidth - 20, btnHeight / 2 - 10, 0xffffff, 0.15);
        highlight.setOrigin(0);

        // Button text with shadow
        const btnText = this.add.text(0, 0, text, {
            fontSize: '36px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: {
                blur: 8,
                color: '#000000',
                fill: true,
                offsetX: 2,
                offsetY: 2
            }
        }).setOrigin(0.5);

        container.add([bg, highlight, btnText]);
        container.setSize(btnWidth, btnHeight);
        container.setDepth(100);

        // Set interaction on the background instead of the container for better stability
        bg.setInteractive({ useHandCursor: true });

        // Hover effects targeting the container for visual consistency
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Back.out'
            });
            bg.setFillStyle(0x00e0ff); // Modern cyan hover
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Back.out'
            });
            bg.setFillStyle(color1);
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.98,
                scaleY: 0.98,
                duration: 100
            });
        });

        bg.on('pointerup', () => {
            onClick();
        });

        return container;
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        this.titleText.setPosition(width / 2, height * 0.22);
        this.highScoreText.setPosition(width / 2, height * 0.36);
        this.startBtn.setPosition(width / 2, height * 0.5);
        this.instructions.setPosition(width / 2, height * 0.75);
    }

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
