/**
 * SaveManager - IndexedDB based persistent storage
 * Handles game save data including high scores, unlocked levels, and settings
 */

export interface GameSaveData {
    highScore: number;
    currentLevel: number;
    unlockedLevels: number[];
    totalGamesPlayed: number;
    totalGamesWon: number;
    lastPlayed: number;
    difficulty: 'SIMPLE' | 'HARD';
    lastPlayedLevel: number;
}

const DB_NAME = 'BrickBreakerDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameSave';

export class SaveManager {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize IndexedDB connection
     */
    async init(): Promise<void> {
        if (this.db) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('SaveManager: Failed to open IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });

        return this.initPromise;
    }

    /**
     * Save game data
     */
    async save(data: Partial<GameSaveData>): Promise<void> {
        await this.init();
        if (!this.db) return;

        return new Promise((resolve, reject) => {
            const db = this.db!;
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Get existing data and merge with new data
            const getRequest = store.get('save');

            getRequest.onsuccess = () => {
                const existingData = getRequest.result || {};
                const mergedData = { ...existingData, ...data, id: 'save' };

                const putRequest = store.put(mergedData);
                putRequest.onsuccess = () => resolve();
                putRequest.onerror = () => reject(putRequest.error);
            };

            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    /**
     * Load game data
     */
    async load(): Promise<GameSaveData | null> {
        await this.init();
        if (!this.db) return null;

        return new Promise((resolve, reject) => {
            const db = this.db!;
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('save');

            request.onsuccess = () => {
                const data = request.result;
                if (data) {
                    resolve({
                        highScore: Number(data.highScore) || 0,
                        currentLevel: Number(data.currentLevel) || 1,
                        unlockedLevels: (data.unlockedLevels || [1]).map(Number),
                        totalGamesPlayed: Number(data.totalGamesPlayed) || 0,
                        totalGamesWon: Number(data.totalGamesWon) || 0,
                        lastPlayed: Number(data.lastPlayed) || Date.now(),
                        difficulty: data.difficulty || 'SIMPLE',
                        lastPlayedLevel: Number(data.lastPlayedLevel) || Number(data.currentLevel) || 1
                    });
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get high score
     */
    async getHighScore(): Promise<number> {
        const data = await this.load();
        return data?.highScore || 0;
    }

    /**
     * Save high score (only if higher than current)
     */
    async saveHighScore(score: number): Promise<boolean> {
        const currentHigh = await this.getHighScore();
        if (score > currentHigh) {
            await this.save({ highScore: score });
            return true;
        }
        return false;
    }

    /**
     * Get current level
     */
    async getCurrentLevel(): Promise<number> {
        const data = await this.load();
        return data?.currentLevel || 1;
    }

    /**
     * Save current level progress
     */
    async saveLevel(level: number): Promise<void> {
        const data = await this.load();
        const currentLevel = data?.currentLevel || 1;
        const unlockedLevels = data?.unlockedLevels || [1];

        // Update current level if higher
        const newCurrentLevel = Math.max(currentLevel, level);
        
        // Update unlocked levels
        if (!unlockedLevels.includes(level)) {
            unlockedLevels.push(level);
            unlockedLevels.sort((a, b) => a - b);
        }

        await this.save({ 
            currentLevel: newCurrentLevel,
            unlockedLevels,
            lastPlayedLevel: level // Always update last played to the requested level
        });
    }

    /**
     * Record game played
     */
    async recordGame(won: boolean): Promise<void> {
        const data = await this.load();
        await this.save({
            totalGamesPlayed: (data?.totalGamesPlayed || 0) + 1,
            totalGamesWon: (data?.totalGamesWon || 0) + (won ? 1 : 0),
            lastPlayed: Date.now()
        });
    }

    /**
     * Get the last level the user was actually playing
     */
    async getLastPlayedLevel(): Promise<number> {
        const data = await this.load();
        return data?.lastPlayedLevel || data?.currentLevel || 1;
    }

    /**
     * Get preferred difficulty
     */
    async getDifficulty(): Promise<'SIMPLE' | 'HARD'> {
        const data = await this.load();
        return data?.difficulty || 'SIMPLE';
    }

    /**
     * Save preferred difficulty
     */
    async saveDifficulty(difficulty: 'SIMPLE' | 'HARD'): Promise<void> {
        await this.save({ difficulty });
    }
}

// Global singleton instance
export const saveManager = new SaveManager();
