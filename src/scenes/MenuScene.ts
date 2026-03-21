import Phaser from 'phaser';
import { UIButton } from '../ui/UIButton';
import { audioManager } from '../audio/AudioManager';
import { saveManager } from '../storage/SaveManager';
import { SCENE_KEYS } from '../config/EventConstants';

export class MenuScene extends Phaser.Scene {
    private highScoreText!: Phaser.GameObjects.Text;
    private titleText!: Phaser.GameObjects.Text;
    private subtitleText!: Phaser.GameObjects.Text;
    private startBtn!: UIButton;
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
            fontFamily: "'Noto Sans SC', sans-serif",
            fontStyle: '700',
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
        this.highScoreText = this.add.text(width / 2, iconY + 245, '高分记录: 0', {
            fontSize: '28px',
            fontFamily: "'Noto Sans SC', sans-serif",
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
        // DIFFICULTY SELECTION
        // ============================================
        let selectedDifficulty: 'SIMPLE' | 'HARD' = 'SIMPLE';

        const difficultyY = height * 0.7; 
        
        // Emulate a Radio Button Group
        const createRadioBtn = (x: number, y: number, label: string, value: string, isSelected: boolean) => {
            const container = this.add.container(x, y);
            
            // Outer ring
            const outerCircle = this.add.graphics();
            outerCircle.lineStyle(2, 0x00d4ff, 1);
            outerCircle.strokeCircle(0, 0, 15);
            
            // Inner dot
            const innerDot = this.add.graphics();
            innerDot.fillStyle(0x00d4ff, 1);
            innerDot.fillCircle(0, 0, 8);
            innerDot.setVisible(isSelected);
            
            // Label
            const text = this.add.text(25, 0, label, {
                fontSize: '24px',
                fontFamily: "'Noto Sans SC', sans-serif",
                color: '#ffffff'
            }).setOrigin(0, 0.5);
            
            // Hit Zone
            const hitZoneWidth = 40 + text.width;
            const hitZone = this.add.rectangle(hitZoneWidth/2 - 20, 0, hitZoneWidth, 40, 0x000, 0)
                .setInteractive({ useHandCursor: true });
                
            container.add([outerCircle, innerDot, text, hitZone]);
            
            return { container, innerDot, value, hitZone };
        };

        const easyBtn = createRadioBtn(width/2 - 120, difficultyY, '简单模式', 'SIMPLE', true);
        const hardBtn = createRadioBtn(width/2 + 50, difficultyY, '困难模式', 'HARD', false);
        
        const updateSelection = (val: 'SIMPLE' | 'HARD') => {
            selectedDifficulty = val;
            easyBtn.innerDot.setVisible(val === 'SIMPLE');
            hardBtn.innerDot.setVisible(val === 'HARD');
            audioManager.play('paddle'); // Some UI click sound
        };

        easyBtn.hitZone.on('pointerdown', () => updateSelection('SIMPLE'));
        hardBtn.hitZone.on('pointerdown', () => updateSelection('HARD'));

        // ============================================
        // BUTTONS
        // ============================================
        const btnY = height * 0.45;

        // Primary Button
        this.startBtn = new UIButton(this, width / 2, btnY, {
            label: '开始游戏',
            isPrimary: true,
            onClick: () => {
                audioManager.play('launch');
                this.scene.start('GameScene', { difficulty: selectedDifficulty });
            }
        });
        this.add.existing(this.startBtn);

        // Secondary Button (Help)
        const helpBtn = new UIButton(this, width / 2, btnY + 80, {
            label: '游戏帮助',
            isPrimary: false,
            onClick: () => {
                this.scene.start(SCENE_KEYS.HELP);
            }
        });
        this.add.existing(helpBtn);

        // ============================================
        // FOOTER LINK
        // ============================================
        this.homepageLink = this.add.text(width / 2, height * 0.9, '访问我的个人主页', {
            fontSize: '24px',
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

        this.homepageLink.setPosition(width / 2, height * 0.9);
    }

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
