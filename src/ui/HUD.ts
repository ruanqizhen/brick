import Phaser from 'phaser';
import { PowerUpType } from '../entities/PowerUp';

interface ActivePowerUp {
    type: PowerUpType;
    icon: Phaser.GameObjects.Text;
    bg: Phaser.GameObjects.Arc;
    timer?: Phaser.Time.TimerEvent;
    timeLeft: number;
}

export class HUD extends Phaser.GameObjects.Container {
    private scoreText!: Phaser.GameObjects.Text;
    private livesText!: Phaser.GameObjects.Text;
    private score: number = 0;
    private lives: number = 3;
    private pauseBtn!: Phaser.GameObjects.Container;
    private onPauseCallback?: () => void;
    private pauseButtonClicked: boolean = false;
    private scoreContainer!: Phaser.GameObjects.Container;

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

        // Pause button (top right)
        this.createPauseButton(scene, scene.cameras.main.width - 30, 75);

        this.add([this.livesText]);
        scene.add.existing(this);

        // Listen for camera resize
        scene.scale.on('resize', this.handleResize, this);
    }

    private createScorePanel(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
        const container = scene.add.container(x, y);

        // Background with gradient effect
        const bg = scene.add.rectangle(0, 0, 220, 60, 0x1a1a3e, 0.9);
        bg.setStrokeStyle(2, 0x00d4ff, 0.6);
        bg.setOrigin(0);

        // Score label
        const label = scene.add.text(15, 8, '得分', {
            fontSize: '18px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#88aaff'
        });

        // Score value
        const scoreValue = scene.add.text(15, 32, '0', {
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
        });

        container.add([bg, label, scoreValue]);
        container.setSize(220, 60);

        // Store reference for updates
        (container as any).scoreValue = scoreValue;

        return container;
    }

    updateScore(points: number) {
        this.score += points;
        const scoreValue = (this.scoreContainer as any).scoreValue as Phaser.GameObjects.Text;
        if (scoreValue) {
            scoreValue.setText(this.score.toLocaleString());

            // Animate on score update
            this.scene.tweens.add({
                targets: scoreValue,
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

    /**
     * Create pause button with modern style
     */
    private createPauseButton(scene: Phaser.Scene, x: number, y: number): void {
        const btnSize = 45;
        this.pauseBtn = scene.add.container(x, y);
        this.pauseBtn.setDepth(100);

        // Circle background with glow effect
        const bg = this.scene.add.circle(0, 0, btnSize / 2, 0x2a2a4e, 0.9);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(2, 0x00d4ff, 0.6);

        // Pause icon (two vertical bars)
        const pauseIcon1 = scene.add.rectangle(-10, 0, 5, 22, 0xffffff);
        pauseIcon1.setOrigin(0.5);
        const pauseIcon2 = scene.add.rectangle(10, 0, 5, 22, 0xffffff);
        pauseIcon2.setOrigin(0.5);

        this.pauseBtn.add([bg, pauseIcon1, pauseIcon2]);

        // Hover effects
        bg.on('pointerover', () => {
            this.scene.tweens.add({
                targets: bg,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 150,
                ease: 'Back.out'
            });
            bg.setFillStyle(0x3a3a5e);
        });

        bg.on('pointerout', () => {
            this.scene.tweens.add({
                targets: bg,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.out'
            });
            bg.setFillStyle(0x2a2a4e);
        });

        bg.on('pointerdown', () => {
            this.scene.tweens.add({
                targets: bg,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100
            });
            this.pauseButtonClicked = true;
            if (this.onPauseCallback) {
                this.onPauseCallback();
            }
        });
    }

    /**
     * Register callback for pause button click
     */
    onPauseButtonClicked(callback: () => void): void {
        this.onPauseCallback = callback;
    }

    /**
     * Check if pause button was clicked
     */
    isPauseButtonClicked(): boolean {
        return this.pauseButtonClicked;
    }

    /**
     * Reset pause button clicked state
     */
    resetPauseButtonClicked(): void {
        this.pauseButtonClicked = false;
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;

        // Reposition elements
        this.livesText.x = width - 30;
        this.pauseBtn.x = width - 30;
    }

    get getScore(): number {
        return this.score;
    }
}
