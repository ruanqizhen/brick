import Phaser from 'phaser';
import { PhaserConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { PauseMenu } from './scenes/PauseMenu';

const config = {
    ...PhaserConfig,
    scene: [BootScene, MenuScene, GameScene, GameOverScene, PauseMenu]
};

new Phaser.Game(config);
