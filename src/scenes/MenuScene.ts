import Phaser from 'phaser';
import { DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/GameConfig';
import { audioManager } from '../audio/AudioManager';
import { saveManager } from '../storage/SaveManager';

export class MenuScene extends Phaser.Scene {
    private highScoreText!: Phaser.GameObjects.Text;

    constructor() {
        super('MenuScene');
    }

    async create() {
        // Unlock audio on first interaction
        this.input.once('pointerdown', () => {
            audioManager.unlock();
        });

        const title = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.28, 'BRICK BREAKER', {
            fontSize: '84px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // High score display
        const highScore = await saveManager.getHighScore();
        this.highScoreText = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.43, 
            `HIGH SCORE: ${highScore.toLocaleString()}`, {
            fontSize: '32px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startBtn = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.52, 'START GAME', {
            fontSize: '48px',
            color: '#FFFFFF',
            backgroundColor: '#333333',
            padding: { x: 40, y: 20 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        startBtn.on('pointerover', () => startBtn.setStyle({ backgroundColor: '#555555' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ backgroundColor: '#333333' }));

        // Instructions
        const instructions = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.72, 
            'Mouse/Touch to move • Click to launch\nESC/P to pause', {
            fontSize: '24px',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);
    }
}
