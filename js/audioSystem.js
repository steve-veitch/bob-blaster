/**
 * Audio System for BPSS v3
 * Manages all game sounds and music with volume controls
 */

class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.enabled = true;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        // Load settings from localStorage
        this.loadSettings();
        
        // Initialize Web Audio API context
        this.audioContext = null;
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    /**
     * Load audio settings from localStorage
     */
    loadSettings() {
        const settings = localStorage.getItem('bpss_audio_settings');
        if (settings) {
            const parsed = JSON.parse(settings);
            this.enabled = parsed.enabled !== false;
            this.masterVolume = parsed.masterVolume ?? 0.7;
            this.sfxVolume = parsed.sfxVolume ?? 0.8;
            this.musicVolume = parsed.musicVolume ?? 0.5;
        }
    }

    /**
     * Save audio settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('bpss_audio_settings', JSON.stringify({
            enabled: this.enabled,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume
        }));
    }

    /**
     * Generate procedural sound using Web Audio API
     * Used as fallback when audio files aren't available
     */
    generateSound(type) {
        if (!this.audioContext) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        switch(type) {
            case 'shoot':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                break;
            
            case 'hit':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.15);
                gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                break;
            
            case 'damage':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                break;
            
            case 'powerup':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                break;
            
            case 'click':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                break;
            
            case 'gameover':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                break;
            
            case 'victory':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.15); // E5
                oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.3); // G5
                gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                break;
        }

        return { oscillator, gainNode, duration: 0.5 };
    }

    /**
     * Play a procedural sound effect
     */
    playProceduralSound(type) {
        if (!this.enabled || !this.audioContext) return;

        // Resume audio context if suspended
        this.resumeContext();

        const sound = this.generateSound(type);
        if (!sound) return;

        const volume = this.masterVolume * this.sfxVolume;
        sound.gainNode.gain.value *= volume;
        
        sound.oscillator.start(this.audioContext.currentTime);
        sound.oscillator.stop(this.audioContext.currentTime + sound.duration);
    }

    /**
     * Load an audio file (for future use when actual audio files are added)
     */
    async loadSound(name, path) {
        try {
            const audio = new Audio(path);
            audio.preload = 'auto';
            this.sounds[name] = audio;
            return true;
        } catch (e) {
            console.warn(`Failed to load sound: ${name}`, e);
            return false;
        }
    }

    /**
     * Resume audio context (required for browser autoplay policies)
     */
    resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * Play a sound effect
     */
    playSound(name) {
        if (!this.enabled) return;

        // Resume audio context if suspended (browser autoplay policy)
        this.resumeContext();

        // If sound file exists, play it
        if (this.sounds[name]) {
            const sound = this.sounds[name].cloneNode();
            sound.volume = this.masterVolume * this.sfxVolume;
            sound.play().catch(e => console.warn('Sound play failed:', e));
        } else {
            // Otherwise use procedural sound
            this.playProceduralSound(name);
        }
    }

    /**
     * Play background music (looping)
     */
    async playMusic(path) {
        if (!this.enabled) return;

        // Resume audio context if suspended
        this.resumeContext();

        try {
            if (this.music) {
                this.music.pause();
            }

            this.music = new Audio(path);
            this.music.loop = true;
            this.music.volume = this.masterVolume * this.musicVolume;
            await this.music.play();
        } catch (e) {
            console.warn('Music play failed:', e);
        }
    }

    /**
     * Stop background music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    /**
     * Pause background music
     */
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }

    /**
     * Resume background music
     */
    resumeMusic() {
        if (this.music && this.enabled) {
            // Resume audio context if suspended
            this.resumeContext();
            this.music.play().catch(e => console.warn('Music resume failed:', e));
        }
    }

    /**
     * Set master volume (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.masterVolume * this.musicVolume;
        }
        this.saveSettings();
    }

    /**
     * Set sound effects volume (0-1)
     */
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
    }

    /**
     * Set music volume (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.masterVolume * this.musicVolume;
        }
        this.saveSettings();
    }

    /**
     * Toggle audio on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopMusic();
        }
        this.saveSettings();
        return this.enabled;
    }

    /**
     * Enable audio
     */
    enable() {
        this.enabled = true;
        this.saveSettings();
    }

    /**
     * Disable audio
     */
    disable() {
        this.enabled = false;
        this.stopMusic();
        this.saveSettings();
    }
}

// Create global audio system instance
const audioSystem = new AudioSystem();

// Made with Bob
