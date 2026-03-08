import Phaser from 'phaser';
import { DESIGN_WIDTH, DESIGN_HEIGHT } from '../config/GameConfig';
import { audioManager } from '../audio/AudioManager';

export class MenuScene extends Phaser.Scene {
    private bgmToggle!: Phaser.GameObjects.Text;
    private volumeSlider!: Phaser.GameObjects.Container;
    private isBGMPlaying: boolean = false;

    constructor() {
        super('MenuScene');
    }

    create() {
        // Unlock audio on first interaction
        this.input.once('pointerdown', () => {
            audioManager.unlock();
        });

        const title = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.25, 'BRICK BREAKER', {
            fontSize: '84px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const startBtn = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.5, 'START GAME', {
            fontSize: '48px',
            color: '#FFFFFF',
            backgroundColor: '#333333',
            padding: { x: 40, y: 20 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startBtn.on('pointerdown', () => {
            audioManager.playBGM();
            this.isBGMPlaying = true;
            this.scene.start('GameScene');
        });

        startBtn.on('pointerover', () => startBtn.setStyle({ backgroundColor: '#555555' }));
        startBtn.on('pointerout', () => startBtn.setStyle({ backgroundColor: '#333333' }));

        // BGM Toggle
        this.bgmToggle = this.add.text(DESIGN_WIDTH / 2, DESIGN_HEIGHT * 0.65, 'BGM: OFF', {
            fontSize: '32px',
            color: '#FFFFFF',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.bgmToggle.on('pointerdown', () => {
            this.isBGMPlaying = !this.isBGMPlaying;
            if (this.isBGMPlaying) {
                audioManager.playBGM();
                this.bgmToggle.setText('BGM: ON');
            } else {
                audioManager.stopBGM();
                this.bgmToggle.setText('BGM: OFF');
            }
        });

        this.bgmToggle.on('pointerover', () => this.bgmToggle.setStyle({ backgroundColor: '#555555' }));
        this.bgmToggle.on('pointerout', () => this.bgmToggle.setStyle({ backgroundColor: '#333333' }));

        // Volume control
        this.createVolumeSlider();
    }

    private createVolumeSlider() {
        const sliderX = DESIGN_WIDTH / 2;
        const sliderY = DESIGN_HEIGHT * 0.75;

        this.volumeSlider = this.add.container(sliderX, sliderY);

        // Label
        const label = this.add.text(0, -40, 'MASTER VOLUME', {
            fontSize: '28px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // Background
        const bg = this.add.rectangle(0, 0, 400, 20, 0x333333);
        bg.setOrigin(0.5);

        // Fill (volume indicator)
        const fill = this.add.rectangle(-190, 0, 0, 20, 0x00ff00);
        fill.setOrigin(0, 0.5);

        // Handle
        const handle = this.add.ellipse(-190, 0, 30, 30, 0xffffff);
        handle.setInteractive({ useHandCursor: true });

        this.volumeSlider.add([label, bg, fill, handle]);

        // Update fill based on current volume
        const currentVolume = audioManager.getVolume();
        this.updateVolumeVisuals(fill, handle, currentVolume);

        // Drag functionality
        handle.on('drag', (pointer: Phaser.Input.Pointer) => {
            const newX = Phaser.Math.Clamp(pointer.x - sliderX, -190, 190);
            handle.x = newX;
            fill.width = newX + 190;
            
            const volume = (newX + 190) / 380;
            audioManager.setVolume(volume);

            // Color change based on volume
            if (volume < 0.33) {
                fill.setFillStyle(0xff0000);
            } else if (volume < 0.66) {
                fill.setFillStyle(0xffff00);
            } else {
                fill.setFillStyle(0x00ff00);
            }
        });

        // Click on slider to jump to position
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const newX = Phaser.Math.Clamp(pointer.x - sliderX, -190, 190);
            handle.x = newX;
            fill.width = newX + 190;
            
            const volume = (newX + 190) / 380;
            audioManager.setVolume(volume);

            if (volume < 0.33) {
                fill.setFillStyle(0xff0000);
            } else if (volume < 0.66) {
                fill.setFillStyle(0xffff00);
            } else {
                fill.setFillStyle(0x00ff00);
            }
        });
    }

    private updateVolumeVisuals(fill: Phaser.GameObjects.Rectangle, handle: Phaser.GameObjects.Ellipse, volume: number) {
        const width = volume * 380;
        fill.width = width;
        handle.x = -190 + width;

        if (volume < 0.33) {
            fill.setFillStyle(0xff0000);
        } else if (volume < 0.66) {
            fill.setFillStyle(0xffff00);
        } else {
            fill.setFillStyle(0x00ff00);
        }
    }

    shutdown() {
        // Stop BGM when leaving menu
        if (!this.isBGMPlaying) {
            audioManager.stopBGM();
        }
    }
}
