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
        this.overlay = this.add.rectangle(0, 0, width, height, 0x0a0a12, 0.95);
        this.overlay.setOrigin(0);

        // Warm/dramatic particles (red ↔ neon pink/orange)
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
            tint: [0xff3366, 0xff00ff, 0xffcc00]
        });

        // ============================================
        // TITLE — "GAME OVER" with dramatic glow
        // ============================================
        this.titleText = this.add.text(width / 2, height * 0.16, '游戏结束', {
            fontSize: '72px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#ffffff',
            fontStyle: '900',
            stroke: '#ff3366',
            strokeThickness: 6,
            letterSpacing: 4,
            shadow: {
                blur: 30,
                color: 'rgba(255, 51, 102, 0.6)',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);
        this.titleText.setTint(0xffffff, 0xffffff, 0xff3366, 0xffcc00);

        this.tweens.add({
            targets: this.titleText,
            scale: { from: 0.8, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 600,
            ease: 'Back.out'
        });

        // New high score badge
        if (this.isNewHighScore) {
            this.newHighScoreText = this.add.text(width / 2, height * 0.255, '🏆 新纪录！🏆', {
                fontSize: '36px',
                fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
                color: '#ffcc00', // Gold
                fontStyle: 'bold',
                shadow: {
                    blur: 20,
                    color: 'rgba(255, 204, 0, 0.6)',
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
                tint: 0xffcc00,
                lifespan: 1000
            });
        }

        // ============================================
        // SCORE CARD — Frosted glass panel
        // ============================================
        this.scoreContainer = this.add.container(width / 2, height * 0.42);

        const scoreBg = this.add.rectangle(0, 0, 520, 260, 0xffffff, 0.04);
        scoreBg.setStrokeStyle(1.5, 0xffffff, 0.08);
        scoreBg.setOrigin(0.5);

        const scoreLabel = this.add.text(-210, -85, 'SCORE', {
            fontSize: '20px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: 'rgba(255, 255, 255, 0.6)',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const scoreValue = this.add.text(0, -25, '0', {
            fontSize: '64px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#00d4ff', // Cyan
            fontStyle: 'bold',
            shadow: {
                blur: 15,
                color: 'rgba(0, 212, 255, 0.5)',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        const levelLabel = this.add.text(-210, 50, 'LEVEL', {
            fontSize: '20px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: 'rgba(255, 255, 255, 0.6)',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        const levelValue = this.add.text(210, 50, `${this.level}`, {
            fontSize: '40px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#ff3366', // Accent
            fontStyle: 'bold',
            shadow: {
                blur: 10,
                color: 'rgba(255, 51, 102, 0.5)',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(1, 0.5);

        const highScoreLabel = this.add.text(0, 105, `🏆 BEST: ${this.highScore.toLocaleString()}`, {
            fontSize: '24px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            color: '#ffcc00', // Gold
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scoreContainer.add([scoreBg, scoreLabel, scoreValue, levelLabel, levelValue, highScoreLabel]);

        // Animate score counting
        this.animateScore(scoreValue, 0, this.score, 1500);

        // ============================================
        // BUTTONS — Cyberpunk pill style
        // ============================================
        const buttonsY = height * 0.72;

        this.restartBtn = this.createCyberButton(width / 2 - 135, buttonsY, '再来一局', true, () => {
            audioManager.play('launch');
            this.scene.start('GameScene');
        });

        this.menuBtn = this.createCyberButton(width / 2 + 135, buttonsY, '返回菜单', false, () => {
            audioManager.play('launch');
            this.scene.start('MenuScene');
        });

        // Keyboard
        this.input.keyboard?.on('keydown-ENTER', () => this.scene.start('GameScene'));
        this.input.keyboard?.on('keydown-ESC', () => this.scene.start('MenuScene'));

        // Hint
        this.hintText = this.add.text(width / 2, height * 0.88, 'ENTER 重新开始 • ESC 返回菜单', {
            fontSize: '24px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.hintText,
            alpha: { from: 0.2, to: 0.6 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        this.scale.on('resize', this.handleResize, this);
    }

    private createCyberButton(x: number, y: number, textStr: string, isPrimary: boolean, onClick: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 260;
        const btnHeight = 54;
        const radius = btnHeight / 2;

        const mainColor = isPrimary ? 0x00d4ff : 0xffffff;

        const graphics = this.add.graphics();

        // Base fill
        graphics.fillStyle(isPrimary ? 0x00d4ff : 0xffffff, isPrimary ? 0.15 : 0.05);
        graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
        graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
        graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

        // Border
        graphics.lineStyle(1, mainColor, isPrimary ? 0.4 : 0.2);
        graphics.beginPath();
        graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
        graphics.lineTo(btnWidth / 2 - radius, -radius);
        graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
        graphics.closePath();
        graphics.strokePath();

        // Button text
        const btnText = this.add.text(0, 0, textStr, {
            fontSize: '28px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#dddddd',
            fontStyle: 'bold',
            letterSpacing: 3
        }).setOrigin(0.5);

        container.add([graphics, btnText]);
        container.setSize(btnWidth, btnHeight);

        const hitArea = new Phaser.Geom.Rectangle(-btnWidth / 2, -radius, btnWidth, btnHeight);
        container.setInteractive({
            hitArea: hitArea,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        container.on('pointerover', () => {
            graphics.clear();
            graphics.fillStyle(isPrimary ? 0x00d4ff : 0xffffff, isPrimary ? 0.3 : 0.1);
            graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
            graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
            graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

            graphics.lineStyle(2, mainColor, 0.8);
            graphics.beginPath();
            graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
            graphics.lineTo(btnWidth / 2 - radius, -radius);
            graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
            graphics.closePath();
            graphics.strokePath();

            this.tweens.add({ targets: container, y: y - 2, duration: 200, ease: 'Power2' });
        });

        container.on('pointerout', () => {
            graphics.clear();
            graphics.fillStyle(isPrimary ? 0x00d4ff : 0xffffff, isPrimary ? 0.15 : 0.05);
            graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
            graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
            graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

            graphics.lineStyle(1, mainColor, isPrimary ? 0.4 : 0.2);
            graphics.beginPath();
            graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
            graphics.lineTo(btnWidth / 2 - radius, -radius);
            graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
            graphics.closePath();
            graphics.strokePath();

            this.tweens.add({ targets: container, y: y, duration: 200, ease: 'Power2' });
        });

        container.on('pointerdown', () => {
            this.tweens.add({ targets: container, scale: 0.95, duration: 100, yoyo: true, onComplete: onClick });
        });

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
