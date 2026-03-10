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

        // Score container with modern styling
        this.scoreContainer = this.createScorePanel(scene, 20, 20);

        // Lives display
        this.livesText = scene.add.text(scene.cameras.main.width - 30, 35, '❤️ 生命：3', {
            fontSize: '28px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ff6b6b',
            fontStyle: 'bold',
            shadow: {
                blur: 8,
                color: '#ff0000',
                fill: true,
                offsetX: 2,
                offsetY: 2
            }
        }).setOrigin(1, 0.5);

        // Level display (Centered)
        this.levelText = scene.add.text(scene.cameras.main.width / 2, 35, '第 1 关', {
            fontSize: '32px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffd700',
            fontStyle: 'bold',
            shadow: {
                blur: 15,
                color: '#ffd700',
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

        // Background with gradient effect
        const bg = scene.add.rectangle(0, 0, 220, 60, 0x1a1a3e, 0.9);
        bg.setStrokeStyle(2, 0x00d4ff, 0.6);
        bg.setOrigin(0);

        // Score label
        const label = scene.add.text(15, 30, '得分', {
            fontSize: '18px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#88aaff'
        }).setOrigin(0, 0.5);

        // Score value
        const scoreValue = scene.add.text(65, 30, '0', {
            fontSize: '32px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#00d4ff',
            fontStyle: 'bold',
            shadow: {
                blur: 10,
                color: '#00d4ff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0, 0.5);

        container.add([bg, label, scoreValue]);
        container.setSize(220, 60);
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
        this.livesText.setText(`❤️ 生命：${lives}`);

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
        this.levelText.setText(`第 ${level} 关`);

        // Slight scale effect on level change
        this.scene.tweens.add({
            targets: this.levelText,
            scale: 1.2,
            duration: 200,
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
