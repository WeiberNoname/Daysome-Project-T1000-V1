/**
 * ScreenVisionBetaUI.js
 * Controller for the Beta Screen Vision AI card in the Studio Tab.
 * Connects screen snapshot capture with local Ollama multimodal vision models,
 * visual thumbnail rendering, and optional stream live-chat reflection injection.
 */

import { screenVisionService } from '../services/ScreenVisionService.js';
import { soundManager } from '../core/SoundManager.js';

export class ScreenVisionBetaUI {
  constructor({ liveChatSim = null } = {}) {
    this.liveChatSim = liveChatSim;
    this.captureBtn = null;
    this.modelSelect = null;
    this.postChatCheckbox = null;
    this.outputBox = null;
    this.statusTag = null;
    this.latencyTag = null;
    this.thumbnailImg = null;
    this.visionText = null;
  }

  init() {
    this.captureBtn = document.getElementById('btn-beta-capture-vision');
    this.modelSelect = document.getElementById('beta-vision-model');
    this.postChatCheckbox = document.getElementById('beta-vision-post-chat');
    this.outputBox = document.getElementById('beta-vision-output-box');
    this.statusTag = document.getElementById('beta-vision-status-tag');
    this.latencyTag = document.getElementById('beta-vision-latency-tag');
    this.thumbnailImg = document.getElementById('beta-vision-thumbnail');
    this.visionText = document.getElementById('beta-vision-text');

    if (this.captureBtn) {
      this.captureBtn.addEventListener('click', () => {
        this.handleCaptureAndAnalyze();
      });
    }
  }

  async handleCaptureAndAnalyze() {
    if (!this.captureBtn || this.captureBtn.disabled) return;

    const model = this.modelSelect ? this.modelSelect.value : 'llama3.2-vision';
    const shouldPostChat = this.postChatCheckbox ? this.postChatCheckbox.checked : true;

    this.captureBtn.disabled = true;
    this.captureBtn.innerText = '⏳ Capturing & Analyzing...';
    if (this.outputBox) this.outputBox.style.display = 'flex';
    if (this.statusTag) {
      this.statusTag.style.color = '#f59e0b';
      this.statusTag.innerText = '📸 Taking Snapshot...';
    }
    if (this.visionText) {
      this.visionText.innerText = 'Analyzing visual pixels with local AI model...';
    }

    try {
      soundManager.playInteractionSfx();

      const result = await screenVisionService.captureAndAnalyze({
        model,
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

        soundManager.playFanfareSfx();

        // Feed vision commentary into Live Chat Simulator if checked
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
      if (this.captureBtn) {
        this.captureBtn.disabled = false;
        this.captureBtn.innerText = '📸 Capture & Analyze Screen';
      }
    }
  }

  postVisionReflectionToChat(text, model) {
    const chatContainer = document.getElementById('live-chat-messages');
    if (!chatContainer) return;

    // Clean first sentence for compact stream chat row
    const firstSentence = text.split('\n')[0].slice(0, 140);

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
      <span class="live-chat-text" style="color: #ffffff; font-weight: 500;">${firstSentence}</span>
    `;

    chatContainer.appendChild(row);
    while (chatContainer.children.length > 12) {
      chatContainer.removeChild(chatContainer.firstChild);
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

export function setupScreenVisionBetaUI(deps = {}) {
  const ui = new ScreenVisionBetaUI(deps);
  ui.init();
  return ui;
}
