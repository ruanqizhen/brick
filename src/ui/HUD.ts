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
    private scoreText: Phaser.GameObjects.Text;
    private livesText: Phaser.GameObjects.Text;
    private score: number = 0;
    private lives: number = 3;
    private powerUpContainer!: Phaser.GameObjects.Container;
    private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        const style = { fontSize: '32px', color: '#ffffff' };

        this.scoreText = scene.add.text(20, 20, 'SCORE: 0', style);
        this.livesText = scene.add.text(scene.cameras.main.width - 200, 20, 'LIVES: 3', style);

        // Power-up display container (top center)
        this.powerUpContainer = scene.add.container(scene.cameras.main.width / 2, 20);
        this.powerUpContainer.setDepth(100);

        this.add([this.scoreText, this.livesText]);
        scene.add.existing(this);
    }

    updateScore(points: number) {
        this.score += points;
        this.scoreText.setText(`SCORE: ${this.score}`);
    }

    updateLives(lives: number) {
        this.lives = lives;
        this.livesText.setText(`LIVES: ${this.lives}`);
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

        // Create new powerup display (circle background, subtle)
        const index = this.activePowerUps.size;
        const x = (index - Math.min(this.activePowerUps.size, 4)) * 65;
        
        // Circle background (small, light color)
        const bg = this.scene.add.circle(x, 0, 22, color, 0.35);
        bg.setStrokeStyle(2, color, 0.6);
        
        // Large icon in center
        const iconText = this.scene.add.text(x, 0, icon, {
            fontSize: '36px',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.powerUpContainer.add([bg, iconText]);

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

    get getScore(): number {
        return this.score;
    }
}
