import Phaser from 'phaser';

export class PauseMenu extends Phaser.Scene {
    private isPaused: boolean = false;
    private pauseContainer!: Phaser.GameObjects.Container;
    private resumeBtn!: Phaser.GameObjects.Container;
    private restartBtn!: Phaser.GameObjects.Container;
    private menuBtn!: Phaser.GameObjects.Container;
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

        // Buttons — pill-shaped with gradient
        this.resumeBtn = this.createButton(0, -50, '继续游戏', 0x00cc66, () => this.resumeGame());
        this.restartBtn = this.createButton(0, 35, '重新开始', 0xff8800, () => this.restartGame());
        this.menuBtn = this.createButton(0, 120, '返回菜单', 0x4488ff, () => this.goToMenu());

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

    private createButton(x: number, y: number, textStr: string, mainColor: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 260;
        const btnHeight = 54;
        const radius = btnHeight / 2;

        const graphics = this.add.graphics();

        const fillAlpha = 0.15;

        // Base fill
        graphics.fillStyle(mainColor, fillAlpha);
        graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
        graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
        graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

        // Border
        graphics.lineStyle(2, mainColor, 0.6);
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

        // Reliable Hit Zone
        const hitZone = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x000000, 0);
        hitZone.setInteractive({ useHandCursor: true });

        container.add([graphics, btnText, hitZone]);
        container.setSize(btnWidth, btnHeight);

        hitZone.on('pointerover', () => {
            graphics.clear();
            graphics.fillStyle(mainColor, 0.3);
            graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
            graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
            graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

            graphics.lineStyle(3, mainColor, 1);
            graphics.beginPath();
            graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
            graphics.lineTo(btnWidth / 2 - radius, -radius);
            graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
            graphics.closePath();
            graphics.strokePath();

            this.tweens.add({ targets: container, y: y - 2, duration: 200, ease: 'Power2' });
        });

        hitZone.on('pointerout', () => {
            graphics.clear();
            graphics.fillStyle(mainColor, fillAlpha);
            graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
            graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
            graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

            graphics.lineStyle(2, mainColor, 0.6);
            graphics.beginPath();
            graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
            graphics.lineTo(btnWidth / 2 - radius, -radius);
            graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
            graphics.closePath();
            graphics.strokePath();

            this.tweens.add({ targets: container, y: y, duration: 200, ease: 'Power2' });
        });

        hitZone.on('pointerdown', () => {
            this.tweens.add({ targets: container, scale: 0.95, duration: 100, yoyo: true, onComplete: callback });
        });

        return container;
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
