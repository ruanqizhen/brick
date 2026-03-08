/**
 * AudioManager - Web Audio API based sound system
 * Handles procedural sound effects and BGM with mobile audio unlock
 */

export type SoundVariant = 'normal' | 'hard' | 'indestructible' | 'paddle' | 'powerup' | 'ballLost' | 'launch' | 'win' | 'lose';

export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private bgmSource: AudioBufferSourceNode | null = null;
    private bgmGain: GainNode | null = null;
    private volume: number = 0.5;
    private bgmVolume: number = 0.3;
    private isUnlocked: boolean = false;
    private isBGMPlaying: boolean = false;

    /**
     * Initialize the audio context (must be called on user interaction)
     */
    async unlock(): Promise<void> {
        if (this.isUnlocked) return;

        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = this.volume;
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
                // High-pitched short beep
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, this.ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.1);
                break;

            case 'hard':
                // Lower, more impactful sound
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(300, this.ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.25, this.ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
                oscillator.start(this.ctx.currentTime);
                oscillator.stop(this.ctx.currentTime + 0.15);
                break;

            case 'indestructible':
                // Metallic clang
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

        // Bouncy sound with slight pitch variation
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

        // Playful ascending arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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

        // Descending sad sound
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

        // Quick upward swoosh
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

        // Victory fanfare
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

        // Descending sad chord
        const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
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
     * Start background music (procedurally generated)
     */
    playBGM(): void {
        if (!this.isUnlocked || !this.ctx || !this.masterGain || this.isBGMPlaying) return;

        this.isBGMPlaying = true;
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.masterGain);
        this.bgmGain.gain.value = this.bgmVolume;

        // Create a simple ambient loop
        this.createAmbientLoop();
    }

    /**
     * Create procedural ambient BGM loop
     */
    private createAmbientLoop(): void {
        if (!this.ctx || !this.bgmGain) return;

        // Create a 4-bar ambient pattern
        const duration = 8; // seconds
        const sampleRate = this.ctx.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

        // Generate ambient pad sound
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / sampleRate;
                // Base frequency with slight detune between channels
                const baseFreq = channel === 0 ? 220 : 220.5; // A3
                const harmonic1 = Math.sin(2 * Math.PI * baseFreq * t) * 0.3;
                const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.15;
                const harmonic3 = Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.1;

                // Add slow LFO for ambient movement
                const lfo = Math.sin(2 * Math.PI * 0.25 * t);
                const envelope = 0.7 + 0.3 * lfo;

                // Add reverb-like decay
                const decay = Math.exp(-t * 0.3);

                data[i] = (harmonic1 + harmonic2 + harmonic3) * envelope * decay * 0.4;

                // Add some noise for texture
                if (Math.random() < 0.001) {
                    data[i] += (Math.random() - 0.5) * 0.1;
                }
            }
        }

        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = buffer;
        this.bgmSource.connect(this.bgmGain);
        this.bgmSource.loop = true;
        this.bgmSource.start();
    }

    /**
     * Stop background music
     */
    stopBGM(): void {
        if (this.bgmSource) {
            try {
                this.bgmSource.stop();
            } catch (e) {
                // Already stopped
            }
            this.bgmSource = null;
        }
        this.isBGMPlaying = false;
    }

    /**
     * Set master volume (0.0 - 1.0)
     */
    setVolume(v: number): void {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    /**
     * Set BGM volume (0.0 - 1.0)
     */
    setBGMVolume(v: number): void {
        this.bgmVolume = Math.max(0, Math.min(1, v));
        if (this.bgmGain) {
            this.bgmGain.gain.value = this.bgmVolume;
        }
    }

    /**
     * Get current volume
     */
    getVolume(): number {
        return this.volume;
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
        this.stopBGM();
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
        }
        this.ctx = null;
        this.masterGain = null;
        this.bgmGain = null;
        this.isUnlocked = false;
    }
}

// Global singleton instance
export const audioManager = new AudioManager();
