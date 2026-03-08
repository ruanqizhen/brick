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

        // Create semi-transparent overlay with blur effect
        this.overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
        this.overlay.setOrigin(0);
        this.overlay.setDepth(1000);

        // Create background grid animation
        this.createAnimatedBackground(width, height);

        // Main pause menu container
        this.pauseContainer = this.add.container(width / 2, height / 2);
        this.pauseContainer.setDepth(1001);

        // Modern glassmorphism panel
        this.panelBg = this.add.rectangle(0, 0, 550, 450, 0x1a1a3e, 0.95);
        this.panelBg.setStrokeStyle(3, 0x00d4ff, 0.5);
        this.panelBg.setOrigin(0.5);

        // Add corner decorations
        this.addCornerDecorations(0, 0, 275, 225);

        // Title with gradient glow
        this.titleText = this.add.text(0, -160, '游戏暂停', {
            fontSize: '68px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#00d4ff',
            fontStyle: 'bold',
            shadow: {
                blur: 20,
                color: '#00d4ff',
                fill: true,
                offsetX: 0,
                offsetY: 0
            }
        }).setOrigin(0.5);

        // Resume button (green)
        this.resumeBtn = this.createModernButton(0, -60, '继续游戏', 0x00cc66, 0x009944, () => this.resumeGame());

        // Restart button (orange)
        this.restartBtn = this.createModernButton(0, 30, '重新开始', 0xff9900, 0xcc6600, () => this.restartGame());

        // Menu button (blue)
        this.menuBtn = this.createModernButton(0, 120, '返回菜单', 0x0099cc, 0x006699, () => this.goToMenu());

        this.pauseContainer.add([this.panelBg, this.titleText, this.resumeBtn, this.restartBtn, this.menuBtn]);

        // Keyboard input
        this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
        this.input.keyboard?.on('keydown-P', () => this.resumeGame());
        this.input.keyboard?.on('keydown-ENTER', () => this.resumeGame());

        // Game is paused
        this.isPaused = true;

        // Animate menu appearance
        this.pauseContainer.setScale(0.8);
        this.pauseContainer.setAlpha(0);
        
        this.tweens.add({
            targets: this.pauseContainer,
            scale: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.out'
        });

        // Stagger animation for buttons
        this.tweens.add({
            targets: [this.resumeBtn, this.restartBtn, this.menuBtn],
            alpha: 0,
            from: 1,
            duration: 200,
            delay: 100,
            stagger: 100
        });

        // Listen for resize
        this.scale.on('resize', this.handleResize, this);
    }

    private createAnimatedBackground(width: number, height: number): void {
        // Floating particles
        this.particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 4000,
            speed: { min: 20, max: 50 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            quantity: 3,
            frequency: 150,
            tint: [0x00d4ff, 0x0099ff, 0x0066ff]
        });
    }

    private addCornerDecorations(x: number, y: number, halfW: number, halfH: number): void {
        const cornerSize = 30;
        const cornerColor = 0x00d4ff;
        const cornerAlpha = 0.6;

        // Top-left
        const tl = this.add.rectangle(-halfW + 15, -halfH + 15, cornerSize, 3, cornerColor, cornerAlpha);
        const tl2 = this.add.rectangle(-halfW + 15, -halfH + 15, 3, cornerSize, cornerColor, cornerAlpha);

        // Top-right
        const tr = this.add.rectangle(halfW - 15, -halfH + 15, cornerSize, 3, cornerColor, cornerAlpha);
        const tr2 = this.add.rectangle(halfW - 15, -halfH + 15, 3, cornerSize, cornerColor, cornerAlpha);

        // Bottom-left
        const bl = this.add.rectangle(-halfW + 15, halfH - 15, cornerSize, 3, cornerColor, cornerAlpha);
        const bl2 = this.add.rectangle(-halfW + 15, halfH - 15, 3, cornerSize, cornerColor, cornerAlpha);

        // Bottom-right
        const br = this.add.rectangle(halfW - 15, halfH - 15, cornerSize, 3, cornerColor, cornerAlpha);
        const br2 = this.add.rectangle(halfW - 15, halfH - 15, 3, cornerSize, cornerColor, cornerAlpha);

        this.pauseContainer.add([tl, tl2, tr, tr2, bl, bl2, br, br2]);
    }

    private createModernButton(x: number, y: number, label: string, color1: number, color2: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 300;
        const btnHeight = 55;

        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color1);
        bg.setOrigin(0.5);
        bg.setStrokeStyle(2, 0xffffff, 0.5);

        // Inner highlight
        const highlight = this.add.rectangle(-btnWidth/2 + 8, -btnHeight/2 + 8, btnWidth - 16, btnHeight/2 - 8, 0xffffff, 0.12);
        highlight.setOrigin(0);

        const text = this.add.text(0, 0, label, {
            fontSize: '28px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: {
                blur: 6,
                color: '#000000',
                fill: true,
                offsetX: 1,
                offsetY: 1
            }
        }).setOrigin(0.5);

        container.add([bg, highlight, text]);
        container.setSize(btnWidth, btnHeight);
        container.setInteractive(new Phaser.Geom.Rectangle(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight), Phaser.Geom.Rectangle.Contains);

        // Hover effects
        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.03,
                scaleY: 1.03,
                duration: 150,
                ease: 'Back.out'
            });
            bg.setFillStyle(Phaser.Display.Color.GetColor(
                Math.min(255, ((color1 >> 16) & 0xFF) + 30),
                Math.min(255, ((color1 >> 8) & 0xFF) + 30),
                Math.min(255, (color1 & 0xFF) + 30)
            ));
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.out'
            });
            bg.setFillStyle(color1);
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.97,
                scaleY: 0.97,
                duration: 80
            });
            callback();
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

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
