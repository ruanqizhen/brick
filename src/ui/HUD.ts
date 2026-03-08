import Phaser from 'phaser';

export class HUD extends Phaser.GameObjects.Container {
    private scoreText: Phaser.GameObjects.Text;
    private livesText: Phaser.GameObjects.Text;
    private score: number = 0;
    private lives: number = 3;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        const style = { fontSize: '32px', color: '#ffffff' };

        this.scoreText = scene.add.text(20, 20, 'SCORE: 0', style);
        this.livesText = scene.add.text(scene.cameras.main.width - 200, 20, 'LIVES: 3', style);

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

    get getScore(): number {
        return this.score;
    }
}
