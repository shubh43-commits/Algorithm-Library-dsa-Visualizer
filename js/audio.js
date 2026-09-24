/**
 * ============================================================================
 * Algorithm Library - Audio Synthesizer (audio.js)
 * ============================================================================
 * Generates tranquil, harmonic auditory feedback for array element interactions
 * (comparisons, swaps, reads) using the Web Audio API. Designed with a warm,
 * marimba-like acoustic tone to match the quiet Zen Library aesthetic.
 */

function safeGet(key, defVal) {
    try {
        const val = localStorage.getItem(key);
        return val !== null ? val : defVal;
    } catch (e) {
        return defVal;
    }
}

function safeSet(key, val) {
    try {
        localStorage.setItem(key, val);
    } catch (e) {}
}

class SoundSynthesizer {
    constructor() {
        this.ctx = null;
        this.isMuted = safeGet('algolib_muted', 'false') === 'true';
        this.baseFreq = 220; // A3 (warm fundamental)
        this.maxFreq = 880;  // A5 (crystal chime peak)
        this.volume = 0.12;  // Gentle, non-intrusive volume level
        this.initListeners();
    }

    /**
     * Initializes AudioContext on first user interaction to satisfy browser autoplay policies.
     */
    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initListeners() {
        // Resume context on any first touch or keypress
        const unlock = () => {
            this.initContext();
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
    }

    /**
     * Plays a pitched tone mapped linearly or logarithmically from array value.
     * @param {number} val - Current element value
     * @param {number} min - Minimum value in array
     * @param {number} max - Maximum value in array
     * @param {string} type - 'compare', 'swap', 'sorted', or 'read'
     */
    playTone(val, min = 5, max = 100, type = 'compare') {
        if (this.isMuted) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            // Frequency interpolation
            const range = Math.max(1, max - min);
            const normalized = Math.max(0, Math.min(1, (val - min) / range));
            const freq = this.baseFreq + normalized * (this.maxFreq - this.baseFreq);

            // Shape oscillator wave and warm low-pass filter
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, now);

            if (type === 'swap') {
                osc.type = 'triangle'; // Slightly richer timbre for swaps
                gain.gain.setValueAtTime(this.volume * 1.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
            } else if (type === 'sorted') {
                osc.type = 'sine';
                gain.gain.setValueAtTime(this.volume * 0.9, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            } else {
                // 'compare' or 'read'
                osc.type = 'sine';
                gain.gain.setValueAtTime(this.volume * 0.7, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            }

            osc.frequency.setValueAtTime(freq, now);

            // Audio node routing: Osc -> Filter -> Gain -> Destination
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            // Silently ignore audio context hiccups on rapid seek
        }
    }

    /**
     * Toggles mute state and returns current state.
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        safeSet('algolib_muted', this.isMuted);
        return this.isMuted;
    }
}

// Global audio synthesizer instance
window.soundSynth = new SoundSynthesizer();
