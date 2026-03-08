/**
 * AudioManager - Web Audio API based sound system
 * Handles procedural sound effects with mobile audio unlock
 */

export type SoundVariant = 'normal' | 'hard' | 'indestructible' | 'paddle' | 'powerup' | 'ballLost' | 'launch' | 'win' | 'lose';

export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private isUnlocked: boolean = false;

    /**
     * Initialize the audio context (must be called on user interaction)
     */
    async unlock(): Promise<void> {
        if (this.isUnlocked) return;

        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.5; // Default volume
            this.isUnlocked = true;

            // Resume context if suspended (mobile requirement)
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
        } catch (error) {
            console.warn('AudioManager: Web Audio API not supported:', error);
        }
    }

    /**
     * Play a sound effect based on variant
     */
    play(variant: SoundVariant): void {
        if (!this.isUnlocked || !this.ctx) return;

        switch (variant) {
            case 'normal':
                this.playBrickHit('normal');
                break;
            case 'hard':
                this.playBrickHit('hard');
                break;
            case 'indestructible':
                this.playBrickHit('indestructible');
                break;
            case 'paddle':
                this.playPaddleHit();
                break;
            case 'powerup':
                this.playPowerUpCollect();
                break;
            case 'ballLost':
                this.playBallLost();
                break;
            case 'launch':
                this.playLaunch();
                break;
            case 'win':
                this.playWin();
                break;
            case 'lose':
                this.playLose();
                break;
        }
    }

    /**
     * Play brick hit sound with variant
     */
    private playBrickHit(type: 'normal' | 'hard' | 'indestructible'): void {
        if (!this.ctx || !this.masterGain) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        switch (type) {
            case 'normal':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, this.ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.1);
                break;

            case 'hard':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(300, this.ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.15);
                break;

            case 'indestructible':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(1200, this.ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.2);
                break;
        }
    }

    /**
     * Play paddle hit sound
     */
    private playPaddleHit(): void {
        if (!this.ctx || !this.masterGain) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, this.ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        oscillator.start(this.ctx.currentTime);
        oscillator.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Play power-up collect sound
     */
    private playPowerUpCollect(): void {
        if (!this.ctx || !this.masterGain) return;

        const notes = [523.25, 659.25, 783.99, 1046.50];
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const oscillator = this.ctx!.createOscillator();
            const gainNode = this.ctx!.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain!);

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            const startTime = now + i * 0.08;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.12);
        });
    }

    /**
     * Play ball lost sound
     */
    private playBallLost(): void {
        if (!this.ctx || !this.masterGain) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, this.ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        oscillator.start(this.ctx.currentTime);
        oscillator.stop(this.ctx.currentTime + 0.4);
    }

    /**
     * Play ball launch sound
     */
    private playLaunch(): void {
        if (!this.ctx || !this.masterGain) return;

        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        oscillator.start(this.ctx.currentTime);
        oscillator.stop(this.ctx.currentTime + 0.15);
    }

    /**
     * Play win/completion sound
     */
    private playWin(): void {
        if (!this.ctx || !this.masterGain) return;

        const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const oscillator = this.ctx!.createOscillator();
            const gainNode = this.ctx!.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain!);

            oscillator.type = 'triangle';
            oscillator.frequency.value = freq;

            const startTime = now + i * 0.12;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.18);
        });
    }

    /**
     * Play lose/game over sound
     */
    private playLose(): void {
        if (!this.ctx || !this.masterGain) return;

        const notes = [392.00, 349.23, 311.13, 261.63];
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const oscillator = this.ctx!.createOscillator();
            const gainNode = this.ctx!.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain!);

            oscillator.type = 'sawtooth';
            oscillator.frequency.value = freq;

            const startTime = now + i * 0.2;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.35);
        });
    }

    /**
     * Check if audio is unlocked and ready
     */
    isReady(): boolean {
        return this.isUnlocked && this.ctx !== null;
    }

    /**
     * Cleanup audio context
     */
    dispose(): void {
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
        }
        this.ctx = null;
        this.masterGain = null;
        this.isUnlocked = false;
    }
}

// Global singleton instance
export const audioManager = new AudioManager();
