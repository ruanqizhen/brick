import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';
import { saveManager } from '../storage/SaveManager';

export class MenuScene extends Phaser.Scene {
    private highScoreText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;
    private startBtn!: Phaser.GameObjects.Container;
    private instructions!: Phaser.GameObjects.Text;
    private homepageLink!: Phaser.GameObjects.Text;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private bgGradient!: Phaser.GameObjects.Rectangle;
    private bgOverlay!: Phaser.GameObjects.Rectangle;

    constructor() {
        super('MenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Unlock audio on first interaction
        this.input.once('pointerdown', () => {
            audioManager.unlock();
        });

        // ============================================
        // BACKGROUND — Deep space with animated color shift
        // ============================================
        this.bgGradient = this.add.rectangle(0, 0, width, height, 0x0a0a12);
        this.bgGradient.setOrigin(0);

        // Glassmorphism overlay emulation (darkened)
        this.bgOverlay = this.add.rectangle(0, 0, width, height, 0x0a0a12, 0.85);
        this.bgOverlay.setOrigin(0);

        // Ambient pulse glow behind UI (like the reference radial gradients)
        const glow = this.add.circle(width / 2, height / 2, 300, 0x00d4ff, 0.05);
        this.tweens.add({
            targets: glow,
            scale: { from: 1, to: 1.1 },
            alpha: { from: 0.03, to: 0.08 },
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ============================================
        // LOGO & TITLE
        // ============================================
        const iconY = height * 0.2;
        const iconText = this.add.text(width / 2, iconY, '☄️', { fontSize: '48px' }).setOrigin(0.5);
        iconText.setName('iconText');

        // Emulating the linear gradient title text via Tint
        this.titleText = this.add.text(width / 2, iconY + 80, '弹力球打砖块', {
            fontSize: '80px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            fontStyle: '900',
            color: '#ffffff',
            letterSpacing: 4
        }).setOrigin(0.5);
        // White top, Cyan/Gold bottom left/right
        this.titleText.setTint(0xffffff, 0xffffff, 0x00d4ff, 0xffcc00);
        this.titleText.setShadow(0, 0, 'rgba(0, 212, 255, 0.4)', 30, true, true);

        this.tweens.add({
            targets: this.titleText,
            scale: { from: 1, to: 1.02 },
            alpha: { from: 0.8, to: 1 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ============================================
        // HIGH SCORE
        // ============================================
        this.highScoreText = this.add.text(width / 2, iconY + 145, '高分记录: 0', {
            fontSize: '28px',
            fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
            fontStyle: '700',
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: 2
        }).setOrigin(0.5);

        saveManager.getHighScore().then(highScore => {
            if (this.highScoreText.active) {
                this.highScoreText.setText(`高分记录: ${highScore.toLocaleString()}`);
            }
        });

        // ============================================
        // BUTTONS
        // ============================================
        const btnY = height * 0.45;

        // Primary Button
        this.startBtn = this.createCyberButton(width / 2, btnY, '开始游戏', true, () => {
            audioManager.play('launch');
            this.scene.start('GameScene');
        });

        // Secondary Button (Help)
        const helpBtn = this.createCyberButton(width / 2, btnY + 80, '游戏帮助', false, () => {
            // Can be tied to a standard alert or help scene. Let's start the game in this case for placeholder, or show alert.
            alert("帮助界面功能开发中！");
        });

        // ============================================
        // INSTRUCTIONS PANEL
        // ============================================
        const panelWidth = 400;
        const panelY = height * 0.7;
        const panelBg = this.add.rectangle(width / 2, panelY, panelWidth, 140, 0xffffff, 0.04);
        panelBg.setStrokeStyle(1, 0xffffff, 0.08);
        panelBg.setOrigin(0.5);

        const createKeyTag = (x: number, y: number, text: string) => {
            const tagBg = this.add.rectangle(x, y, 0, 0, 0xffffff, 0.08).setStrokeStyle(1, 0xffffff, 0.15);
            const tagText = this.add.text(x, y, text, {
                fontSize: '16px',
                fontFamily: "'Orbitron', 'Noto Sans SC', sans-serif",
                fontStyle: '700',
                color: '#00d4ff',
                letterSpacing: 1
            }).setOrigin(0.5);
            tagBg.setSize(tagText.width + 24, tagText.height + 10);
            return [tagBg, tagText];
        };

        const createInstructionRow = (y: number, keyText: string, actionText: string) => {
            const centerX = width / 2;
            const yOffset = panelY + y;
            const tagElements = createKeyTag(centerX - 40, yOffset, keyText);
            const descText = this.add.text(centerX + 30, yOffset, actionText, {
                fontSize: '18px',
                fontFamily: "'Noto Sans SC', sans-serif",
                color: 'rgba(255, 255, 255, 0.6)'
            }).setOrigin(0, 0.5);

            // Re-align based on actual width
            const totalRowWidth = (tagElements[0] as Phaser.GameObjects.Rectangle).width + descText.width + 15;
            const startX = centerX - totalRowWidth / 2;
            (tagElements[0] as Phaser.GameObjects.Rectangle).setX(startX + (tagElements[0] as Phaser.GameObjects.Rectangle).width / 2);
            (tagElements[1] as Phaser.GameObjects.Text).setX(startX + (tagElements[0] as Phaser.GameObjects.Rectangle).width / 2);
            descText.setX(startX + (tagElements[0] as Phaser.GameObjects.Rectangle).width + 15);
        };

        createInstructionRow(-40, 'WASD / ↑↓←→', '移动');
        createInstructionRow(0, '触控 / 拖拽', '移动');
        createInstructionRow(40, '触控 / 点击', '射击');

        // ============================================
        // FOOTER LINK
        // ============================================
        this.homepageLink = this.add.text(width / 2, height * 0.9, '访问我的个人主页', {
            fontSize: '18px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: 1
        }).setOrigin(0.5);

        // Make the link interactive
        const linkHitArea = new Phaser.Geom.Rectangle(0, 0, this.homepageLink.width + 32, this.homepageLink.height + 16);
        this.homepageLink.setInteractive({
            hitArea: linkHitArea,
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true
        });

        const linkBg = this.add.rectangle(width / 2, height * 0.9, this.homepageLink.width + 32, this.homepageLink.height + 16, 0x000000, 0);
        linkBg.setStrokeStyle(1, 0xffffff, 0);

        this.homepageLink.on('pointerover', () => {
            this.homepageLink.setColor('#00d4ff');
            this.homepageLink.setShadow(0, 0, '#00d4ff', 10, false, true);
            linkBg.setStrokeStyle(1, 0x00d4ff, 0.2);
            linkBg.setFillStyle(0x00d4ff, 0.05);
        });
        this.homepageLink.on('pointerout', () => {
            this.homepageLink.setColor('rgba(255, 255, 255, 0.4)');
            this.homepageLink.setShadow(0, 0, '#000000', 0);
            linkBg.setStrokeStyle(1, 0x000000, 0);
            linkBg.setFillStyle(0x000000, 0);
        });
        this.homepageLink.on('pointerdown', () => {
            window.open('https://qizhen.xyz/', '_blank');
        });

        // Intro animation
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    private createCyberButton(x: number, y: number, text: string, isPrimary: boolean, onClick: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 240;
        const btnHeight = 54;
        const radius = btnHeight / 2;

        const mainColor = isPrimary ? 0x00d4ff : 0xffffff;
        // const accentColor = isPrimary ? 0xff3366 : 0xaaaaaa; // Not used in final implementation

        // Custom drawn pill shape since simple rectangles don't radius easily
        const graphics = this.add.graphics();

        // Base fill
        graphics.fillStyle(isPrimary ? 0x00d4ff : 0xffffff, isPrimary ? 0.15 : 0.05);
        // We use left/right circles + center rect
        graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
        graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
        graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

        // Border
        graphics.lineStyle(1, mainColor, isPrimary ? 0.4 : 0.2);
        graphics.beginPath();
        graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
        graphics.lineTo(btnWidth / 2 - radius, -radius);
        graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
        graphics.closePath();
        graphics.strokePath();

        // Button text
        const btnText = this.add.text(0, 0, text, {
            fontSize: '18px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#ffffff',
            fontStyle: 'bold',
            letterSpacing: 3
        }).setOrigin(0.5);

        container.add([graphics, btnText]);
        container.setSize(btnWidth, btnHeight);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            graphics.clear();

            // Hover state fill (brighter + gradient simulated via color blocks)
            graphics.fillStyle(isPrimary ? 0x00d4ff : 0xffffff, isPrimary ? 0.3 : 0.1);
            graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
            graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
            graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

            // Hover border glow
            graphics.lineStyle(2, mainColor, 0.8);
            graphics.beginPath();
            graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
            graphics.lineTo(btnWidth / 2 - radius, -radius);
            graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
            graphics.closePath();
            graphics.strokePath();

            this.tweens.add({
                targets: container,
                y: y - 2, // Slight lift
                duration: 200,
                ease: 'Power2'
            });
        });

        container.on('pointerout', () => {
            graphics.clear();

            // Normal state fill
            graphics.fillStyle(isPrimary ? 0x00d4ff : 0xffffff, isPrimary ? 0.15 : 0.05);
            graphics.fillCircle(-btnWidth / 2 + radius, 0, radius);
            graphics.fillCircle(btnWidth / 2 - radius, 0, radius);
            graphics.fillRect(-btnWidth / 2 + radius, -radius, btnWidth - radius * 2, btnHeight);

            // Normal Border
            graphics.lineStyle(1, mainColor, isPrimary ? 0.4 : 0.2);
            graphics.beginPath();
            graphics.arc(-btnWidth / 2 + radius, 0, radius, Math.PI * 0.5, Math.PI * 1.5);
            graphics.lineTo(btnWidth / 2 - radius, -radius);
            graphics.arc(btnWidth / 2 - radius, 0, radius, Math.PI * 1.5, Math.PI * 0.5);
            graphics.closePath();
            graphics.strokePath();

            this.tweens.add({
                targets: container,
                y: y,
                duration: 200,
                ease: 'Power2'
            });
        });

        container.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: onClick
            });
        });

        return container;
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        this.bgGradient.setSize(width, height);
        this.bgOverlay.setSize(width, height);

        const iconY = height * 0.15;
        const iconText = this.children.getByName('iconText') as Phaser.GameObjects.Text;
        if (iconText) {
            iconText.setPosition(width / 2, iconY);
        }
        this.titleText.setPosition(width / 2, iconY + 60);
        this.highScoreText.setPosition(width / 2, iconY + 130);

        const btnY = height * 0.45;
        this.startBtn.setPosition(width / 2, btnY);
        // Assuming helpBtn is not a class property, so we can't directly access it here.
        // If it were, we'd update its position similarly.
        // For now, we'll skip resizing the help button if it's not a class property.
        // If it was a class property, it would be: this.helpBtn.setPosition(width / 2, btnY + 70);

        // Resize instructions panel and its contents
        const panelWidth = 320;
        const panelY = height * 0.7;
        // Find and update panelBg and instruction rows if they were stored or accessible.
        // For simplicity, we'll assume they are recreated or not dynamically resized in this example.
        // If they were class properties, their positions would be updated here.

        this.homepageLink.setPosition(width / 2, height * 0.9);
        // Also update linkBg position if it's a class property
    }

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
