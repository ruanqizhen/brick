import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';
import { saveManager } from '../storage/SaveManager';

export class MenuScene extends Phaser.Scene {
    private highScoreText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;
    private startBtn!: Phaser.GameObjects.Container;
    private instructions!: Phaser.GameObjects.Text;
    private homepageLink!: Phaser.GameObjects.Text;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private bgGradient!: Phaser.GameObjects.Rectangle;
    private bgOverlay!: Phaser.GameObjects.Rectangle;

    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Unlock audio on first interaction
        this.input.once('pointerdown', () => {
            audioManager.unlock();
        });

        // ============================================
        // BACKGROUND — Deep space with animated color shift
        // ============================================
        this.bgGradient = this.add.rectangle(0, 0, width, height, 0x050510);
        this.bgGradient.setOrigin(0);

        // Subtle colored overlay that shifts hue
        this.bgOverlay = this.add.rectangle(0, 0, width, height, 0x1a0030, 0.3);
        this.bgOverlay.setOrigin(0);

        // Animated overlay color cycling
        this.tweens.add({
            targets: this.bgOverlay,
            alpha: { from: 0.15, to: 0.35 },
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Floating neon particles (multi-color)
        this.particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 6000,
            speed: { min: 8, max: 25 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            quantity: 2,
            frequency: 80,
            tint: [0x00ffff, 0xff00ff, 0x8844ff, 0x00ff88]
        });

        // ============================================
        // TITLE — Glowing animated title
        // ============================================
        this.titleText = this.add.text(width / 2, height * 0.2, '弹力砖块', {
            fontSize: '96px',
            fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#8844ff',
            strokeThickness: 8,
            shadow: {
                blur: 30,
                color: '#aa55ff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        // Title glow pulse
        this.tweens.add({
            targets: this.titleText,
            scaleX: { from: 1, to: 1.03 },
            scaleY: { from: 1, to: 1.03 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle with letter spacing
        this.subtitleText = this.add.text(width / 2, height * 0.275, 'B R E A K O U T', {
            fontSize: '24px',
            fontFamily: '"Courier New", monospace',
            color: '#00ffff',
            shadow: {
                blur: 10,
                color: '#00ffff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        // High score — golden glow
        this.highScoreText = this.add.text(width / 2, height * 0.36, '🏆 最高分：0', {
            fontSize: '28px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffd700',
            fontStyle: 'bold',
            shadow: {
                blur: 12,
                color: '#ffaa00',
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

        // ============================================
        // BUTTON — Pill-shaped gradient button
        // ============================================
        this.startBtn = this.createPillButton(width / 2, height * 0.5, '开始游戏', 0x8844ff, 0x00ccff, () => {
            this.startBtn.setAlpha(0.8);
            audioManager.play('launch');
            this.time.delayedCall(100, () => {
                this.scene.start('GameScene');
            });
        });

        // Instructions
        this.instructions = this.add.text(width / 2, height * 0.72,
            '鼠标 / 触摸移动 • 点击发射\nESC / P 暂停游戏', {
            fontSize: '22px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#667799',
            align: 'center',
            lineSpacing: 12
        }).setOrigin(0.5);

        // Homepage link
        this.homepageLink = this.add.text(width / 2, height * 0.85, '🌐 访问我的个人主页', {
            fontSize: '20px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#6688aa'
        }).setOrigin(0.5);

        this.homepageLink.setInteractive({ useHandCursor: true });
        this.homepageLink.on('pointerover', () => {
            this.homepageLink.setColor('#00ffff');
            this.homepageLink.setShadow(0, 0, '#00ffff', 10, true, true);
        });
        this.homepageLink.on('pointerout', () => {
            this.homepageLink.setColor('#6688aa');
            this.homepageLink.setShadow(0, 0, '#000000', 0);
        });
        this.homepageLink.on('pointerdown', () => {
            window.open('https://qizhen.xyz/', '_blank');
        });

        // Listen for resize
        this.scale.on('resize', this.handleResize, this);
    }

    private createPillButton(x: number, y: number, text: string, color1: number, color2: number, onClick: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 320;
        const btnHeight = 72;
        const radius = btnHeight / 2;

        // Main pill background
        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color1);
        bg.setOrigin(0.5);

        // Create the pill shape mask effect with rounded corners
        // Since Phaser rectangles can't have rounded corners easily, we layer
        const leftCap = this.add.circle(-btnWidth / 2 + radius, 0, radius, color1);
        const rightCap = this.add.circle(btnWidth / 2 - radius, 0, radius, color2);

        // Inner highlight (top half lighter)
        const highlight = this.add.rectangle(0, -btnHeight * 0.15, btnWidth - 20, btnHeight * 0.35, 0xffffff, 0.12);
        highlight.setOrigin(0.5);

        // Glowing border line
        const borderGlow = this.add.rectangle(0, 0, btnWidth + 4, btnHeight + 4, 0x00000, 0);
        borderGlow.setOrigin(0.5);
        borderGlow.setStrokeStyle(2, 0xffffff, 0.3);

        // Button text
        const btnText = this.add.text(0, 0, text, {
            fontSize: '36px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: {
                blur: 10,
                color: '#000000',
                fill: true,
                offsetX: 0,
                offsetY: 2
            }
        }).setOrigin(0.5);

        container.add([leftCap, bg, rightCap, highlight, borderGlow, btnText]);
        container.setSize(btnWidth + radius * 2, btnHeight);
        container.setDepth(100);

        // Make all main shapes interactive
        bg.setInteractive({ useHandCursor: true });
        leftCap.setInteractive({ useHandCursor: true });
        rightCap.setInteractive({ useHandCursor: true });

        const hoverIn = () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.06,
                scaleY: 1.06,
                duration: 200,
                ease: 'Back.out'
            });
            borderGlow.setStrokeStyle(3, 0x00ffff, 0.8);
        };

        const hoverOut = () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Back.out'
            });
            borderGlow.setStrokeStyle(2, 0xffffff, 0.3);
        };

        const pointerDown = () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.97,
                scaleY: 0.97,
                duration: 100
            });
        };

        [bg, leftCap, rightCap].forEach(shape => {
            shape.on('pointerover', hoverIn);
            shape.on('pointerout', hoverOut);
            shape.on('pointerdown', pointerDown);
            shape.on('pointerup', onClick);
        });

        return container;
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        this.bgGradient.setSize(width, height);
        this.bgOverlay.setSize(width, height);
        this.titleText.setPosition(width / 2, height * 0.2);
        this.subtitleText.setPosition(width / 2, height * 0.275);
        this.highScoreText.setPosition(width / 2, height * 0.36);
        this.startBtn.setPosition(width / 2, height * 0.5);
        this.instructions.setPosition(width / 2, height * 0.72);
        this.homepageLink.setPosition(width / 2, height * 0.85);
    }

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
