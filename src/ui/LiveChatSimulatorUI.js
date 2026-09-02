/**
 * Live Chat Simulator UI Module
 * Supports rich multimedia live stream simulations:
 * - Text messages with colorful badges & usernames
 * - Viral Memes & Animated Stickers (PopCat, CatJam, Gigachad, Doge, Diamond Hands)
 * - Video Clip Simulation cards with animated visualizers
 * - Procedural Web Audio Sound Effects (Superchat chime, Airhorn, Meme Boing, Fanfare)
 */

import { soundManager } from '../core/SoundManager.js';
import { liveAudienceAIService } from '../services/LiveAudienceAIService.js';

const FAKE_CHATTERS = [
  { name: '@GamerGod99', color: '#38bdf8', badge: '💎 SUB', msg: 'OMG so cute!! 🐰✨' },
  { name: '@Luna_Chan', color: '#ec4899', badge: '👑 VIP', msg: 'W mascot display 🔥🔥🔥' },
  { name: '@TechLead_Dan', color: '#22c55e', badge: '🛡️ MOD', msg: 'Is this rendering in real-time WebGL?' },
  { name: '@ShopperSara', color: '#f59e0b', badge: '🛒 BUYER', msg: 'Can I order this brand model for my company?' },
  { name: '@CyberSamurai', color: '#a855f7', badge: '⚡ PRO', msg: 'The cloth wave physics look amazing 💨' },
  { name: '@Alex_Speedrun', color: '#f43f5e', badge: '💎 SUB', msg: 'PogChamp PogChamp' },
  { name: '@PixelArtist', color: '#06b6d4', badge: '👑 VIP', msg: 'Drop the custom logo template please!' },
  { name: '@CoffeeDev', color: '#eab308', badge: '💎 SUB', msg: 'Sub hype train active! 🎉' },
  { name: '@MochiLover', color: '#f472b6', badge: '⚡ PRO', msg: 'How do I trigger the sakura petal storm? 🌸' },
  { name: '@TokyoViewer', color: '#60a5fa', badge: '💎 SUB', msg: 'Greetings from Tokyo! 🇯🇵 Great stream!' },
  { name: '@BusinessHost', color: '#10b981', badge: '🛒 BUYER', msg: 'This is perfect for live e-commerce selling 👍' },
  { name: '@MemeKing', color: '#fb923c', badge: '⚡ PRO', msg: 'Take my money 💸💸💸' }
];

const MEMES = [
  {
    title: '🐱 PopCat Vibe',
    author: '@CatVibes',
    badge: '🔥 MEME',
    color: '#f43f5e',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="60" style="border-radius:6px;background:linear-gradient(135deg,#ff758c,#ff7eb3);"><circle cx="50" cy="40" r="28" fill="#fff"/><circle cx="40" cy="35" r="5" fill="#333"/><circle cx="60" cy="35" r="5" fill="#333"/><ellipse cx="50" cy="50" rx="12" ry="8" fill="#e11d48"/><polygon points="25,25 35,10 45,25" fill="#f43f5e"/><polygon points="75,25 65,10 55,25" fill="#f43f5e"/><text x="50" y="75" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle">POPCAT.GIF</text></svg>`,
    caption: '100% MAXIMUM HYPE 🚀'
  },
  {
    title: '🗿 GigaChad Energy',
    author: '@ChadMaster',
    badge: '👑 BASED',
    color: '#a855f7',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="60" style="border-radius:6px;background:linear-gradient(135deg,#6366f1,#a855f7);"><rect x="35" y="20" width="30" height="40" rx="6" fill="#f3f4f6"/><polygon points="35,60 50,75 65,60" fill="#f3f4f6"/><circle cx="43" cy="32" r="3" fill="#111"/><circle cx="57" cy="32" r="3" fill="#111"/><path d="M42 48 Q50 54 58 48" stroke="#111" stroke-width="2" fill="none"/><text x="50" y="75" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">BASED.PNG</text></svg>`,
    caption: 'AVERAGE 3D MASCOT ENJOYER 🗿'
  },
  {
    title: '💎 Diamond Hands',
    author: '@CryptoWhale',
    badge: '💎 HYPE',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="60" style="border-radius:6px;background:linear-gradient(135deg,#0284c7,#06b6d4);"><polygon points="50,15 75,35 50,65 25,35" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/><polygon points="50,15 60,35 50,65 40,35" fill="#bae6fd"/><text x="50" y="75" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">TO THE MOON 🚀</text></svg>`,
    caption: 'HODL THE STREAM 💎🙌'
  },
  {
    title: '🐶 Doge Such 3D',
    author: '@ShibaLover',
    badge: '🐕 WOW',
    color: '#f59e0b',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="60" style="border-radius:6px;background:linear-gradient(135deg,#d97706,#f59e0b);"><circle cx="50" cy="38" r="26" fill="#fef3c7"/><circle cx="40" cy="32" r="4" fill="#78350f"/><circle cx="60" cy="32" r="4" fill="#78350f"/><ellipse cx="50" cy="45" rx="6" ry="4" fill="#78350f"/><text x="50" y="75" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">MUCH 3D. WOW.</text></svg>`,
    caption: 'MUCH PHYSICS. VERY WEBGL. 🐾'
  }
];

const VIDEO_CLIPS = [
  {
    title: '🎬 Highlight Clip: 3D Bunny Toss & Bounce',
    author: '@ClipMaster',
    duration: '0:14',
    color: '#ec4899',
    views: '12.4K views'
  },
  {
    title: '🎬 Stage Concert: Dual Spotlights & Synth Beat',
    author: '@LiveDirector',
    duration: '0:28',
    color: '#38bdf8',
    views: '38.9K views'
  }
];

const SUPERCHATS = [
  { name: '@TechLead_Dan', amount: '$10.00', color: '#f59e0b', text: '⭐ Outstanding live showcase & 3D rendering!' },
  { name: '@ShopperSara', amount: '$25.00', color: '#ec4899', text: '🛒 Just placed an order for 2x Brand Kits!' },
  { name: '@CryptoWhale', amount: '$50.00', color: '#a855f7', text: '🚀 Love this interactive live chat overlay!' }
];

export class LiveChatSimulator {
  constructor({ currentSettings, saveSettingsFile }) {
    this.currentSettings = currentSettings;
    this.saveSettingsFile = saveSettingsFile;
    this.intervalId = null;
    this.overlayElem = null;
    this.messagesContainer = null;
    this.speed = currentSettings.liveChatSpeed || 'normal';
    this.isEnabled = !!currentSettings.liveChatEnabled;
    this.width = currentSettings.liveChatWidth || 240;
    this.height = currentSettings.liveChatHeight || 190;
    this.scale = currentSettings.liveChatScale !== undefined ? currentSettings.liveChatScale : 1.0;
    this.position = currentSettings.liveChatPosition || 'top-left';
    this.fontSize = currentSettings.liveChatFontSize || 11;
    this.personaCount = currentSettings.liveChatPersonaCount || 4;
    this.language = currentSettings.liveChatLanguage || 'auto';
    this.chatIndex = 0;
    this.soundEnabled = true;
  }

  init() {
    this.overlayElem = document.getElementById('live-chat-overlay');
    this.messagesContainer = document.getElementById('live-chat-messages');

    const toggle = document.getElementById('beta-live-chat-toggle');
    const speedSelect = document.getElementById('beta-chat-speed');
    const fontSizeInput = document.getElementById('beta-chat-fontsize');
    const personasInput = document.getElementById('beta-chat-personas');
    const langSelect = document.getElementById('beta-chat-lang');
    const widthInput = document.getElementById('beta-chat-width');
    const heightInput = document.getElementById('beta-chat-height');
    const scaleInput = document.getElementById('beta-chat-scale');
    const posSelect = document.getElementById('beta-chat-position');
    const popoutBtn = document.getElementById('btn-beta-popout-window');
    const superchatBtn = document.getElementById('btn-beta-send-superchat');
    const clearBtn = document.getElementById('btn-beta-clear-chat');

    this.applyDimensions();

    if (toggle) {
      toggle.checked = this.isEnabled;
      toggle.addEventListener('change', () => {
        this.setEnabled(toggle.checked);
      });
    }

    if (speedSelect) {
      speedSelect.value = this.speed;
      speedSelect.addEventListener('change', () => {
        this.setSpeed(speedSelect.value);
      });
    }

    if (fontSizeInput) {
      fontSizeInput.value = this.fontSize;
      fontSizeInput.addEventListener('input', () => {
        const val = parseInt(fontSizeInput.value, 10);
        if (!isNaN(val) && val >= 8 && val <= 32) {
          this.setFontSize(val);
        }
      });
    }

    if (personasInput) {
      personasInput.value = this.personaCount;
      personasInput.addEventListener('input', () => {
        const val = parseInt(personasInput.value, 10);
        if (!isNaN(val) && val >= 1 && val <= 10) {
          this.personaCount = val;
          this.currentSettings.liveChatPersonaCount = val;
          if (this.saveSettingsFile) this.saveSettingsFile();
        }
      });
    }

    if (langSelect) {
      langSelect.value = this.language;
      langSelect.addEventListener('change', () => {
        this.language = langSelect.value;
        this.currentSettings.liveChatLanguage = langSelect.value;
        if (this.saveSettingsFile) this.saveSettingsFile();
      });
    }

    if (widthInput) {
      widthInput.value = this.width;
      widthInput.addEventListener('input', () => {
        const val = parseInt(widthInput.value, 10);
        if (!isNaN(val) && val >= 100) {
          this.width = val;
          this.currentSettings.liveChatWidth = val;
          this.applyDimensions();
          if (this.saveSettingsFile) this.saveSettingsFile();
        }
      });
    }

    if (heightInput) {
      heightInput.value = this.height;
      heightInput.addEventListener('input', () => {
        const val = parseInt(heightInput.value, 10);
        if (!isNaN(val) && val >= 60) {
          this.height = val;
          this.currentSettings.liveChatHeight = val;
          this.applyDimensions();
          if (this.saveSettingsFile) this.saveSettingsFile();
        }
      });
    }

    if (scaleInput) {
      scaleInput.value = this.scale.toFixed(2);
      scaleInput.addEventListener('input', () => {
        const val = parseFloat(scaleInput.value);
        if (!isNaN(val) && val >= 0.4 && val <= 3.0) {
          this.scale = val;
          this.currentSettings.liveChatScale = val;
          this.applyDimensions();
          if (this.saveSettingsFile) this.saveSettingsFile();
        }
      });
    }

    if (posSelect) {
      posSelect.value = this.position;
      posSelect.addEventListener('change', () => {
        this.position = posSelect.value;
        this.currentSettings.liveChatPosition = posSelect.value;
        this.applyDimensions();
        if (this.saveSettingsFile) this.saveSettingsFile();
      });
    }

    if (popoutBtn) {
      popoutBtn.addEventListener('click', () => {
        const api = window.electronAPI || (typeof window.require === 'function' ? window.require('electron').ipcRenderer : null);
        if (api && api.send) {
          api.send('open-live-chat-window');
        } else if (api && api.openLiveChatWindow) {
          api.openLiveChatWindow();
        }
      });
    }

    if (superchatBtn) {
      superchatBtn.addEventListener('click', () => {
        this.sendSuperchat();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearChat();
      });
    }

    if (this.isEnabled) {
      this.start();
    }
  }

  setFontSize(size) {
    this.fontSize = size;
    this.currentSettings.liveChatFontSize = size;
    this.applyDimensions();
    if (this.saveSettingsFile) this.saveSettingsFile();
  }

  applyDimensions() {
    if (!this.overlayElem) return;
    this.overlayElem.style.setProperty('--live-chat-width', `${this.width}px`);
    this.overlayElem.style.setProperty('--live-chat-height', `${this.height}px`);
    this.overlayElem.style.setProperty('--live-chat-scale', this.scale);
    this.overlayElem.style.setProperty('--chat-font-size', `${this.fontSize}px`);

    // Reset position classes
    this.overlayElem.classList.remove('pos-top-left', 'pos-top-center', 'pos-top-right', 'pos-bottom-left', 'pos-bottom-right');
    this.overlayElem.classList.add(`pos-${this.position || 'top-left'}`);
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.currentSettings.liveChatEnabled = enabled;
    if (this.saveSettingsFile) this.saveSettingsFile();

    if (this.overlayElem) {
      this.applyDimensions();
      if (enabled) {
        this.overlayElem.classList.remove('hidden');
        this.start();
      } else {
        this.overlayElem.classList.add('hidden');
        this.stop();
      }
    }
  }

  setSpeed(speed) {
    this.speed = speed;
    this.currentSettings.liveChatSpeed = speed;
    if (this.saveSettingsFile) this.saveSettingsFile();
    if (this.isEnabled) {
      this.stop();
      this.start();
    }
  }

  getIntervalMs() {
    switch (this.speed) {
      case 'fast': return 800;
      case 'slow': return 3200;
      case 'normal':
      default: return 1800;
    }
  }

  start() {
    this.stop();
    if (this.overlayElem) {
      this.overlayElem.classList.remove('hidden');
    }

    // Seed initial AI ready indicator if empty
    if (this.messagesContainer && this.messagesContainer.children.length === 0) {
      const initRow = document.createElement('div');
      initRow.className = 'live-chat-msg-row';
      initRow.innerHTML = `
        <span class="live-chat-badge" style="border-color: #10b98140; background: #10b98115; color: #10b981;">🤖 AI CORE</span>
        <span class="live-chat-user" style="color: #34d399;">@System:</span>
        <span class="live-chat-text">Live AI Stream Overlay is active & ready for events.</span>
      `;
      this.appendMessageElement(initRow);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    liveAudienceAIService.clearPendingDrips();
  }

  pushMemeCard() {
    if (!this.messagesContainer) return;
    const meme = MEMES[Math.floor(Math.random() * MEMES.length)];
    const memeRow = document.createElement('div');
    memeRow.className = 'live-chat-msg-row live-chat-meme-card';
    memeRow.innerHTML = `
      <div style="display:flex;align-items:center;gap:4px;width:100%;margin-bottom:3px;">
        <span class="live-chat-badge" style="background:${meme.color}25;color:${meme.color};border-color:${meme.color};">${meme.badge}</span>
        <span class="live-chat-user" style="color:#ffffff;">${meme.author}:</span>
        <span style="font-size:9.5px;color:#cbd5e1;font-weight:600;margin-left:auto;">${meme.title}</span>
      </div>
      <div style="width:100%;display:flex;justify-content:center;margin:2px 0;">
        ${meme.svg}
      </div>
      <div style="font-size:9.5px;font-weight:700;color:${meme.color};text-align:center;width:100%;">${meme.caption}</div>
    `;

    if (this.soundEnabled) soundManager.playMemeBoing();
    this.appendMessageElement(memeRow);
  }

  pushVideoClipCard() {
    if (!this.messagesContainer) return;
    const clip = VIDEO_CLIPS[Math.floor(Math.random() * VIDEO_CLIPS.length)];
    const clipRow = document.createElement('div');
    clipRow.className = 'live-chat-msg-row live-chat-video-card';
    clipRow.innerHTML = `
      <div style="display:flex;align-items:center;gap:4px;width:100%;margin-bottom:4px;">
        <span class="live-chat-badge" style="background:#ec489925;color:#ec4899;border-color:#ec4899;">🎬 CLIP</span>
        <span class="live-chat-user" style="color:#ffffff;">${clip.author}:</span>
        <span style="font-size:9px;color:#38bdf8;font-weight:700;margin-left:auto;">⏱️ ${clip.duration}</span>
      </div>
      <div style="background:rgba(0,0,0,0.4);border:1px dashed rgba(255,255,255,0.2);border-radius:6px;padding:6px;display:flex;align-items:center;gap:8px;">
        <div style="width:26px;height:26px;border-radius:50%;background:#e67e22;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;box-shadow:0 0 8px #e67e22;">▶</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:10px;font-weight:700;color:#f3f4f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${clip.title}</div>
          <div style="font-size:8.5px;color:#9ca3af;">${clip.views} • Live Replay</div>
        </div>
      </div>
    `;

    if (this.soundEnabled) soundManager.playFanfareSfx();
    this.appendMessageElement(clipRow);
  }

  sendSuperchat() {
    if (!this.messagesContainer) return;
    const sc = SUPERCHATS[Math.floor(Math.random() * SUPERCHATS.length)];
    const scRow = document.createElement('div');
    scRow.className = 'live-chat-msg-row live-chat-superchat';
    scRow.innerHTML = `
      <div class="live-chat-superchat-header">
        <span class="live-chat-badge" style="background: ${sc.color}25; color: ${sc.color}; border-color: ${sc.color};">⭐ SUPERCHAT</span>
        <span class="live-chat-user" style="color: #ffffff; font-weight: 700;">${sc.name}</span>
        <span class="live-chat-amount" style="color: ${sc.color}; font-weight: 800; margin-left: auto;">${sc.amount}</span>
      </div>
      <div class="live-chat-superchat-body">${sc.text}</div>
    `;

    if (this.soundEnabled) soundManager.playSuperchatChime();
    this.appendMessageElement(scRow);
  }

  appendMessageElement(el) {
    if (!this.messagesContainer) return;
    this.messagesContainer.appendChild(el);

    // Keep max 10 messages for lightweight performance
    while (this.messagesContainer.children.length > 10) {
      this.messagesContainer.removeChild(this.messagesContainer.firstChild);
    }

    // Smooth auto-scroll to bottom
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  clearChat() {
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
  }

  postHostMessage(text) {
    if (!this.messagesContainer || !text) return;
    const msgRow = document.createElement('div');
    msgRow.className = 'live-chat-msg-row';
    msgRow.innerHTML = `
      <span class="live-chat-badge" style="border-color: #e67e2240; background: #e67e2220; color: #f39c12;">🎙️ STREAMER</span>
      <span class="live-chat-user" style="color: #f39c12; font-weight: 700;">@Host:</span>
      <span class="live-chat-text" style="color: #ffffff; font-weight: 600;">${text}</span>
    `;
    this.appendMessageElement(msgRow);

    // Trigger AI Audience Cascade
    this.triggerAIBurst(text);
  }

  triggerAIBurst(hostMessage, context = '') {
    liveAudienceAIService.generateAudienceCascade({
      hostMessage,
      context,
      speed: this.speed,
      personaCount: this.personaCount,
      primaryLanguage: this.language,
      onMessage: (msgObj, idx) => {
        const row = document.createElement('div');
        row.className = 'live-chat-msg-row';
        row.innerHTML = `
          <span class="live-chat-badge" style="border-color: ${msgObj.color || '#38bdf8'}40; background: ${msgObj.color || '#38bdf8'}15; color: ${msgObj.color || '#38bdf8'};">${msgObj.badge || '💎 SUB'}</span>
          <span class="live-chat-user" style="color: ${msgObj.color || '#38bdf8'};">${msgObj.user || `@Fan_${idx + 1}`}:</span>
          <span class="live-chat-text">${msgObj.msg}</span>
        `;
        this.appendMessageElement(row);
      }
    });
  }
}

export function setupLiveChatSimulatorUI(deps) {
  const sim = new LiveChatSimulator(deps);
  sim.init();
  return sim;
}
