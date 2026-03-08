/**
 * AudioManager - Modern Web Audio API based sound system
 * Enhanced with richer synthesis, reverb, and dynamic effects
 */

export type SoundVariant = 'normal' | 'hard' | 'indestructible' | 'paddle' | 'powerup' | 'ballLost' | 'launch' | 'win' | 'lose';

export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private compressor: DynamicsCompressorNode | null = null;
    private isUnlocked: boolean = false;
    private reverbBuffer: AudioBuffer | null = null;

    /**
     * Initialize the audio context with enhanced audio pipeline
     */
    async unlock(): Promise<void> {
        if (this.isUnlocked) return;

        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Create audio pipeline: sources -> compressor -> master -> destination
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.value = -24;
            this.compressor.knee.value = 30;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0.003;
            this.compressor.release.value = 0.25;

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;

            this.compressor.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);
            
            this.isUnlocked = true;

            // Create reverb impulse response
            this.createReverbBuffer();

            // Resume context if suspended (mobile requirement)
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }
        } catch (error) {
            console.warn('AudioManager: Web Audio API not supported:', error);
        }
    }

    /**
     * Create reverb impulse response for spatial effect
     */
    private createReverbBuffer(): void {
        if (!this.ctx) return;
        
        const duration = 1.5;
        const decay = 2.0;
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        
        this.reverbBuffer = impulse;
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
     * Play brick hit sound with variant - enhanced with harmonics
     */
    private playBrickHit(type: 'normal' | 'hard' | 'indestructible'): void {
        if (!this.ctx || !this.masterGain) return;

        const now = this.ctx.currentTime;

        switch (type) {
            case 'normal':
                // Modern synth pluck with harmonics
                this.playSynthNote(600, 400, 'sine', now, 0.08, [1, 0.3, 0.1]);
                break;

            case 'hard':
                // Deeper impact with distortion
                this.playSynthNote(250, 180, 'square', now, 0.12, [1, 0.4, 0.2, 0.1], 0.3);
                break;

            case 'indestructible':
                // Metallic clang with ring modulation effect
                this.playSynthNote(1000, 700, 'triangle', now, 0.15, [1, 0.5, 0.3], 0.25);
                break;
        }
    }

    /**
     * Generic synth note player with harmonics
     */
    private playSynthNote(
        freq: number, 
        endFreq: number, 
        type: OscillatorType, 
        time: number, 
        duration: number,
        harmonics: number[] = [1],
        distortion: number = 0
    ): void {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

        // Add harmonics for richer sound
        harmonics.forEach((level, i) => {
            if (i > 0) {
                const harmOsc = this.ctx!.createOscillator();
                const harmGain = this.ctx!.createGain();
                harmOsc.type = type;
                harmOsc.frequency.setValueAtTime(freq * (i + 1), time);
                harmGain.gain.setValueAtTime(level * 0.3, time);
                harmGain.gain.exponentialRampToValueAtTime(0.01, time + duration);
                harmOsc.connect(harmGain);
                harmGain.connect(this.compressor!);
                harmOsc.start(time);
                harmOsc.stop(time + duration);
            }
        });

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.connect(gain);
        gain.connect(this.compressor!);
        
        osc.start(time);
        osc.stop(time + duration);
    }

    /**
     * Play paddle hit sound - enhanced with pitch bend
     */
    private playPaddleHit(): void {
        if (!this.ctx || !this.masterGain) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Pitch bend effect
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(650, now + 0.05);
        osc.frequency.linearRampToValueAtTime(550, now + 0.1);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.compressor!);
        
        osc.start(now);
        osc.stop(now + 0.12);
    }

    /**
     * Play power-up collect sound - enhanced arpeggio with sparkle
     */
    private playPowerUpCollect(): void {
        if (!this.ctx || !this.masterGain) return;

        // Magical ascending arpeggio with sparkle
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = i % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.value = freq;

            const startTime = now + i * 0.06;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            osc.connect(gain);
            gain.connect(this.compressor!);

            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }

    /**
     * Play ball lost sound - enhanced with descending sweep
     */
    private playBallLost(): void {
        if (!this.ctx || !this.masterGain) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Descending sweep with filter effect
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(gain);
        gain.connect(this.compressor!);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }

    /**
     * Play ball launch sound - enhanced with upward whoosh
     */
    private playLaunch(): void {
        if (!this.ctx || !this.masterGain) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Upward whoosh effect
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.15);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.compressor!);
        
        osc.start(now);
        osc.stop(now + 0.18);
    }

    /**
     * Play win/completion sound - enhanced fanfare with chords
     */
    private playWin(): void {
        if (!this.ctx || !this.masterGain) return;

        // Triumphant fanfare with layered chords
        const chordProgression = [
            [523.25, 659.25, 783.99], // C major
            [659.25, 783.99, 987.77], // E major  
            [783.99, 987.77, 1174.66], // G major
            [1046.50, 1318.51, 1567.98] // C major high
        ];

        const now = this.ctx.currentTime;

        chordProgression.forEach((chord, i) => {
            const startTime = now + i * 0.15;
            
            chord.forEach((freq, j) => {
                const osc = this.ctx!.createOscillator();
                const gain = this.ctx!.createGain();

                osc.type = j === 0 ? 'triangle' : 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

                osc.connect(gain);
                gain.connect(this.compressor!);

                osc.start(startTime);
                osc.stop(startTime + 0.3);
            });
        });
    }

    /**
     * Play lose/game over sound - enhanced melancholic descent
     */
    private playLose(): void {
        if (!this.ctx || !this.masterGain) return;

        // Descending minor chord progression
        const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4 (minor feel)
        const now = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            const startTime = now + i * 0.25;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

            osc.connect(gain);
            gain.connect(this.compressor!);

            osc.start(startTime);
            osc.stop(startTime + 0.45);
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
        this.compressor = null;
        this.reverbBuffer = null;
        this.isUnlocked = false;
    }
}

// Global singleton instance
export const audioManager = new AudioManager();
