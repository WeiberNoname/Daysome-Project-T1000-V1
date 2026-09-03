/**
 * SpeechSynthesisService.js
 * High-performance zero-latency offline Voice Synthesis (TTS) Engine.
 * Powered by native Web Speech API in Electron / Windows.
 * Automatically resolves localized voice packs, controls pitch/speed/volume,
 * and tracks real-time speaking state for mascot lip-sync animation.
 */

export class SpeechSynthesisService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeakingState = false;
    this.activeUtterance = null;
    this.onStateChangeCallbacks = new Set();

    if (this.synth) {
      this.loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return [];
    try {
      this.voices = this.synth.getVoices() || [];
    } catch (e) {
      this.voices = [];
    }
    return this.voices;
  }

  /**
   * Registers a callback for speech state changes (speaking vs silent).
   * @param {Function} cb - (isSpeaking: boolean) => void
   */
  onStateChange(cb) {
    if (typeof cb === 'function') {
      this.onStateChangeCallbacks.add(cb);
    }
  }

  /**
   * Unregisters a state change callback.
   */
  offStateChange(cb) {
    this.onStateChangeCallbacks.delete(cb);
  }

  _notifyState(isSpeaking) {
    this.isSpeakingState = isSpeaking;
    this.onStateChangeCallbacks.forEach(cb => {
      try {
        cb(isSpeaking);
      } catch (e) {
        console.error('[SpeechSynthesisService] Error in state callback:', e);
      }
    });
  }

  /**
   * Finds the best matching voice for a given language code.
   * @param {string} langCode - e.g. 'zh-TW', 'zh-CN', 'zh', 'ja', 'en', 'es', etc.
   * @returns {SpeechSynthesisVoice|null}
   */
  getBestVoice(langCode = 'en') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    if (!this.voices || this.voices.length === 0) return null;

    const norm = (langCode || 'en').toLowerCase().replace('_', '-');

    // 1. Exact BCP-47 match
    const exact = this.voices.find(v => v.lang.toLowerCase().replace('_', '-') === norm);
    if (exact) return exact;

    // 2. Specific script matches (e.g. zh-TW vs zh-CN)
    if (norm === 'zh-tw' || norm === 'zh-hant' || norm === 'tw') {
      const twVoice = this.voices.find(v => {
        const l = v.lang.toLowerCase();
        return l.includes('zh-tw') || l.includes('zh-hk') || l.includes('hant') || v.name.includes('Taiwan') || v.name.includes('Traditional');
      });
      if (twVoice) return twVoice;
    }

    if (norm === 'zh' || norm === 'zh-cn' || norm === 'zh-hans') {
      const cnVoice = this.voices.find(v => {
        const l = v.lang.toLowerCase();
        return l.includes('zh-cn') || l.includes('chinese') || v.name.includes('China') || v.name.includes('Mandarin');
      });
      if (cnVoice) return cnVoice;
    }

    // 3. Primary language code prefix (e.g. 'ja' matches 'ja-JP')
    const primary = norm.split('-')[0];
    const prefixMatch = this.voices.find(v => v.lang.toLowerCase().startsWith(primary));
    if (prefixMatch) return prefixMatch;

    // 4. Default voice
    return this.voices.find(v => v.default) || this.voices[0] || null;
  }

  /**
   * Speaks the provided text using native speech synthesis.
   * @param {string} text - Text to speak
   * @param {Object} options
   * @param {string} [options.language='auto']
   * @param {number} [options.pitch=1.0] - Range: 0.5 to 2.0
   * @param {number} [options.rate=1.0] - Range: 0.5 to 2.0
   * @param {number} [options.volume=1.0] - Range: 0.0 to 1.0
   * @param {Function} [options.onStart]
   * @param {Function} [options.onEnd]
   * @param {Function} [options.onError]
   */
  speak(text, {
    language = 'auto',
    pitch = 1.0,
    rate = 1.0,
    volume = 1.0,
    onStart = () => {},
    onEnd = () => {},
    onError = () => {}
  } = {}) {
    if (!this.synth || !text || !text.trim()) {
      return false;
    }

    // Stop any ongoing speech cleanly
    this.stop();

    const cleanText = text.replace(/[*_~`#\[\]\(\)]/g, '').trim();
    if (!cleanText) return false;

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voice = this.getBestVoice(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else if (language && language !== 'auto') {
        utterance.lang = language;
      }

      utterance.pitch = Math.max(0.5, Math.min(2.0, parseFloat(pitch) || 1.0));
      utterance.rate = Math.max(0.5, Math.min(2.0, parseFloat(rate) || 1.0));
      utterance.volume = Math.max(0.0, Math.min(1.0, parseFloat(volume) !== undefined ? parseFloat(volume) : 1.0));

      utterance.onstart = () => {
        this._notifyState(true);
        onStart();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        this._notifyState(false);
        onEnd();
      };

      utterance.onerror = (err) => {
        this.activeUtterance = null;
        this._notifyState(false);
        onError(err);
      };

      this.activeUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.error('[SpeechSynthesisService] Failed to speak utterance:', err);
      this._notifyState(false);
      return false;
    }
  }

  /**
   * Stops any currently playing speech synthesis.
   */
  stop() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
    } catch (e) {}
    this.activeUtterance = null;
    this._notifyState(false);
  }

  /**
   * Returns whether the speech engine is currently active.
   */
  isSpeaking() {
    return this.isSpeakingState || (this.synth ? this.synth.speaking : false);
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
