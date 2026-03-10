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

        this.highScore = await saveManager.getHighScore();
        this.isNewHighScore = this.score > this.highScore;

        if (this.isNewHighScore) {
            await saveManager.saveHighScore(this.score);
        }

        await saveManager.recordGame(false);
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dark gradient overlay
        this.overlay = this.add.rectangle(0, 0, width, height, 0x0a0008, 0.95);
        this.overlay.setOrigin(0);

        // Warm/dramatic particles (red ↔ orange)
        this.particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 5000,
            speed: { min: 10, max: 35 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.35, end: 0 },
            blendMode: 'ADD',
            quantity: 2,
            frequency: 150,
            tint: [0xff2244, 0xff6600, 0xff44aa, 0xffcc00]
        });

        // ============================================
        // TITLE — "GAME OVER" with dramatic glow
        // ============================================
        this.titleText = this.add.text(width / 2, height * 0.16, '游戏结束', {
            fontSize: '88px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#ff2244',
            strokeThickness: 6,
            shadow: {
                blur: 30,
                color: '#ff0033',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.titleText,
            scale: { from: 0.7, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 600,
            ease: 'Back.out'
        });

        // New high score badge
        if (this.isNewHighScore) {
            this.newHighScoreText = this.add.text(width / 2, height * 0.255, '🏆 新纪录！🏆', {
                fontSize: '44px',
                fontFamily: '"Microsoft YaHei", sans-serif',
                color: '#ffd700',
                fontStyle: 'bold',
                shadow: {
                    blur: 20,
                    color: '#ffaa00',
                    fill: true,
                    offsetX: 0,
                    offsetY: 0
                }
            }).setOrigin(0.5);

            this.tweens.add({
                targets: this.newHighScoreText,
                scaleX: { from: 1, to: 1.1 },
                scaleY: { from: 1, to: 1.1 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Golden sparkles
            this.add.particles(width / 2, height * 0.255, 'particle', {
                speed: { min: 40, max: 80 },
                scale: { start: 0.3, end: 0 },
                alpha: { start: 0.8, end: 0 },
                blendMode: 'ADD',
                quantity: 2,
                frequency: 60,
                tint: 0xffd700,
                lifespan: 1000
            });
        }

        // ============================================
        // SCORE CARD — Frosted glass panel
        // ============================================
        this.scoreContainer = this.add.container(width / 2, height * 0.42);

        const scoreBg = this.add.rectangle(0, 0, 520, 260, 0x111133, 0.85);
        scoreBg.setStrokeStyle(2, 0x4444aa, 0.5);
        scoreBg.setOrigin(0.5);

        const scoreLabel = this.add.text(-210, -85, 'SCORE', {
            fontSize: '20px',
            fontFamily: '"Courier New", monospace',
            color: '#6677aa',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const scoreValue = this.add.text(0, -25, '0', {
            fontSize: '64px',
            fontFamily: '"Courier New", monospace',
            color: '#00ffcc',
            fontStyle: 'bold',
            shadow: {
                blur: 15,
                color: '#00ffaa',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        const levelLabel = this.add.text(-210, 50, 'LEVEL', {
            fontSize: '20px',
            fontFamily: '"Courier New", monospace',
            color: '#6677aa',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const levelValue = this.add.text(210, 50, `${this.level}`, {
            fontSize: '40px',
            fontFamily: '"Courier New", monospace',
            color: '#ff8844',
            fontStyle: 'bold',
            shadow: {
                blur: 10,
                color: '#ff6600',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(1, 0.5);

        const highScoreLabel = this.add.text(0, 105, `🏆 BEST: ${this.highScore.toLocaleString()}`, {
            fontSize: '24px',
            fontFamily: '"Courier New", monospace',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scoreContainer.add([scoreBg, scoreLabel, scoreValue, levelLabel, levelValue, highScoreLabel]);

        // Animate score counting
        this.animateScore(scoreValue, 0, this.score, 1500);

        // ============================================
        // BUTTONS — Modern pill style
        // ============================================
        const buttonsY = height * 0.72;

        this.restartBtn = this.createButton(width / 2 - 155, buttonsY, '再来一局', 0x00cc66, () => {
            audioManager.play('launch');
            this.scene.start('GameScene');
        });

        this.menuBtn = this.createButton(width / 2 + 155, buttonsY, '返回菜单', 0x4488ff, () => {
            audioManager.play('launch');
            this.scene.start('MenuScene');
        });

        // Keyboard
        this.input.keyboard?.on('keydown-ENTER', () => this.scene.start('GameScene'));
        this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MenuScene'));

        // Hint
        this.hintText = this.add.text(width / 2, height * 0.88, 'ENTER 重新开始 • ESC 返回菜单', {
            fontSize: '20px',
            fontFamily: '"Courier New", monospace',
            color: '#445566'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.hintText,
            alpha: { from: 0.3, to: 0.8 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        this.scale.on('resize', this.handleResize, this);
    }

    private createButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 250;
        const btnHeight = 58;

        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color, 0.9);
        bg.setOrigin(0.5);

        const highlight = this.add.rectangle(0, -btnHeight * 0.15, btnWidth - 16, btnHeight * 0.3, 0xffffff, 0.12);
        highlight.setOrigin(0.5);

        const border = this.add.rectangle(0, 0, btnWidth + 2, btnHeight + 2, 0x000000, 0);
        border.setOrigin(0.5);
        border.setStrokeStyle(1.5, 0xffffff, 0.25);

        const text = this.add.text(0, 0, label, {
            fontSize: '28px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { blur: 6, color: '#000000', fill: true, offsetX: 0, offsetY: 1 }
        }).setOrigin(0.5);

        container.add([bg, highlight, border, text]);
        container.setSize(btnWidth, btnHeight);

        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 150, ease: 'Back.out' });
            border.setStrokeStyle(2, 0x00ffff, 0.8);
        });
        bg.on('pointerout', () => {
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 150, ease: 'Back.out' });
            border.setStrokeStyle(1.5, 0xffffff, 0.25);
        });
        bg.on('pointerdown', () => {
            this.tweens.add({ targets: container, scaleX: 0.96, scaleY: 0.96, duration: 80 });
        });
        bg.on('pointerup', callback);

        return container;
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        this.overlay.setSize(width, height);
        this.titleText.setPosition(width / 2, height * 0.16);
        if (this.newHighScoreText) this.newHighScoreText.setPosition(width / 2, height * 0.255);
        this.scoreContainer.setPosition(width / 2, height * 0.42);
        this.restartBtn.setPosition(width / 2 - 155, height * 0.72);
        this.menuBtn.setPosition(width / 2 + 155, height * 0.72);
        this.hintText.setPosition(width / 2, height * 0.88);
    }

    private animateScore(text: Phaser.GameObjects.Text, from: number, to: number, duration: number) {
        const startTime = Date.now();

        const updateScore = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - (1 - progress) * (1 - progress);
            const currentScore = Math.floor(from + (to - from) * eased);

            if (text && text.active) text.setText(currentScore.toLocaleString());
            if (progress < 1 && text && text.active) requestAnimationFrame(updateScore);
            else if (text && text.active) text.setText(to.toLocaleString());
        };

        updateScore();
    }

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) this.particles.destroy();
    }
}
