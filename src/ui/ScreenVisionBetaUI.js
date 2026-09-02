/**
 * ScreenVisionBetaUI.js
 * Controller for the Beta Screen Vision AI card in the Studio Tab.
 * Connects screen snapshot capture with local Ollama multimodal vision models,
 * visual thumbnail rendering, periodic automated screen analysis loop,
 * and live-chat reflection injection with audience reaction cascades.
 */

import { screenVisionService } from '../services/ScreenVisionService.js';
import { soundManager } from '../core/SoundManager.js';
import { liveAudienceAIService } from '../services/LiveAudienceAIService.js';

export class ScreenVisionBetaUI {
  constructor({ liveChatSim = null, currentSettings = {}, saveSettingsFile = null } = {}) {
    this.liveChatSim = liveChatSim;
    this.currentSettings = currentSettings;
    this.saveSettingsFile = saveSettingsFile;
    this.autoIntervalId = null;
    this.isAnalyzing = false;

    this.captureBtn = null;
    this.modelSelect = null;
    this.detailSelect = null;
    this.postChatCheckbox = null;
    this.autoLoopCheckbox = null;
    this.intervalInput = null;
    this.outputBox = null;
    this.statusTag = null;
    this.latencyTag = null;
    this.thumbnailImg = null;
    this.visionText = null;
  }

  init() {
    this.captureBtn = document.getElementById('btn-beta-capture-vision');
    this.modelSelect = document.getElementById('beta-vision-model');
    this.detailSelect = document.getElementById('beta-vision-detail');
    this.postChatCheckbox = document.getElementById('beta-vision-post-chat');
    this.autoLoopCheckbox = document.getElementById('beta-vision-autoloop');
    this.intervalInput = document.getElementById('beta-vision-interval');
    this.outputBox = document.getElementById('beta-vision-output-box');
    this.statusTag = document.getElementById('beta-vision-status-tag');
    this.latencyTag = document.getElementById('beta-vision-latency-tag');
    this.thumbnailImg = document.getElementById('beta-vision-thumbnail');
    this.visionText = document.getElementById('beta-vision-text');

    if (this.modelSelect && this.currentSettings.screenVisionModel) {
      this.modelSelect.value = this.currentSettings.screenVisionModel;
      this.modelSelect.addEventListener('change', () => {
        this.currentSettings.screenVisionModel = this.modelSelect.value;
        if (this.saveSettingsFile) this.saveSettingsFile();
      });
    }

    if (this.detailSelect) {
      if (this.currentSettings.screenVisionDetail) {
        this.detailSelect.value = this.currentSettings.screenVisionDetail;
      }
      this.detailSelect.addEventListener('change', () => {
        this.currentSettings.screenVisionDetail = this.detailSelect.value;
        if (this.saveSettingsFile) this.saveSettingsFile();
      });
    }

    if (this.postChatCheckbox) {
      this.postChatCheckbox.checked = this.currentSettings.screenVisionPostChat !== false;
      this.postChatCheckbox.addEventListener('change', () => {
        this.currentSettings.screenVisionPostChat = this.postChatCheckbox.checked;
        if (this.saveSettingsFile) this.saveSettingsFile();
      });
    }

    if (this.intervalInput) {
      const savedInterval = Math.max(5, Math.min(300, parseInt(this.currentSettings.screenVisionInterval, 10) || 10));
      this.intervalInput.value = savedInterval;
      this.intervalInput.addEventListener('input', () => {
        const val = Math.max(5, Math.min(300, parseInt(this.intervalInput.value, 10) || 10));
        this.currentSettings.screenVisionInterval = val;
        if (this.autoLoopCheckbox && this.autoLoopCheckbox.checked) {
          this.startAutoLoop();
        }
        if (this.saveSettingsFile) this.saveSettingsFile();
      });
    }

    if (this.autoLoopCheckbox) {
      this.autoLoopCheckbox.checked = !!this.currentSettings.screenVisionAutoLoop;
      this.autoLoopCheckbox.addEventListener('change', () => {
        const isEnabled = this.autoLoopCheckbox.checked;
        this.currentSettings.screenVisionAutoLoop = isEnabled;
        if (isEnabled) {
          this.startAutoLoop();
          soundManager.playFanfareSfx();
        } else {
          this.stopAutoLoop();
        }
        if (this.saveSettingsFile) this.saveSettingsFile();
      });

      if (this.autoLoopCheckbox.checked) {
        this.startAutoLoop();
      }
    }

    if (this.captureBtn) {
      this.captureBtn.addEventListener('click', () => {
        this.handleCaptureAndAnalyze({ isAuto: false });
      });
    }
  }

  /**
   * Starts the autonomous screen watcher periodic analysis loop.
   */
  startAutoLoop() {
    this.stopAutoLoop();
    const sec = Math.max(5, Math.min(300, parseInt(this.intervalInput?.value || this.currentSettings.screenVisionInterval || 10, 10)));
    
    if (this.statusTag) {
      this.statusTag.innerText = `🔄 Auto-Watcher Active (${sec}s loop)`;
      this.statusTag.style.color = '#38bdf8';
    }

    this.autoIntervalId = setInterval(() => {
      if (!this.isAnalyzing && !screenVisionService.isAnalyzing) {
        this.handleCaptureAndAnalyze({ isAuto: true });
      }
    }, sec * 1000);
  }

  /**
   * Stops the autonomous screen watcher loop.
   */
  stopAutoLoop() {
    if (this.autoIntervalId) {
      clearInterval(this.autoIntervalId);
      this.autoIntervalId = null;
    }
    if (this.statusTag && (!this.captureBtn || !this.captureBtn.disabled)) {
      this.statusTag.innerText = '⏸️ Auto-Watcher Paused';
      this.statusTag.style.color = '#9ca3af';
    }
  }

  async handleCaptureAndAnalyze({ isAuto = false } = {}) {
    if (this.isAnalyzing || screenVisionService.isAnalyzing) return;

    const model = this.modelSelect ? this.modelSelect.value : (this.currentSettings.screenVisionModel || 'moondream');
    const detail = this.detailSelect ? this.detailSelect.value : (this.currentSettings.screenVisionDetail || 'medium');
    const shouldPostChat = this.postChatCheckbox ? this.postChatCheckbox.checked : true;

    this.isAnalyzing = true;
    if (this.captureBtn && !isAuto) {
      this.captureBtn.disabled = true;
      this.captureBtn.innerText = '⏳ Capturing & Analyzing...';
    }
    if (this.outputBox) this.outputBox.style.display = 'flex';
    if (this.statusTag) {
      this.statusTag.style.color = '#f59e0b';
      this.statusTag.innerText = isAuto ? '📸 Auto Snapshot Analyzing...' : '📸 Taking Snapshot...';
    }
    if (this.visionText) {
      this.visionText.innerText = 'Analyzing visual pixels with local AI model...';
    }

    const language = this.currentSettings?.liveChatLanguage || this.currentSettings?.language || 'auto';

    try {
      if (!isAuto) soundManager.playInteractionSfx();

      const result = await screenVisionService.captureAndAnalyze({
        model,
        detail,
        language,
        onStatus: (status) => {
          if (this.statusTag) this.statusTag.innerText = status;
        },
        onStream: (chunk, fullText) => {
          if (this.visionText) {
            const preview = fullText.startsWith('Output:') ? fullText : `Output: ${fullText}`;
            this.visionText.innerText = preview;
          }
        }
      });

      if (result.success) {
        if (this.thumbnailImg && result.thumbnail) {
          this.thumbnailImg.src = result.thumbnail;
        }
        if (this.visionText) {
          this.visionText.innerText = result.text;
        }
        if (this.statusTag) {
          this.statusTag.style.color = '#10b981';
          this.statusTag.innerText = `✅ Analyzed by ${result.model}`;
        }
        if (this.latencyTag) {
          this.latencyTag.innerText = `${result.durationMs}ms`;
        }

        if (!isAuto) soundManager.playFanfareSfx();

        // Feed vision commentary into Live Chat Simulator if enabled
        if (shouldPostChat && result.text) {
          this.postVisionReflectionToChat(result.text, result.model);
        }
      } else {
        if (this.statusTag) {
          this.statusTag.style.color = '#ef4444';
          this.statusTag.innerText = '❌ Analysis Failed';
        }
        if (this.visionText) {
          this.visionText.innerText = `Error: ${result.error || 'Unknown error'}`;
        }
      }
    } catch (err) {
      if (this.statusTag) {
        this.statusTag.style.color = '#ef4444';
        this.statusTag.innerText = '❌ Error';
      }
      if (this.visionText) {
        this.visionText.innerText = err.message;
      }
    } finally {
      this.isAnalyzing = false;
      if (this.captureBtn) {
        this.captureBtn.disabled = false;
        this.captureBtn.innerText = '📸 Capture & Analyze Screen';
      }
    }
  }

  postVisionReflectionToChat(text, model) {
    if (!text) return;
    const cleanText = text.replace(/^Output:\s*/i, '').trim();
    if (!cleanText) return;

    // 1. Render locally to on-screen overlay if present
    const chatContainer = document.getElementById('live-chat-messages');
    if (chatContainer) {
      const row = document.createElement('div');
      row.className = 'live-chat-msg-row';
      row.style.background = 'rgba(56, 189, 248, 0.15)';
      row.style.border = '1px solid rgba(56, 189, 248, 0.4)';
      row.style.borderRadius = '5px';
      row.style.padding = '3px 5px';
      row.style.margin = '2px 0';
      row.innerHTML = `
        <span class="live-chat-badge" style="background: #38bdf825; color: #38bdf8; border-color: #38bdf8;">👁️ VISION AI</span>
        <span class="live-chat-user" style="color: #38bdf8; font-weight: 700;">@VisionBot:</span>
        <span class="live-chat-text" style="color: #ffffff; font-weight: 500;">${cleanText}</span>
      `;

      chatContainer.appendChild(row);
      while (chatContainer.children.length > 15) {
        chatContainer.removeChild(chatContainer.firstChild);
      }
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Trigger AI Audience Reaction Cascade to Vision Scene Description
      const personaCount = this.currentSettings.liveChatPersonaCount || 4;
      const language = this.currentSettings?.liveChatLanguage || this.currentSettings?.language || 'auto';
      liveAudienceAIService.generateAudienceCascade({
        hostMessage: cleanText,
        context: `Screen Vision snapshot analyzed (${model || 'local vision'})`,
        speed: this.currentSettings.liveChatSpeed || 'normal',
        personaCount,
        primaryLanguage: language,
        onMessage: (msgObj, idx) => {
          const msgRow = document.createElement('div');
          msgRow.className = 'live-chat-msg-row';
          msgRow.innerHTML = `
            <span class="live-chat-badge" style="border-color: ${msgObj.color || '#38bdf8'}40; background: ${msgObj.color || '#38bdf8'}15; color: ${msgObj.color || '#38bdf8'};">${msgObj.badge || '💎 SUB'}</span>
            <span class="live-chat-user" style="color: ${msgObj.color || '#38bdf8'};">${msgObj.user || `@Fan_${idx + 1}`}:</span>
            <span class="live-chat-text">${msgObj.msg}</span>
          `;
          chatContainer.appendChild(msgRow);
          while (chatContainer.children.length > 15) {
            chatContainer.removeChild(chatContainer.firstChild);
          }
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      });
    }

    // 2. Broadcast via IPC to Pop-Out Independent Live Chat Window
    const api = window.electronAPI || (typeof window.require === 'function' ? window.require('electron').ipcRenderer : null);
    if (api && typeof api.send === 'function') {
      api.send('broadcast-vision-chat', { text: cleanText, model });

      // 3. Broadcast via IPC to Pop-Out Independent Live Caption HUD Window
      if (this.currentSettings.liveCaptionMirrorVision !== false) {
        api.send('broadcast-live-caption', {
          text: cleanText,
          model: model || 'Vision AI',
          source: 'SCREEN VISION'
        });
      }
    }
  }
}

export function setupScreenVisionBetaUI(deps = {}) {
  const ui = new ScreenVisionBetaUI(deps);
  ui.init();
  return ui;
}
