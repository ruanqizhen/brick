import Phaser from 'phaser';
import { PhaserConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

const config = {
    ...PhaserConfig,
    scene: [BootScene, MenuScene, GameScene]
};

new Phaser.Game(config);
