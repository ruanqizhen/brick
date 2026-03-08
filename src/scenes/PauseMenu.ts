import Phaser from 'phaser';
import { DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/GameConfig';

export class PauseMenu extends Phaser.Scene {
    private isPaused: boolean = false;
    private pauseContainer!: Phaser.GameObjects.Container;
    private resumeBtn!: Phaser.GameObjects.Container;
    private restartBtn!: Phaser.GameObjects.Container;
    private menuBtn!: Phaser.GameObjects.Container;

    constructor() {
        super('PauseMenu');
    }

    create() {
        // Create semi-transparent overlay
        const overlay = this.add.rectangle(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, 0x000000, 0.7);
        overlay.setOrigin(0);
        overlay.setDepth(1000);

        // Main pause menu container
        this.pauseContainer = this.add.container(DESIGN_WIDTH / 2, DESIGN_HEIGHT / 2);
        this.pauseContainer.setDepth(1001);

        // Background panel
        const panelBg = this.add.rectangle(0, 0, 500, 400, 0x1a1a2e, 0.95);
        panelBg.setStrokeStyle(4, 0x4a4a6e);
        panelBg.setOrigin(0.5);

        // Title
        const title = this.add.text(0, -140, 'PAUSED', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            letterSpacing: 8
        }).setOrigin(0.5);

        // Resume button (green)
        this.resumeBtn = this.createButton(0, -40, 'RESUME', 0x4CAF50, () => this.resumeGame());
        
        // Restart button (orange)
        this.restartBtn = this.createButton(0, 40, 'RESTART', 0xFF9800, () => this.restartGame());
        
        // Menu button (blue)
        this.menuBtn = this.createButton(0, 120, 'MAIN MENU', 0x2196F3, () => this.goToMenu());

        this.pauseContainer.add([panelBg, title, this.resumeBtn, this.restartBtn, this.menuBtn]);

        // Keyboard input
        this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
        this.input.keyboard?.on('keydown-P', () => this.resumeGame());
        this.input.keyboard?.on('keydown-ENTER', () => {
            // Select first button (resume)
            this.resumeGame();
        });

        // Game is paused
        this.isPaused = true;

        // Animate menu appearance
        this.pauseContainer.setScale(0.8);
        this.pauseContainer.setAlpha(0);
        
        this.tweens.add({
            targets: this.pauseContainer,
            scale: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.out'
        });

        // Subtle pulse animation on resume button
        this.tweens.add({
            targets: this.resumeBtn,
            scaleX: { from: 1, to: 1.02 },
            scaleY: { from: 1, to: 1.02 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private createButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 280, 60, color);
        bg.setInteractive({ useHandCursor: true });
        bg.setStrokeStyle(3, 0xffffff, 0.8);

        const text = this.add.text(0, 0, label, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(this.lightenColor(color, 40));
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

    private lightenColor(color: number, amount: number): number {
        const r = Math.min(255, ((color >> 16) & 0xFF) + amount);
        const g = Math.min(255, ((color >> 8) & 0xFF) + amount);
        const b = Math.min(255, (color & 0xFF) + amount);
        return (r << 16) | (g << 8) | b;
    }

    private resumeGame(): void {
        if (this.isPaused) {
            this.isPaused = false;
            
            // Animate out
            this.tweens.add({
                targets: this.pauseContainer,
                scale: 0.9,
                alpha: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    this.scene.stop('PauseMenu');
                }
            });

            // Notify GameScene to resume
            const gameScene = this.scene.get('GameScene') as Phaser.Scene;
            gameScene.events.emit('resumeGame');
        }
    }

    private restartGame(): void {
        this.isPaused = false;
        this.scene.stop('PauseMenu');
        
        const gameScene = this.scene.get('GameScene') as Phaser.Scene;
        gameScene.events.emit('restartGame');
    }

    private goToMenu(): void {
        this.isPaused = false;
        this.scene.stop('PauseMenu');
        
        const gameScene = this.scene.get('GameScene') as Phaser.Scene;
        gameScene.events.emit('goToMenu');
    }

    /**
     * Check if the game is currently paused
     */
    checkPause(): boolean {
        return this.isPaused;
    }
}
