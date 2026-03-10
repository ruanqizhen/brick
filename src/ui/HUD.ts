import Phaser from 'phaser';
import { PowerUpType } from '../entities/PowerUp';

interface ScoreContainer extends Phaser.GameObjects.Container {
    scoreValue: Phaser.GameObjects.Text;
}

export class HUD extends Phaser.GameObjects.Container {
    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;
    private levelText!: Phaser.GameObjects.Text;
    private score: number = 0;
    private lives: number = 3;
    private scoreContainer!: ScoreContainer;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        // Score container — frosted glass pill
        this.scoreContainer = this.createScorePanel(scene, 20, 20);

        // Lives display — modern pill with hearts
        this.livesText = scene.add.text(scene.cameras.main.width - 30, 35, '♥ 3', {
            fontSize: '30px',
            fontFamily: '"Courier New", monospace',
            color: '#ff4488',
            fontStyle: 'bold',
            shadow: {
                blur: 12,
                color: '#ff0044',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(1, 0.5);

        // Level display — centered, monospace, neon glow
        this.levelText = scene.add.text(scene.cameras.main.width / 2, 35, 'LV 01', {
            fontSize: '28px',
            fontFamily: '"Courier New", monospace',
            color: '#00ffff',
            fontStyle: 'bold',
            shadow: {
                blur: 15,
                color: '#00aaff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5, 0.5);

        this.add([this.livesText, this.levelText]);
        scene.add.existing(this);

        // Listen for camera resize
        scene.scale.on('resize', this.handleResize, this);
    }

    private createScorePanel(scene: Phaser.Scene, x: number, y: number): ScoreContainer {
        const container = scene.add.container(x, y) as ScoreContainer;

        // Frosted glass pill background
        const bg = scene.add.rectangle(0, 0, 240, 56, 0x111133, 0.7);
        bg.setStrokeStyle(1.5, 0x4444aa, 0.5);
        bg.setOrigin(0);

        // Score label — dim accent
        const label = scene.add.text(15, 28, 'SCORE', {
            fontSize: '14px',
            fontFamily: '"Courier New", monospace',
            color: '#6677aa',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Score value — bright monospace digits
        const scoreValue = scene.add.text(90, 28, '0', {
            fontSize: '30px',
            fontFamily: '"Courier New", monospace',
            color: '#00ffcc',
            fontStyle: 'bold',
            shadow: {
                blur: 10,
                color: '#00ffaa',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0, 0.5);

        container.add([bg, label, scoreValue]);
        container.setSize(240, 56);
        container.scoreValue = scoreValue;

        return container;
    }

    updateScore(points: number) {
        this.score += points;
        if (this.scoreContainer.scoreValue) {
            this.scoreContainer.scoreValue.setText(this.score.toLocaleString());

            // Animate on score update
            this.scene.tweens.add({
                targets: this.scoreContainer.scoreValue,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 100,
                yoyo: true,
                ease: 'Back.out'
            });
        }
    }

    updateLives(lives: number) {
        this.lives = lives;
        const hearts = '♥'.repeat(Math.max(0, lives));
        this.livesText.setText(hearts + ' ' + lives);

        // Flash effect when life lost
        if (lives < 3) {
            this.scene.tweens.add({
                targets: this.livesText,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: 3
            });
        }
    }

    updateLevel(level: number) {
        const lvStr = level < 10 ? `0${level}` : `${level}`;
        this.levelText.setText(`LV ${lvStr}`);

        // Scale + glow pulse on level change
        this.scene.tweens.add({
            targets: this.levelText,
            scale: 1.3,
            duration: 300,
            yoyo: true,
            ease: 'Back.out'
        });
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;

        // Reposition elements
        this.livesText.x = width - 30;
        this.levelText.x = width / 2;
    }

    get getScore(): number {
        return this.score;
    }

    shutdown(): void {
        // Clean up resize listener to prevent memory leaks
        this.scene.scale.off('resize', this.handleResize, this);
    }
}
