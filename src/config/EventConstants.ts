/**
 * Centralized event constants for consistent event management
 * Using constants prevents typos and makes refactoring easier
 */

export const SCENE_KEYS = {
    BOOT: 'BootScene',
    MENU: 'MenuScene',
    GAME: 'GameScene',
    GAME_OVER: 'GameOverScene',
    PAUSE: 'PauseMenu',
} as const;

export const GAME_EVENTS = {
    // Pause menu events
    RESUME: 'resumeGame',
    RESTART: 'restartGame',
    GO_TO_MENU: 'goToMenu',

    // Game events
    BALL_LOST: 'ballLost',
    LEVEL_COMPLETE: 'levelComplete',
    POWER_UP_COLLECTED: 'powerUpCollected',

    // Audio events
    AUDIO_UNLOCK: 'audioUnlock',
} as const;

export const TEXTURE_KEYS = {
    BALL: 'ball',
    PADDLE: 'paddle',
    BRICK: 'brick',
    BRICK_METAL: 'brick_metal',
    PARTICLE: 'particle',
    POWERUP_PREFIX: 'powerup_',
} as const;

export const STORAGE_KEYS = {
    HIGH_SCORE: 'highScore',
    CURRENT_LEVEL: 'currentLevel',
    UNLOCKED_LEVELS: 'unlockedLevels',
    TOTAL_GAMES_PLAYED: 'totalGamesPlayed',
    TOTAL_GAMES_WON: 'totalGamesWon',
    SETTINGS: 'settings',
} as const;
