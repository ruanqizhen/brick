import Phaser from 'phaser';
import { UIButton } from '../ui/UIButton';

export class PauseMenu extends Phaser.Scene {
    private isPaused: boolean = false;
    private pauseContainer!: Phaser.GameObjects.Container;
    private resumeBtn!: UIButton;
    private restartBtn!: UIButton;
    private menuBtn!: UIButton;
    private overlay!: Phaser.GameObjects.Rectangle;
    private titleText!: Phaser.GameObjects.Text;
    private panelBg!: Phaser.GameObjects.Rectangle;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super('PauseMenu');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dark overlay with higher blur
        this.overlay = this.add.rectangle(0, 0, width, height, 0x050510, 0.88);
        this.overlay.setOrigin(0);
        this.overlay.setDepth(1000);

        // Floating neon particles
        this.particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 4000,
            speed: { min: 15, max: 40 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            quantity: 2,
            frequency: 120,
            tint: [0x8844ff, 0x00ffff, 0xff44aa]
        });
        (this.particles as any).setDepth?.(1000);

        // Main container
        this.pauseContainer = this.add.container(width / 2, height / 2);
        this.pauseContainer.setDepth(1001);

        // Frosted glass panel with rounded border
        this.panelBg = this.add.rectangle(0, 0, 520, 420, 0x111133, 0.85);
        this.panelBg.setStrokeStyle(2, 0x4444aa, 0.6);
        this.panelBg.setOrigin(0.5);

        // Title with neon glow
        this.titleText = this.add.text(0, -155, '游戏暂停', {
            fontSize: '64px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#8844ff',
            strokeThickness: 4,
            shadow: {
                blur: 25,
                color: '#aa55ff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        // Buttons using standardized UIButton class
        this.resumeBtn = new UIButton(this, 0, -50, {
            label: '继续游戏',
            isPrimary: true,
            onClick: () => this.resumeGame()
        });
        
        this.restartBtn = new UIButton(this, 0, 35, {
            label: '重新开始',
            isPrimary: false,
            onClick: () => this.restartGame()
        });
        
        this.menuBtn = new UIButton(this, 0, 120, {
            label: '返回菜单',
            isPrimary: false,
            onClick: () => this.goToMenu()
        });

        this.pauseContainer.add([this.panelBg, this.titleText, this.resumeBtn, this.restartBtn, this.menuBtn]);

        // Keyboard input
        this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
        this.input.keyboard?.on('keydown-P', () => this.resumeGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.resumeGame());

        this.isPaused = true;

        // Animate in
        this.pauseContainer.setScale(0.8);
        this.pauseContainer.setAlpha(0);

        this.tweens.add({
            targets: this.pauseContainer,
            scale: 1,
            alpha: 1,
            duration: 350,
            ease: 'Back.out'
        });

        // Stagger button appearance
        [this.resumeBtn, this.restartBtn, this.menuBtn].forEach((btn, i) => {
            btn.setAlpha(0);
            btn.x = -40;
            this.tweens.add({
                targets: btn,
                alpha: 1,
                x: 0,
                duration: 250,
                delay: 150 + i * 100,
                ease: 'Power2'
            });
        });

        this.scale.on('resize', this.handleResize, this);
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        this.overlay.setSize(width, height);
        this.pauseContainer.setPosition(width / 2, height / 2);
    }

    private resumeGame(): void {
        if (this.isPaused) {
            this.isPaused = false;

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

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
