import Phaser from 'phaser';
import { DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/GameConfig';
import { audioManager } from '../audio/AudioManager';

interface GameOverData {
    score: number;
    level: number;
    isNewHighScore: boolean;
}

export class GameOverScene extends Phaser.Scene {
    private score: number = 0;
    private level: number = 1;
    private highScore: number = 0;
    private isNewHighScore: boolean = false;

    constructor() {
        super('GameOverScene');
    }

    init(data: GameOverData) {
        this.score = data.score || 0;
        this.level = data.level || 1;
        this.isNewHighScore = data.isNewHighScore || false;
        this.highScore = this.loadHighScore();
    }

    create() {
        // Stop game BGM
        audioManager.stopBGM();

        // Darken background
        const overlay = this.add.rectangle(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, 0x000000, 0.8);
        overlay.setOrigin(0);

        // Game Over Title with animation
        const title = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.2, 'GAME OVER', {
            fontSize: '96px',
            color: '#ff4444',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: title,
            scale: { from: 0.8, to: 1 },
            alpha: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.out'
        });

        // New High Score indicator
        if (this.isNewHighScore) {
            const newHighScoreText = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.3, '🏆 NEW HIGH SCORE! 🏆', {
                fontSize: '42px',
                color: '#ffd700',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Animate high score text
            this.tweens.add({
                targets: newHighScoreText,
                scaleX: { from: 1, to: 1.1 },
                scaleY: { from: 1, to: 1.1 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Score display container
        const scoreContainer = this.add.container(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.45);

        const scoreBg = this.add.rectangle(0, 0, 500, 200, 0x222222, 0.9);
        scoreBg.setStrokeStyle(4, 0x444444);
        scoreBg.setOrigin(0.5);

        const scoreLabel = this.add.text(-200, -50, 'FINAL SCORE', {
            fontSize: '36px',
            color: '#888888'
        }).setOrigin(0, 0.5);

        const scoreValue = this.add.text(0, 0, this.score.toLocaleString(), {
            fontSize: '72px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const levelLabel = this.add.text(-200, 60, 'LEVEL REACHED', {
            fontSize: '28px',
            color: '#888888'
        }).setOrigin(0, 0.5);

        const levelValue = this.add.text(200, 60, this.level.toString(), {
            fontSize: '42px',
            color: '#4FC3F7',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);

        // High score display
        const highScoreLabel = this.add.text(0, 100, `HIGH SCORE: ${this.highScore.toLocaleString()}`, {
            fontSize: '32px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        scoreContainer.add([scoreBg, scoreLabel, scoreValue, levelLabel, levelValue, highScoreLabel]);

        // Animate score counting up
        this.animateScore(scoreValue, 0, this.score, 1500);

        // Buttons container
        const buttonsY = DESIGN_HEIGHT * 0.7;

        // Restart Button
        const restartBtn = this.createButton(
            DESIGN_WIDTH / 2 - 150,
            buttonsY,
            'RESTART',
            0x4CAF50,
            () => {
                audioManager.play('launch');
                this.scene.start('GameScene');
            }
        );

        // Menu Button
        const menuBtn = this.createButton(
            DESIGN_WIDTH / 2 + 150,
            buttonsY,
            'MENU',
            0x2196F3,
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
        const hint = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.85, 'Press ENTER to restart or ESC for menu', {
            fontSize: '24px',
            color: '#666666'
        }).setOrigin(0.5);

        // Fade in hint
        this.tweens.add({
            targets: hint,
            alpha: { from: 0, to: 0.6 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
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

    private createButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 240, 70, color);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(3, 0xffffff);

        const text = this.add.text(0, 0, label, {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // Hover effects
        bg.on('pointerover', () => {
            // Lighten the color on hover
            bg.setFillStyle(color | 0x333333);
            bg.setScale(1.05);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(color);
            bg.setScale(1);
        });

        bg.on('pointerdown', () => {
            bg.setScale(0.95);
            callback();
        });

        return container;
    }

    private loadHighScore(): number {
        try {
            const saved = localStorage.getItem('brick_highscore');
            return saved ? parseInt(saved, 10) : 0;
        } catch {
            return 0;
        }
    }

    /**
     * Save high score if current score is higher
     */
    static saveHighScore(score: number): boolean {
        try {
            const saved = localStorage.getItem('brick_highscore');
            const currentHigh = saved ? parseInt(saved, 10) : 0;
            
            if (score > currentHigh) {
                localStorage.setItem('brick_highscore', score.toString());
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }
}
