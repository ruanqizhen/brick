import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';
import { saveManager } from '../storage/SaveManager';

interface GameOverData {
    score: number;
    level: number;
}

export class GameOverScene extends Phaser.Scene {
    private score: number = 0;
    private level: number = 1;
    private highScore: number = 0;
    private isNewHighScore: boolean = false;
    private overlay!: Phaser.GameObjects.Rectangle;
    private titleText!: Phaser.GameObjects.Text;
    private newHighScoreText!: Phaser.GameObjects.Text;
    private scoreContainer!: Phaser.GameObjects.Container;
    private restartBtn!: Phaser.GameObjects.Container;
    private menuBtn!: Phaser.GameObjects.Container;
    private hintText!: Phaser.GameObjects.Text;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super('GameOverScene');
    }

    async init(data: GameOverData) {
        this.score = data.score || 0;
        this.level = data.level || 1;

        // Load high score and check if new high score
        this.highScore = await saveManager.getHighScore();
        this.isNewHighScore = this.score > this.highScore;

        // Save high score if beaten
        if (this.isNewHighScore) {
            await saveManager.saveHighScore(this.score);
        }

        // Record game played
        await saveManager.recordGame(false);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Darken background with gradient
        this.overlay = this.add.rectangle(0, 0, width, height, 0x0a0a1a, 0.95);
        this.overlay.setOrigin(0);

        // Create animated background particles
        this.particles = this.add.particles(0, 0, 'ball', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 5000,
            speed: { min: 15, max: 40 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            quantity: 3,
            frequency: 200,
            tint: [0xff4444, 0xff8800, 0xffcc00]
        });

        // Game Over Title with modern gradient glow
        this.titleText = this.add.text(width / 2, height * 0.18, '游戏结束', {
            fontSize: '88px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ff4444',
            fontStyle: 'bold',
            shadow: {
                blur: 25,
                color: '#ff0000',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 0.7, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 600,
            ease: 'Back.out'
        });

        // New High Score indicator with special effects
        if (this.isNewHighScore) {
            this.newHighScoreText = this.add.text(width / 2, height * 0.27, '🏆 新纪录！🏆', {
                fontSize: '48px',
                fontFamily: '"Microsoft YaHei", sans-serif',
                color: '#ffd700',
                fontStyle: 'bold',
                shadow: {
                    blur: 20,
                    color: '#ffd700',
                    fill: true,
                    offsetX: 0,
                    offsetY: 0
                }
            }).setOrigin(0.5);

            // Animate high score text with rotation and scale
            this.tweens.add({
                targets: this.newHighScoreText,
                scaleX: { from: 1, to: 1.15 },
                scaleY: { from: 1, to: 1.15 },
                angle: { from: -3, to: 3 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Add sparkle particles
            const sparkle = this.add.particles(width / 2, height * 0.27, 'ball', {
                speed: { min: 50, max: 100 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 1, end: 0 },
                blendMode: 'ADD',
                quantity: 2,
                frequency: 50,
                tint: 0xffd700,
                lifespan: 800
            });
        }

        // Score display container with glassmorphism style
        this.scoreContainer = this.add.container(width / 2, height * 0.42);

        const scoreBg = this.add.rectangle(0, 0, 550, 280, 0x1a1a3e, 0.95);
        scoreBg.setStrokeStyle(3, 0x00d4ff, 0.5);
        scoreBg.setOrigin(0.5);

        // Add corner decorations
        this.addCornerDecorations(this.scoreContainer, 0, 0, 275, 140);

        const scoreLabel = this.add.text(-220, -90, '最终得分', {
            fontSize: '32px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#88aaff'
        }).setOrigin(0, 0.5);

        const scoreValue = this.add.text(0, -30, this.score.toLocaleString(), {
            fontSize: '72px',
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

        const levelLabel = this.add.text(-220, 50, '到达关卡', {
            fontSize: '28px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#88aaff'
        }).setOrigin(0, 0.5);

        const levelValue = this.add.text(220, 50, `第 ${this.level} 关`, {
            fontSize: '42px',
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
        }).setOrigin(1, 0.5);

        // High score display
        const highScoreLabel = this.add.text(0, 110, `🏆 最高分：${this.highScore.toLocaleString()}`, {
            fontSize: '32px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scoreContainer.add([scoreBg, scoreLabel, scoreValue, levelLabel, levelValue, highScoreLabel]);

        // Animate score counting up
        this.animateScore(scoreValue, 0, this.score, 1500);

        // Buttons container
        const buttonsY = height * 0.72;

        // Restart Button
        this.restartBtn = this.createModernButton(
            width / 2 - 160,
            buttonsY,
            '再来一局',
            0x00cc66,
            0x009944,
            () => {
                audioManager.play('launch');
                this.scene.start('GameScene');
            }
        );

        // Menu Button
        this.menuBtn = this.createModernButton(
            width / 2 + 160,
            buttonsY,
            '返回菜单',
            0x0099cc,
            0x006699,
            () => {
                audioManager.play('launch');
                this.scene.start('MenuScene');
            }
        );

        // Keyboard input
        this.input.keyboard?.on('keydown-ENTER', () => {
            this.scene.start('GameScene');
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });

        // Add hint text
        this.hintText = this.add.text(width / 2, height * 0.88, '按 ENTER 重新开始 • 按 ESC 返回菜单', {
            fontSize: '22px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#556688',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Fade in hint
        this.tweens.add({
            targets: this.hintText,
            alpha: { from: 0, to: 0.7 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // Listen for resize
        this.scale.on('resize', this.handleResize, this);
    }

    private addCornerDecorations(container: Phaser.GameObjects.Container, x: number, y: number, halfW: number, halfH: number): void {
        const cornerSize = 25;
        const cornerColor = 0x00d4ff;
        const cornerAlpha = 0.5;

        const corners = [
            { x: -halfW + 12, y: -halfH + 12, w: cornerSize, h: 2 },
            { x: -halfW + 12, y: -halfH + 12, w: 2, h: cornerSize },
            { x: halfW - 12, y: -halfH + 12, w: -cornerSize, h: 2 },
            { x: halfW - 12, y: -halfH + 12, w: 2, h: cornerSize },
            { x: -halfW + 12, y: halfH - 12, w: cornerSize, h: -2 },
            { x: -halfW + 12, y: halfH - 12, w: 2, h: -cornerSize },
            { x: halfW - 12, y: halfH - 12, w: -cornerSize, h: -2 },
            { x: halfW - 12, y: halfH - 12, w: 2, h: -cornerSize }
        ];

        corners.forEach(c => {
            const rect = this.add.rectangle(c.x, c.y, Math.abs(c.w), Math.abs(c.h), cornerColor, cornerAlpha);
            rect.setOrigin(c.w > 0 ? 0 : 1, c.h > 0 ? 0 : 1);
            container.add(rect);
        });
    }

    private createModernButton(x: number, y: number, label: string, color1: number, color2: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 260;
        const btnHeight = 60;

        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color1);
        bg.setOrigin(0.5);
        bg.setStrokeStyle(2, 0xffffff, 0.5);

        // Inner highlight
        const highlight = this.add.rectangle(-btnWidth/2 + 10, -btnHeight/2 + 10, btnWidth - 20, btnHeight/2 - 10, 0xffffff, 0.15);
        highlight.setOrigin(0);

        const text = this.add.text(0, 0, label, {
            fontSize: '30px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: {
                blur: 6,
                color: '#000000',
                fill: true,
                offsetX: 1,
                offsetY: 1
            }
        }).setOrigin(0.5);

        container.add([bg, highlight, text]);
        container.setSize(btnWidth, btnHeight);
        container.setInteractive(new Phaser.Geom.Rectangle(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight), Phaser.Geom.Rectangle.Contains);

        // Hover effects
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Back.out'
            });
            bg.setFillStyle(Phaser.Display.Color.GetColor(
                Math.min(255, ((color1 >> 16) & 0xFF) + 30),
                Math.min(255, ((color1 >> 8) & 0xFF) + 30),
                Math.min(255, (color1 & 0xFF) + 30)
            ));
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.out'
            });
            bg.setFillStyle(color1);
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.97,
                scaleY: 0.97,
                duration: 80
            });
            callback();
        });

        return container;
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        this.overlay.setSize(width, height);
        this.titleText.setPosition(width / 2, height * 0.18);
        
        if (this.newHighScoreText) {
            this.newHighScoreText.setPosition(width / 2, height * 0.27);
        }
        
        this.scoreContainer.setPosition(width / 2, height * 0.42);
        this.restartBtn.setPosition(width / 2 - 160, height * 0.72);
        this.menuBtn.setPosition(width / 2 + 160, height * 0.72);
        this.hintText.setPosition(width / 2, height * 0.88);
    }

    private animateScore(text: Phaser.GameObjects.Text, from: number, to: number, duration: number) {
        const startTime = Date.now();

        const updateScore = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (easeOutQuad)
            const eased = 1 - (1 - progress) * (1 - progress);

            const currentScore = Math.floor(from + (to - from) * eased);
            text.setText(currentScore.toLocaleString());

            if (progress < 1) {
                requestAnimationFrame(updateScore);
            } else {
                text.setText(to.toLocaleString());
            }
        };

        updateScore();
    }

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
