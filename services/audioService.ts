
// AUDIO SERVICE - HYBRID PRO VERSION
// Hỗ trợ: File MP3 + Synth Fallback + Separate Volume Controls

type SoundType = 'correct' | 'wrong' | 'miss' | 'levelup' | 'gameover';

class AudioManager {
    private bgmAudio: HTMLAudioElement | null = null;
    private audioContext: AudioContext | null = null;
    
    // Settings
    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.8;
    private isMuted: boolean = false;
    private isInitialized: boolean = false;

    // Cache buffers for SFX to avoid reloading
    private sfxBuffers: Record<string, AudioBuffer> = {};
    private filePaths: Record<SoundType, string> = {
         correct: '/sounds/correct.mp3',
        wrong: '/sounds/wrong.mp3',
        miss: '/sounds/miss.mp3',
        levelup: '/sounds/levelup.mp3',
        gameover: '/sounds/gameover.mp3'
    };

    constructor() {
        // Preload BGM via HTML5 Audio (Better for streaming long files)
        this.bgmAudio = new Audio('/sounds/bgm.mp3');
        this.bgmAudio.loop = true;
        this.updateBGMVolume();
    }

    public init() {
        if (this.isInitialized) return;

        // Initialize Web Audio API
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        
        // Load SFX Files
        this.preloadSFX();
        
        // Resume context if suspended (Browser policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isInitialized = true;
    }

    private async preloadSFX() {
        if (!this.audioContext) return;

        for (const [key, path] of Object.entries(this.filePaths)) {
            try {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sfxBuffers[key] = audioBuffer;
            } catch (error) {
                console.warn(`[AudioService] Failed to load ${path}. Switching to Synth for this sound.`);
            }
        }
    }

    // --- VOLUME CONTROLS ---

    public setMusicVolume(vol: number) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        this.updateBGMVolume();
    }

    public setSFXVolume(vol: number) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateBGMVolume();
        return this.isMuted;
    }

    public getSettings() {
        return {
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMuted: this.isMuted
        };
    }

    private updateBGMVolume() {
        if (this.bgmAudio) {
            this.bgmAudio.volume = this.isMuted ? 0 : this.musicVolume;
        }
    }

    // --- PLAYBACK ---

    public playBGM() {
        if (!this.bgmAudio) return;
        this.bgmAudio.currentTime = 0;
        this.bgmAudio.play().catch(e => console.log("Waiting for user interaction..."));
    }

    public stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }
    }

    public playSFX(type: SoundType) {
        if (this.isMuted || !this.audioContext) return;
        if (this.audioContext.state === 'suspended') this.audioContext.resume();

        const buffer = this.sfxBuffers[type];

        if (buffer) {
            // 1. Play from File
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = this.sfxVolume;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            source.start(0);
        } else {
            // 2. Fallback to Synthesizer (Code-generated sound)
            this.playSynth(type);
        }
    }

    // --- SYNTHESIZER (FALLBACK) ---
    // Tạo âm thanh 8-bit bằng code khi không có file mp3
    private playSynth(type: SoundType) {
        if (!this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;
        const vol = this.sfxVolume;

        switch (type) {
            case 'correct': // High ping
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'wrong': // Low buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'miss': // Noise thud (simulated with low square)
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'levelup': // Power up slide
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(880, now + 0.5);
                gain.gain.setValueAtTime(vol * 0.5, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'gameover': // Power down
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(55, now + 1);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 1);
                osc.start(now);
                osc.stop(now + 1);
                break;
        }
    }
}

export const audioService = new AudioManager();
