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
    private powerUpContainer!: Phaser.GameObjects.Container;
    private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();
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

        // Power-up display container (top center)
        this.powerUpContainer = scene.add.container(scene.cameras.main.width / 2, 20);
        this.powerUpContainer.setDepth(100);

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
     * Add or refresh a power-up display with timer
     */
    addPowerUp(type: PowerUpType, duration?: number): void {
        const icon = this.getPowerUpIcon(type);
        const color = this.getPowerUpColor(type);

        // If powerup already exists, refresh its timer
        if (this.activePowerUps.has(type)) {
            const existing = this.activePowerUps.get(type)!;
            existing.timer?.remove();
            if (duration) {
                existing.timeLeft = duration / 1000;
                this.startPowerUpTimer(existing, duration);
            } else {
                existing.timeLeft = Infinity;
            }
            return;
        }

        // Create new powerup display (modern circular style)
        const index = this.activePowerUps.size;
        const x = (index - Math.min(this.activePowerUps.size, 4)) * 65;
        
        // Glowing circle background
        const bg = this.scene.add.circle(x, 0, 26, color, 0.3);
        bg.setStrokeStyle(2, color, 0.8);
        
        // Inner glow
        const innerGlow = this.scene.add.circle(x, 0, 18, color, 0.2);
        
        // Large icon in center
        const iconText = this.scene.add.text(x, 2, icon, {
            fontSize: '32px',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.powerUpContainer.add([bg, innerGlow, iconText]);

        const powerUp: ActivePowerUp = {
            type,
            icon: iconText,
            bg,
            timeLeft: duration ? duration / 1000 : Infinity
        };

        if (duration) {
            this.startPowerUpTimer(powerUp, duration);
        }

        this.activePowerUps.set(type, powerUp);
        this.repositionPowerUps();
    }

    /**
     * Remove a power-up from display
     */
    removePowerUp(type: PowerUpType): void {
        const powerUp = this.activePowerUps.get(type);
        if (powerUp) {
            powerUp.timer?.remove();
            powerUp.icon.destroy();
            powerUp.bg.destroy();
            this.activePowerUps.delete(type);
            this.repositionPowerUps();
        }
    }

    /**
     * Clear all power-ups from HUD
     */
    clearAllPowerUps(): void {
        this.activePowerUps.forEach((pu) => {
            pu.timer?.remove();
            pu.icon.destroy();
            pu.bg.destroy();
        });
        this.activePowerUps.clear();
    }

    private startPowerUpTimer(powerUp: ActivePowerUp, duration: number): void {
        powerUp.timer = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                powerUp.timeLeft -= 0.1;
                
                // Update alpha based on remaining time
                if (powerUp.timeLeft <= 2) {
                    powerUp.icon.setAlpha(0.5 + Math.sin(this.scene.time.now / 100) * 0.3);
                }

                if (powerUp.timeLeft <= 0) {
                    this.removePowerUp(powerUp.type);
                }
            },
            repeat: Math.floor(duration / 0.1)
        });
    }

    private repositionPowerUps(): void {
        const powerUps = Array.from(this.activePowerUps.values());
        const totalWidth = powerUps.length * 65;
        const startX = -totalWidth / 2 + 32.5;

        powerUps.forEach((pu, index) => {
            const x = startX + index * 65;
            pu.bg.x = x;
            pu.icon.x = x;
        });
    }

    private getPowerUpIcon(type: PowerUpType): string {
        const icons: Record<PowerUpType, string> = {
            'PADDLE_EXPAND': '↔️',
            'PADDLE_SHRINK': '↕️',
            'FIREBALL': '🔥',
            'MULTI_BALL': '☄️',
            'BALL_ENLARGE': '⬆️',
            'BALL_SHRINK': '⬇️',
            'SPEED_UP': '⚡',
            'SPEED_DOWN': '🐌'
        };
        return icons[type] || '❓';
    }

    private getPowerUpColor(type: PowerUpType): number {
        const colors: Record<PowerUpType, number> = {
            'PADDLE_EXPAND': 0x2196F3,
            'PADDLE_SHRINK': 0x64B5F6,
            'FIREBALL': 0xFF5722,
            'MULTI_BALL': 0x4CAF50,
            'BALL_ENLARGE': 0xFFC107,
            'BALL_SHRINK': 0xFFEB3B,
            'SPEED_UP': 0xF44336,
            'SPEED_DOWN': 0x00BCD4
        };
        return colors[type] || 0x9E9E9E;
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
        this.powerUpContainer.x = width / 2;
        this.pauseBtn.x = width - 30;
    }

    get getScore(): number {
        return this.score;
    }
}
