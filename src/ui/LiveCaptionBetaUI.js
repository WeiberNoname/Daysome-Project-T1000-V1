/**
 * LiveCaptionBetaUI.js
 * Controller for the Beta Live Caption Window in the Studio Tab.
 * Manages launching the independent floating caption HUD, broadcasting test subtitles,
 * and seamlessly routing Screen Vision reflections into the live caption window.
 */

import { soundManager } from '../core/SoundManager.js';

export class LiveCaptionBetaUI {
  constructor({ currentSettings = {}, saveSettingsFile = null } = {}) {
    this.currentSettings = currentSettings;
    this.saveSettingsFile = saveSettingsFile;

    this.btnLaunch = null;
    this.btnTest = null;
    this.btnClear = null;
    this.mirrorToggle = null;
    this.statusTag = null;
    this.lastBroadcastText = '';
  }

  init() {
    this.btnLaunch = document.getElementById('btn-beta-launch-caption-window');
    this.btnTest = document.getElementById('btn-beta-test-caption');
    this.btnClear = document.getElementById('btn-beta-clear-caption-window');
    this.mirrorToggle = document.getElementById('beta-caption-mirror-vision');
    this.statusTag = document.getElementById('beta-caption-hud-status');

    if (this.btnLaunch) {
      this.btnLaunch.addEventListener('click', () => {
        soundManager.playInteractionSfx();
        const api = window.electronAPI;
        if (api && typeof api.toggleLiveCaptionWindow === 'function') {
          api.toggleLiveCaptionWindow();
        } else if (api && typeof api.send === 'function') {
          api.send('toggle-live-caption-window');
        }
        this.updateStatus('🪟 Caption Window Toggled');
      });
    }

    if (this.btnTest) {
      this.btnTest.addEventListener('click', () => {
        soundManager.playFanfareSfx();
        this.broadcastSampleCaption();
      });
    }

    if (this.btnClear) {
      this.btnClear.addEventListener('click', () => {
        soundManager.playInteractionSfx();
        this.clearCaptionWindow();
      });
    }

    if (this.mirrorToggle) {
      this.mirrorToggle.checked = this.currentSettings.liveCaptionMirrorVision !== false;
      this.mirrorToggle.addEventListener('change', () => {
        this.currentSettings.liveCaptionMirrorVision = this.mirrorToggle.checked;
        if (this.saveSettingsFile) this.saveSettingsFile();
      });
    }

    // Auto-launch on boot if user configured it
    if (this.currentSettings.liveCaptionAutoOpen) {
      const api = window.electronAPI;
      if (api && typeof api.openLiveCaptionWindow === 'function') {
        api.openLiveCaptionWindow();
      }
    }
  }

  /**
   * Broadcasts a caption message to the floating caption window via IPC.
   * @param {Object} data - { text, model, source, durationMs, counter }
   */
  broadcastCaption(data) {
    if (!data || !data.text) return;
    this.lastBroadcastText = data.text;
    const api = window.electronAPI;
    if (api && typeof api.send === 'function') {
      api.send('broadcast-live-caption', {
        text: data.text,
        model: data.model || 'Local AI',
        source: data.source || 'VISION AI',
        durationMs: data.durationMs || 0,
        counter: data.counter || ''
      });
    }
    this.updateStatus(`📡 Subtitle Sent: "${data.text.slice(0, 30)}..."`);
  }

  /**
   * Broadcasts an instant test subtitle.
   */
  broadcastSampleCaption() {
    const samples = [
      'Visual scene observed: dynamic action in progress with high-contrast vibrant colors!',
      'Active workspace detected: multi-window multitasking with focused user interaction.',
      'Artwork and character visuals rendered cleanly across the scene.',
      'Smooth streaming gameplay detected with lively on-screen motion!'
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    this.broadcastCaption({
      text: pick,
      model: 'Test Streamer',
      source: 'DEMO',
      durationMs: 120
    });
  }

  /**
   * Clears the independent caption window.
   */
  clearCaptionWindow() {
    const api = window.electronAPI;
    if (api && typeof api.send === 'function') {
      api.send('clear-live-caption');
    }
    this.updateStatus('🧹 Caption Window Cleared');
  }

  updateStatus(msg) {
    if (this.statusTag) {
      this.statusTag.innerText = msg;
    }
  }
}

export let liveCaptionBetaUI = null;

export function setupLiveCaptionBetaUI(deps = {}) {
  liveCaptionBetaUI = new LiveCaptionBetaUI(deps);
  liveCaptionBetaUI.init();
  return liveCaptionBetaUI;
}
