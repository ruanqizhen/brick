import Phaser from 'phaser';
import { PhaserConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config = {
    ...PhaserConfig,
    scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

new Phaser.Game(config);
