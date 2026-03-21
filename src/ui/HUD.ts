import Phaser from 'phaser';

export class HUD extends Phaser.GameObjects.Container {
    private scLabel!: Phaser.GameObjects.Text;
    private scValue!: Phaser.GameObjects.Text;
    private lvLabel!: Phaser.GameObjects.Text;
    private lvValue!: Phaser.GameObjects.Text;
    private stLabel!: Phaser.GameObjects.Text;
    private stValue!: Phaser.GameObjects.Text;
    
    private scBg!: Phaser.GameObjects.Graphics;
    private lvBg!: Phaser.GameObjects.Graphics;
    private stBg!: Phaser.GameObjects.Graphics;

    private score: number = 0;
    private lives: number = 3;
    private difficulty: 'SIMPLE' | 'HARD' = 'SIMPLE';

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        const LABEL_STYLE = {
            fontSize: '14px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: 'rgba(255, 255, 255, 0.5)',
            fontStyle: 'bold'
        };

        const VALUE_STYLE = {
            fontSize: '24px',
            fontFamily: "'Noto Sans SC', sans-serif",
            color: '#FFFFFF',
            fontStyle: '700'
        };

        // --- Panel Backdrops ---
        this.scBg = this.createPanelBg(scene, 20, 10, 200, 50);
        this.lvBg = this.createPanelBg(scene, scene.cameras.main.width / 2 - 100, 10, 200, 50);
        this.stBg = this.createPanelBg(scene, scene.cameras.main.width - 320, 10, 300, 50);

        // --- Score Panel ---
        this.scLabel = scene.add.text(35, 22, '得分记录', LABEL_STYLE);
        this.scValue = scene.add.text(35, 36, '0', { ...VALUE_STYLE, color: '#ffcc00' });

        // --- Level Panel ---
        this.lvLabel = scene.add.text(scene.cameras.main.width / 2, 22, '当前关卡', LABEL_STYLE).setOrigin(0.5, 0);
        this.lvValue = scene.add.text(scene.cameras.main.width / 2, 36, '关卡 01', { ...VALUE_STYLE, color: '#00d4ff' }).setOrigin(0.5, 0);

        // --- Status Panel ---
        this.stLabel = scene.add.text(scene.cameras.main.width - 35, 22, '游戏状态', LABEL_STYLE).setOrigin(1, 0);
        this.stValue = scene.add.text(scene.cameras.main.width - 35, 36, '简单模式 | ♥ 3', VALUE_STYLE).setOrigin(1, 0);

        this.add([
            this.scBg, this.lvBg, this.stBg,
            this.scLabel, this.scValue,
            this.lvLabel, this.lvValue,
            this.stLabel, this.stValue
        ]);

        scene.add.existing(this);
        scene.scale.on('resize', this.handleResize, this);
    }

    private createPanelBg(scene: Phaser.Scene, x: number, y: number, w: number, h: number): Phaser.GameObjects.Graphics {
        const graphics = scene.add.graphics();
        // Cyberpunk frosted glass style
        graphics.fillStyle(0xffffff, 0.05);
        graphics.fillRoundedRect(x, y, w, h, 8);
        graphics.lineStyle(1, 0xffffff, 0.1);
        graphics.strokeRoundedRect(x, y, w, h, 8);
        return graphics;
    }

    updateScore(points: number) {
        this.score += points;
        this.scValue.setText(this.score.toLocaleString());
        
        // Quick subtle scale pulse
        this.scene.tweens.add({
            targets: this.scValue,
            scale: 1.1,
            duration: 50,
            yoyo: true
        });
    }

    updateLives(lives: number) {
        this.lives = lives;
        this.updateStatusText();
    }

    updateLevel(level: number) {
        const lvStr = level < 10 ? `0${level}` : `${level}`;
        this.lvValue.setText(`关卡 ${lvStr}`);
    }

    setDifficulty(difficulty: 'SIMPLE' | 'HARD') {
        this.difficulty = difficulty;
        this.updateStatusText();
    }

    private updateStatusText() {
        const mode = this.difficulty === 'HARD' ? '困难' : '简单';
        const hearts = '♥'.repeat(Math.max(0, this.lives));
        this.stValue.setText(`${mode}模式 | ${hearts} ${this.lives}`);
        
        // Color mode specifically
        const color = this.difficulty === 'HARD' ? '#ff3366' : '#00d4ff';
        this.stValue.setColor(color);
    }

    private handleResize(gameSize: Phaser.Structs.Size): void {
        const width = gameSize.width;

        // Reposition backgrounds
        this.scBg.clear();
        this.createPanelBgInto(this.scBg, 20, 10, 200, 50);
        
        this.lvBg.clear();
        this.createPanelBgInto(this.lvBg, width / 2 - 100, 10, 200, 50);
        
        this.stBg.clear();
        this.createPanelBgInto(this.stBg, width - 320, 10, 300, 50);

        // Reposition text
        this.scLabel.x = 35;
        this.scValue.x = 35;
        
        this.lvLabel.x = width / 2;
        this.lvValue.x = width / 2;
        
        this.stLabel.x = width - 35;
        this.stValue.x = width - 35;
    }

    private createPanelBgInto(graphics: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
        graphics.fillStyle(0xffffff, 0.05);
        graphics.fillRoundedRect(x, y, w, h, 8);
        graphics.lineStyle(1, 0xffffff, 0.1);
        graphics.strokeRoundedRect(x, y, w, h, 8);
    }

    get getScore(): number {
        return this.score;
    }

    shutdown(): void {
        // Clean up resize listener to prevent memory leaks
        this.scene.scale.off('resize', this.handleResize, this);
    }
}
