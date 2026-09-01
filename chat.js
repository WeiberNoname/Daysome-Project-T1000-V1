/**
 * Independent Live Chat Window Controller (chat.js)
 * Rich multimedia live chat simulator with:
 * - 3 Distinct UI Themes (Twitch Dark Glass, TikTok E-Commerce, Cyber HUD)
 * - Changeable Chat Font Size (8px to 28px)
 * - Animated Memes & Stickers (PopCat, GigaChad, Doge, Diamond Hands)
 * - Video Clip Simulation previews
 * - Procedural Web Audio Sound Synthesizers (Superchat, Airhorn, Boing, Fanfare)
 */

const ipcRenderer = window.electronAPI || (typeof window.require === 'function' ? window.require('electron').ipcRenderer : {});

// --- Procedural Web Audio SFX Synthesizer ---
class ChatAudioSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  _init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSuperchat() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.85);
    });
  }

  playAirhorn() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bursts = [0, 0.11, 0.22, 0.38];
    bursts.forEach(offset => {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(622.25, now + offset); // D#5
      osc2.frequency.setValueAtTime(932.33, now + offset); // A#5
      gain.gain.setValueAtTime(0.16, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(now + offset);
      osc2.start(now + offset);
      osc1.stop(now + offset + 0.10);
      osc2.stop(now + offset + 0.10);
    });
  }

  playBoing() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.35);
    gain.gain.setValueAtTime(0.20, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.40);
  }

  playFanfare() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.18, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }
}

const audioSynth = new ChatAudioSynth();

const CHATTERS = [
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
    svg: `<svg viewBox="0 0 100 80" width="100%" height="70" style="border-radius:6px;background:linear-gradient(135deg,#ff758c,#ff7eb3);"><circle cx="50" cy="40" r="28" fill="#fff"/><circle cx="40" cy="35" r="5" fill="#333"/><circle cx="60" cy="35" r="5" fill="#333"/><ellipse cx="50" cy="50" rx="12" ry="8" fill="#e11d48"/><polygon points="25,25 35,10 45,25" fill="#f43f5e"/><polygon points="75,25 65,10 55,25" fill="#f43f5e"/><text x="50" y="75" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle">POPCAT.GIF</text></svg>`,
    caption: '100% MAXIMUM HYPE 🚀'
  },
  {
    title: '🗿 GigaChad Energy',
    author: '@ChadMaster',
    badge: '👑 BASED',
    color: '#a855f7',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="70" style="border-radius:6px;background:linear-gradient(135deg,#6366f1,#a855f7);"><rect x="35" y="20" width="30" height="40" rx="6" fill="#f3f4f6"/><polygon points="35,60 50,75 65,60" fill="#f3f4f6"/><circle cx="43" cy="32" r="3" fill="#111"/><circle cx="57" cy="32" r="3" fill="#111"/><path d="M42 48 Q50 54 58 48" stroke="#111" stroke-width="2" fill="none"/><text x="50" y="75" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">BASED.PNG</text></svg>`,
    caption: 'AVERAGE 3D MASCOT ENJOYER 🗿'
  },
  {
    title: '💎 Diamond Hands',
    author: '@CryptoWhale',
    badge: '💎 HYPE',
    color: '#06b6d4',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="70" style="border-radius:6px;background:linear-gradient(135deg,#0284c7,#06b6d4);"><polygon points="50,15 75,35 50,65 25,35" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/><polygon points="50,15 60,35 50,65 40,35" fill="#bae6fd"/><text x="50" y="75" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">TO THE MOON 🚀</text></svg>`,
    caption: 'HODL THE STREAM 💎🙌'
  },
  {
    title: '🐶 Doge Such 3D',
    author: '@ShibaLover',
    badge: '🐕 WOW',
    color: '#f59e0b',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="70" style="border-radius:6px;background:linear-gradient(135deg,#d97706,#f59e0b);"><circle cx="50" cy="38" r="26" fill="#fef3c7"/><circle cx="40" cy="32" r="4" fill="#78350f"/><circle cx="60" cy="32" r="4" fill="#78350f"/><ellipse cx="50" cy="45" rx="6" ry="4" fill="#78350f"/><text x="50" y="75" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">MUCH 3D. WOW.</text></svg>`,
    caption: 'MUCH PHYSICS. VERY WEBGL. 🐾'
  }
];

const VIDEO_CLIPS = [
  {
    title: '🎬 Highlight Clip: 3D Bunny Physics Toss & Ground Landing',
    author: '@ClipMaster',
    duration: '0:14',
    color: '#ec4899',
    views: '14.8K views'
  },
  {
    title: '🎬 Stage Concert: Dual Spotlights & Sakura Ambient Melody',
    author: '@LiveDirector',
    duration: '0:28',
    color: '#38bdf8',
    views: '42.1K views'
  }
];

const SUPERCHATS = [
  { name: '@TechLead_Dan', amount: '$10.00', color: '#f59e0b', text: '⭐ Outstanding live showcase & 3D rendering!' },
  { name: '@ShopperSara', amount: '$25.00', color: '#ec4899', text: '🛒 Just placed an order for 2x Brand Kits!' },
  { name: '@CryptoWhale', amount: '$50.00', color: '#a855f7', text: '🚀 Love this interactive live chat overlay!' }
];

class IndependentLiveChat {
  constructor() {
    this.root = document.getElementById('chat-window-root');
    this.messagesContainer = document.getElementById('messages-container');
    this.speedSelect = document.getElementById('chat-speed');
    this.soundToggleBtn = document.getElementById('btn-sound-toggle');
    this.memeBtn = document.getElementById('btn-meme');
    this.videoBtn = document.getElementById('btn-video');
    this.airhornBtn = document.getElementById('btn-airhorn');
    this.superchatBtn = document.getElementById('btn-superchat');
    this.clearBtn = document.getElementById('btn-clear');
    this.closeBtn = document.getElementById('btn-close');
    this.fontDecBtn = document.getElementById('btn-font-dec');
    this.fontIncBtn = document.getElementById('btn-font-inc');
    this.fontDisplay = document.getElementById('font-size-display');
    this.input = document.getElementById('user-msg-input');
    this.sendBtn = document.getElementById('btn-send');
    this.viewerCountElem = document.getElementById('viewer-count');

    this.intervalId = null;
    this.speed = 'normal';
    this.fontSize = 12;
    this.chatIndex = 0;
    this.viewerCount = 4820;
  }

  init() {
    this.applyFontSize();

    if (this.fontDecBtn) {
      this.fontDecBtn.addEventListener('click', () => {
        if (this.fontSize > 8) {
          this.fontSize -= 1;
          this.applyFontSize();
        }
      });
    }

    if (this.fontIncBtn) {
      this.fontIncBtn.addEventListener('click', () => {
        if (this.fontSize < 24) {
          this.fontSize += 1;
          this.applyFontSize();
        }
      });
    }

    if (this.speedSelect) {
      this.speedSelect.addEventListener('change', () => {
        this.speed = this.speedSelect.value;
        this.restartStream();
      });
    }

    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        audioSynth.enabled = !audioSynth.enabled;
        if (audioSynth.enabled) {
          this.soundToggleBtn.classList.add('active');
          this.soundToggleBtn.innerText = '🔊';
        } else {
          this.soundToggleBtn.classList.remove('active');
          this.soundToggleBtn.innerText = '🔇';
        }
      });
    }

    if (this.memeBtn) {
      this.memeBtn.addEventListener('click', () => {
        this.triggerMeme();
      });
    }

    if (this.videoBtn) {
      this.videoBtn.addEventListener('click', () => {
        this.triggerVideoClip();
      });
    }

    if (this.airhornBtn) {
      this.airhornBtn.addEventListener('click', () => {
        this.triggerAirhorn();
      });
    }

    if (this.superchatBtn) {
      this.superchatBtn.addEventListener('click', () => {
        this.triggerSuperchat();
      });
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (this.messagesContainer) this.messagesContainer.innerHTML = '';
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        if (ipcRenderer && ipcRenderer.send) {
          ipcRenderer.send('close-live-chat-window');
        } else {
          window.close();
        }
      });
    }

    const sendUserMessage = () => {
      const text = this.input ? this.input.value.trim() : '';
      if (!text) return;
      this.addMessage({
        badge: '🎙️ STREAMER',
        badgeColor: '#e67e22',
        name: '@Host',
        nameColor: '#f39c12',
        msg: text
      });
      if (this.input) this.input.value = '';

      // Trigger audience reaction after user chats
      setTimeout(() => {
        const reactions = ['W host!! 👏', 'Let\'s goooo! 🔥', 'Valid point!', 'PogChamp', 'Hyped!! ✨'];
        const reply = reactions[Math.floor(Math.random() * reactions.length)];
        this.addMessage({
          badge: '💎 SUB',
          badgeColor: '#38bdf8',
          name: '@Fan_' + Math.floor(Math.random() * 900 + 100),
          nameColor: '#38bdf8',
          msg: reply
        });
      }, 650);
    };

    if (this.sendBtn) this.sendBtn.addEventListener('click', sendUserMessage);
    if (this.input) {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendUserMessage();
      });
    }

    // Dynamic viewer count fluctuate
    setInterval(() => {
      this.viewerCount += Math.floor(Math.random() * 9) - 4;
      if (this.viewerCountElem) {
        this.viewerCountElem.innerText = `👥 ${(this.viewerCount / 1000).toFixed(1)}K`;
      }
    }, 3500);

    // Initial messages
    this.pushRandomMessage();
    setTimeout(() => this.triggerMeme(), 500);

    this.startStream();
  }

  applyFontSize() {
    if (this.root) {
      this.root.style.setProperty('--chat-font-size', `${this.fontSize}px`);
    }
    if (this.fontDisplay) {
      this.fontDisplay.innerText = `${this.fontSize}px`;
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

  startStream() {
    this.stopStream();
    this.intervalId = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.12) {
        this.triggerSuperchat();
      } else if (roll < 0.22) {
        this.triggerMeme();
      } else if (roll < 0.30) {
        this.triggerVideoClip();
      } else {
        this.pushRandomMessage();
      }
    }, this.getIntervalMs());
  }

  stopStream() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  restartStream() {
    this.stopStream();
    this.startStream();
  }

  pushRandomMessage() {
    const c = CHATTERS[this.chatIndex % CHATTERS.length];
    this.chatIndex++;

    this.addMessage({
      badge: c.badge,
      badgeColor: c.color,
      name: c.name,
      nameColor: c.color,
      msg: c.msg
    });
  }

  addMessage({ badge, badgeColor, name, nameColor, msg }) {
    if (!this.messagesContainer) return;
    const row = document.createElement('div');
    row.className = 'msg-row';
    row.innerHTML = `
      <span class="msg-badge" style="border-color: ${badgeColor}40; background: ${badgeColor}15; color: ${badgeColor};">${badge}</span>
      <span class="msg-user" style="color: ${nameColor};">${name}:</span>
      <span class="msg-text">${msg}</span>
    `;

    this.appendMessage(row);
  }

  triggerMeme() {
    if (!this.messagesContainer) return;
    const meme = MEMES[Math.floor(Math.random() * MEMES.length)];
    const row = document.createElement('div');
    row.className = 'msg-row msg-meme';
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;width:100%;">
        <span class="msg-badge" style="background:${meme.color}25;color:${meme.color};border-color:${meme.color};">${meme.badge}</span>
        <span class="msg-user" style="color:#ffffff;">${meme.author}:</span>
        <span style="font-size:0.9em;color:#cbd5e1;font-weight:600;margin-left:auto;">${meme.title}</span>
      </div>
      <div style="width:100%;display:flex;justify-content:center;margin:4px 0;">
        ${meme.svg}
      </div>
      <div style="font-size:0.95em;font-weight:700;color:${meme.color};text-align:center;width:100%;">${meme.caption}</div>
    `;

    audioSynth.playBoing();
    this.appendMessage(row);
  }

  triggerVideoClip() {
    if (!this.messagesContainer) return;
    const clip = VIDEO_CLIPS[Math.floor(Math.random() * VIDEO_CLIPS.length)];
    const row = document.createElement('div');
    row.className = 'msg-row msg-video';
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;width:100%;">
        <span class="msg-badge" style="background:#ec489925;color:#ec4899;border-color:#ec4899;">🎬 CLIP</span>
        <span class="msg-user" style="color:#ffffff;">${clip.author}:</span>
        <span style="font-size:0.85em;color:#38bdf8;font-weight:700;margin-left:auto;">⏱️ ${clip.duration}</span>
      </div>
      <div style="background:rgba(0,0,0,0.45);border:1px dashed rgba(255,255,255,0.2);border-radius:6px;padding:8px;display:flex;align-items:center;gap:10px;">
        <div style="width:30px;height:30px;border-radius:50%;background:#e67e22;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;box-shadow:0 0 10px #e67e22;cursor:pointer;">▶</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.95em;font-weight:700;color:#f3f4f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${clip.title}</div>
          <div style="font-size:0.8em;color:#9ca3af;">${clip.views} • Instant Replay</div>
        </div>
      </div>
    `;

    audioSynth.playFanfare();
    this.appendMessage(row);
  }

  triggerAirhorn() {
    audioSynth.playAirhorn();
    this.addMessage({
      badge: '🎺 HYPE',
      badgeColor: '#f59e0b',
      name: '@StreamBot',
      nameColor: '#fbbf24',
      msg: '📢📢📢 AIRHORN SPAM ACTIVE!! POGCHAMP 🎺🔥'
    });
  }

  triggerSuperchat() {
    if (!this.messagesContainer) return;
    const sc = SUPERCHATS[Math.floor(Math.random() * SUPERCHATS.length)];
    const scRow = document.createElement('div');
    scRow.className = 'msg-row msg-superchat';
    scRow.innerHTML = `
      <div class="superchat-top">
        <span class="msg-badge" style="background: ${sc.color}25; color: ${sc.color}; border-color: ${sc.color};">⭐ SUPERCHAT</span>
        <span class="msg-user" style="color: #ffffff;">${sc.name}</span>
        <span class="superchat-amount" style="color: ${sc.color};">${sc.amount}</span>
      </div>
      <div class="superchat-content">${sc.text}</div>
    `;

    audioSynth.playSuperchat();
    this.appendMessage(scRow);
  }

  appendMessage(el) {
    if (!this.messagesContainer) return;
    this.messagesContainer.appendChild(el);
    while (this.messagesContainer.children.length > 35) {
      this.messagesContainer.removeChild(this.messagesContainer.firstChild);
    }
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const chat = new IndependentLiveChat();
  chat.init();
});
