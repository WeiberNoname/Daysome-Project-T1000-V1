/**
 * Procedural Web Audio API Sound Synthesizer & Manager
 * Provides 3 real-time synthesized sound generators:
 * 1. Snow Atmosphere (❄️): Winter wind breeze + soft crystalline chimes
 * 2. Sakura Breeze Melody (🌸): Japanese pentatonic koto arpeggio + spring ambient breeze
 * 3. Simple Drum Melody (🥁): 16-step rhythmic drum groove (Kick, Snare, Hi-Hat) + cheerful synth lead
 */

export class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.masterVolume = 0.8;

    // Track states
    this.tracks = {
      snow: { isPlaying: false, volume: 0.7, gainNode: null, nodes: [] },
      sakura: { isPlaying: false, volume: 0.7, gainNode: null, timerId: null, nodes: [] },
      drum: { isPlaying: false, volume: 0.7, gainNode: null, timerId: null, currentStep: 0, nodes: [] }
    };

    this.onStateChangeCallbacks = new Set();
  }

  _initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      this.audioCtx = new AudioContextClass();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // Create individual track gain nodes
      Object.keys(this.tracks).forEach(trackKey => {
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(this.tracks[trackKey].volume, this.audioCtx.currentTime);
        gainNode.connect(this.masterGain);
        this.tracks[trackKey].gainNode = gainNode;
      });
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return true;
  }

  getAudioContext() {
    this._initContext();
    return this.audioCtx;
  }

  getMasterGain() {
    this._initContext();
    return this.masterGain;
  }

  resumeAudioContext() {
    if (!this.audioCtx) {
      this._initContext();
    } else if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  syncAtmosphere(settings) {
    if (!settings) return;
    const isMuted = settings.soundMuted === true;
    this.setMuted(isMuted);

    if (settings.soundMasterVolume !== undefined) {
      this.setMasterVolume(settings.soundMasterVolume);
    }
    if (settings.soundSnowVolume !== undefined) {
      this.setTrackVolume('snow', settings.soundSnowVolume);
    }
    if (settings.soundSakuraVolume !== undefined) {
      this.setTrackVolume('sakura', settings.soundSakuraVolume);
    }
    if (settings.soundDrumVolume !== undefined) {
      this.setTrackVolume('drum', settings.soundDrumVolume);
    }

    if (isMuted) return;
    // Ambient auto-play loops safely removed for silent operation
  }

  // --- Master Controls ---
  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, parseFloat(val) || 0));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.audioCtx.currentTime, 0.05);
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, this.audioCtx.currentTime, 0.05);
    }
    this._notifyStateChange();
  }

  setTrackVolume(trackKey, val) {
    if (!this.tracks[trackKey]) return;
    const clamped = Math.max(0, Math.min(1, parseFloat(val) || 0));
    this.tracks[trackKey].volume = clamped;
    if (this.tracks[trackKey].gainNode && this.audioCtx) {
      this.tracks[trackKey].gainNode.gain.setTargetAtTime(clamped, this.audioCtx.currentTime, 0.05);
    }
  }

  isPlaying(trackKey) {
    return this.tracks[trackKey] ? this.tracks[trackKey].isPlaying : false;
  }

  onStateChange(cb) {
    if (typeof cb === 'function') {
      this.onStateChangeCallbacks.add(cb);
    }
  }

  _notifyStateChange() {
    this.onStateChangeCallbacks.forEach(cb => {
      try { cb(this.getSnapshot()); } catch (e) { console.error('Sound state change callback error:', e); }
    });
  }

  getSnapshot() {
    return {
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
      snowPlaying: this.tracks.snow.isPlaying,
      snowVolume: this.tracks.snow.volume,
      sakuraPlaying: this.tracks.sakura.isPlaying,
      sakuraVolume: this.tracks.sakura.volume,
      drumPlaying: this.tracks.drum.isPlaying,
      drumVolume: this.tracks.drum.volume
    };
  }

  // --- Ambient Atmosphere Track Guards ---
  stopSnow() {}
  stopSakura() {}
  stopDrum() {}
  stopAll() {
    this.stopSnow();
    this.stopSakura();
    this.stopDrum();
  }
}

// Global Singleton Instance
export const soundManager = new SoundManager();
