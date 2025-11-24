
// AUDIO SERVICE
// Quản lý toàn bộ âm thanh trong game

type SoundType = 'bgm' | 'correct' | 'wrong' | 'miss' | 'levelup' | 'gameover';

class AudioManager {
    private sounds: Record<SoundType, string> = {
        bgm: '/sounds/bgm.mp3',
        correct: '/sounds/correct.mp3',
        wrong: '/sounds/wrong.mp3',
        miss: '/sounds/miss.mp3',
        levelup: '/sounds/levelup.mp3',
        gameover: '/sounds/gameover.mp3'
    };

    private bgmAudio: HTMLAudioElement | null = null;
    private isMuted: boolean = false;

    constructor() {
        // Preload BGM
        this.bgmAudio = new Audio(this.sounds.bgm);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.3; // Nhạc nền nhỏ thôi để nghe SFX
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgmAudio) {
            this.bgmAudio.muted = this.isMuted;
        }
        return this.isMuted;
    }

    public playBGM() {
        if (!this.bgmAudio) return;
        this.bgmAudio.currentTime = 0;
        this.bgmAudio.play().catch(e => console.log("Audio play failed (user interaction needed):", e));
    }

    public stopBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
        }
    }

    public playSFX(type: Exclude<SoundType, 'bgm'>) {
        if (this.isMuted) return;

        const src = this.sounds[type];
        const audio = new Audio(src);

        // Volume adjustment per type
        if (type === 'correct') audio.volume = 0.6;
        if (type === 'wrong') audio.volume = 0.8;
        if (type === 'miss') audio.volume = 1.0;
        if (type === 'levelup') audio.volume = 0.7;

        // Clone node trick is not needed with new Audio() every time, 
        // but new Audio() allows overlapping sounds (polyphony) which is what we want.
        audio.play().catch(() => {
            // Ignore errors if file not found
        });
    }
}

export const audioService = new AudioManager();
