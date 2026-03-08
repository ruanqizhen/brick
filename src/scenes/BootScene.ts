import Phaser from 'phaser';
import { audioManager } from '../audio/AudioManager';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // 创建简单的加载进度条
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 25, width / 2, 50);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 4 + 10, height / 2 - 15, (width / 2 - 20) * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
        });

        // 暂时使用占位图形，不加载实际资源
        // 后续会在 GameScene 中动态生成纹理
    }

    create() {
        // 点击任意位置解锁音频（移动端必需）
        this.input.once('pointerdown', () => {
            audioManager.unlock();
        });

        // 显示提示
        const tapText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 100,
            'Tap to enable sound',
            { fontSize: '24px', color: '#888888' }
        ).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            tapText.destroy();
        });

        this.scene.start('MenuScene');
    }
}
