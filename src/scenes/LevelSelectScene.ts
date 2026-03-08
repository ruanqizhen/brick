import Phaser from 'phaser';
import { LEVELS, getDifficultyColor, getDifficultyLabel } from '../config/LevelData';
import { saveManager } from '../storage/SaveManager';
import { audioManager } from '../audio/AudioManager';

interface LevelSelectData {
    completedLevel: number;
    score: number;
}

export class LevelSelectScene extends Phaser.Scene {
    private completedLevel: number = 1;
    private score: number = 0;
    private levelButtons: Phaser.GameObjects.Container[] = [];
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
        super('LevelSelectScene');
    }

    init(data: LevelSelectData) {
        this.completedLevel = data.completedLevel || 1;
        this.score = data.score || 0;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create background
        this.createBackground(width, height);

        // Title
        const title = this.add.text(width / 2, height * 0.08, '选择关卡', {
            fontSize: '56px',
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

        // Completed message
        const completedText = this.add.text(width / 2, height * 0.14,
            `🎉 第 ${this.completedLevel} 关 完成！得分：${this.score.toLocaleString()}`, {
            fontSize: '28px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Load unlocked levels - async but non-blocking for scene creation
        saveManager.load().then(saveData => {
            const unlockedLevels = saveData?.unlockedLevels || [1];
            const maxUnlocked = Math.max(...unlockedLevels, this.completedLevel);

            // Create level grid after data is loaded
            this.createLevelGrid(width, height * 0.55, maxUnlocked);
        });

        // Back button
        const backBtn = this.createButton(width / 2, height * 0.92, '返回菜单', 0x666666, 0x444444, () => {
            this.scene.start('MenuScene');
        });

        // Listen for resize
        this.scale.on('resize', this.handleResize, this);
    }

    private createBackground(width: number, height: number): void {
        // Dark gradient background
        const bg = this.add.rectangle(0, 0, width, height, 0x0a0a1a);
        bg.setOrigin(0);

        // Grid pattern
        this.add.grid(
            width / 2, height / 2,
            width, height,
            60, 60,
            0x1a1a3e, 0.2,
            0x0a0a1a, 0
        );

        // Floating particles
        this.particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            lifespan: 4000,
            speed: { min: 15, max: 35 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            quantity: 2,
            frequency: 150,
            tint: [0x00d4ff, 0x0099ff, 0x4CAF50]
        });
    }

    private createLevelGrid(centerX: number, centerY: number, maxUnlocked: number): void {
        const cols = 3;
        const rows = Math.ceil(LEVELS.length / cols);
        const cardWidth = 180;
        const cardHeight = 140;
        const gapX = 40;
        const gapY = 30;

        const totalWidth = cols * cardWidth + (cols - 1) * gapX;
        const totalHeight = rows * cardHeight + (rows - 1) * gapY;

        const startX = centerX - totalWidth / 2 + cardWidth / 2;
        const startY = centerY - totalHeight / 2 + cardHeight / 2;

        LEVELS.forEach((level, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (cardWidth + gapX);
            const y = startY + row * (cardHeight + gapY);

            const isUnlocked = level.id <= maxUnlocked;
            const isCompleted = level.id < maxUnlocked;
            const isNext = level.id === maxUnlocked;

            this.createLevelCard(x, y, cardWidth, cardHeight, level, isUnlocked, isCompleted, isNext);
        });
    }

    private createLevelCard(
        x: number, y: number, width: number, height: number,
        level: any, isUnlocked: boolean, isCompleted: boolean, isNext: boolean
    ): void {
        const container = this.add.container(x, y);

        // Card background
        const bg = this.add.rectangle(0, 0, width, height, isUnlocked ? 0x1a1a3e : 0x2a2a2a, isUnlocked ? 0.9 : 0.7);
        bg.setStrokeStyle(2, isUnlocked ? getDifficultyColor(level.difficulty) : 0x444444, isUnlocked ? 0.8 : 0.5);
        bg.setOrigin(0.5);

        // Glow effect for next level
        if (isNext && isUnlocked) {
            bg.setStrokeStyle(3, 0x00d4ff, 1);
            this.tweens.add({
                targets: bg,
                scaleX: { from: 1, to: 1.02 },
                scaleY: { from: 1, to: 1.02 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Level number
        const levelNum = this.add.text(0, -35, `第 ${level.id} 关`, {
            fontSize: '24px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: isUnlocked ? '#ffffff' : '#666666',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Level name
        const levelName = this.add.text(0, -5, level.name, {
            fontSize: '20px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: isUnlocked ? '#00d4ff' : '#666666',
            fontStyle: isUnlocked ? 'bold' : 'normal'
        }).setOrigin(0.5);

        // Difficulty badge
        const diffBadge = this.add.text(0, 25, getDifficultyLabel(level.difficulty), {
            fontSize: '14px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const diffBg = this.add.rectangle(0, 25, 70, 22, getDifficultyColor(level.difficulty), 0.8);
        diffBg.setStrokeStyle(1, 0xffffff, 0.5);
        diffBg.setOrigin(0.5);

        // Status icon
        let statusIcon: Phaser.GameObjects.Text | null = null;
        if (isCompleted) {
            statusIcon = this.add.text(60, -55, '✓', {
                fontSize: '20px',
                color: '#4CAF50',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        } else if (isNext) {
            statusIcon = this.add.text(60, -55, '▶', {
                fontSize: '20px',
                color: '#00d4ff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        } else if (!isUnlocked) {
            statusIcon = this.add.text(0, 0, '🔒', {
                fontSize: '40px'
            }).setOrigin(0.5);
        }

        container.add([bg, diffBg, levelNum, levelName, diffBadge]);
        if (statusIcon) container.add(statusIcon);

        // Make interactive if unlocked
        if (isUnlocked) {
            container.setSize(width, height);
            container.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

            container.on('pointerover', () => {
                if (!isNext) {
                    this.tweens.add({
                        targets: container,
                        scaleX: 1.05,
                        scaleY: 1.05,
                        duration: 200,
                        ease: 'Back.out'
                    });
                }
            });

            container.on('pointerout', () => {
                if (!isNext) {
                    this.tweens.add({
                        targets: container,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 200,
                        ease: 'Back.out'
                    });
                }
            });

            container.on('pointerdown', () => {
                audioManager.play('launch');
                this.startLevel(level.id);
            });
        }

        this.levelButtons.push(container);
    }

    private createButton(x: number, y: number, text: string, color1: number, color2: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const btnWidth = 200;
        const btnHeight = 50;

        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, color1);
        bg.setOrigin(0.5);
        bg.setStrokeStyle(2, 0xffffff, 0.5);

        const btnText = this.add.text(0, 0, text, {
            fontSize: '24px',
            fontFamily: '"Microsoft YaHei", sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([bg, btnText]);
        container.setSize(btnWidth, btnHeight);
        container.setInteractive(new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight), Phaser.Geom.Rectangle.Contains);

        bg.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Back.out'
            });
        });

        bg.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Back.out'
            });
        });

        bg.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100
            });
            callback();
        });

        return container;
    }

    private startLevel(levelId: number): void {
        // Save current level progress
        saveManager.saveLevel(levelId);

        // Start game with specific level
        const gameScene = this.scene.get('GameScene') as any;
        if (gameScene) {
            gameScene.currentLevelIndex = levelId - 1;
        }
        this.scene.start('GameScene', { level: levelId - 1 });
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;
        const height = gameSize.height;

        // Reposition elements (simplified - recreate scene on resize)
        this.scene.restart({
            completedLevel: this.completedLevel,
            score: this.score
        });
    }

    shutdown(): void {
        this.scale.off('resize', this.handleResize, this);
        if (this.particles) {
            this.particles.destroy();
        }
    }
}
