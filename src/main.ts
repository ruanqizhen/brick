import Phaser from 'phaser';
import { createPhaserConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { PauseMenu } from './scenes/PauseMenu';
import { LevelSelectScene } from './scenes/LevelSelectScene';

const initGame = () => {
    const config = createPhaserConfig();
    config.scene = [BootScene, MenuScene, GameScene, GameOverScene, PauseMenu, LevelSelectScene];
    new Phaser.Game(config);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}




