/**
 * caption.js
 * Controller for the independent floating live caption window.
 * Starts clean and empty, receives realtime subtitle text via IPC broadcast,
 * and provides responsive font scaling, opacity controls, and theme presets.
 */

let currentFontSize = 16;
let currentOpacityIdx = 0;
const opacityLevels = ['0.90', '0.65', '1.00'];

const themes = ['', 'theme-cyberpunk', 'theme-amber', 'theme-emerald', 'theme-highcontrast'];
let currentThemeIdx = 0;

const container = document.getElementById('caption-window-container');
const emptyHint = document.getElementById('caption-empty-hint');
const captionText = document.getElementById('caption-text');
const sourceBadge = document.getElementById('caption-source-badge');
const seqCounter = document.getElementById('caption-seq-counter');
const modelTag = document.getElementById('caption-model-tag');
const timeTag = document.getElementById('caption-time-tag');

const btnFontMinus = document.getElementById('btn-font-minus');
const btnFontPlus = document.getElementById('btn-font-plus');
const btnThemeCycle = document.getElementById('btn-theme-cycle');
const btnOpacityToggle = document.getElementById('btn-opacity-toggle');
const btnClose = document.getElementById('btn-caption-close');

// Font size buttons
if (btnFontMinus) {
  btnFontMinus.addEventListener('click', () => {
    currentFontSize = Math.max(11, currentFontSize - 2);
    document.documentElement.style.setProperty('--caption-font-size', `${currentFontSize}px`);
  });
}

if (btnFontPlus) {
  btnFontPlus.addEventListener('click', () => {
    currentFontSize = Math.min(36, currentFontSize + 2);
    document.documentElement.style.setProperty('--caption-font-size', `${currentFontSize}px`);
  });
}

// Theme cycler
if (btnThemeCycle) {
  btnThemeCycle.addEventListener('click', () => {
    themes.forEach(t => t && container.classList.remove(t));
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    const nextTheme = themes[currentThemeIdx];
    if (nextTheme) {
      container.classList.add(nextTheme);
    }
  });
}

// Opacity toggle
if (btnOpacityToggle) {
  btnOpacityToggle.addEventListener('click', () => {
    currentOpacityIdx = (currentOpacityIdx + 1) % opacityLevels.length;
    document.documentElement.style.setProperty('--caption-bg-opacity', opacityLevels[currentOpacityIdx]);
  });
}

// Close window
if (btnClose) {
  btnClose.addEventListener('click', () => {
    const api = window.electronAPI;
    if (api && typeof api.closeLiveCaptionWindow === 'function') {
      api.closeLiveCaptionWindow();
    } else if (api && typeof api.send === 'function') {
      api.send('close-live-caption-window');
    }
  });
}

// IPC Live Subtitle Receiver
const api = window.electronAPI;
if (api && typeof api.on === 'function') {
  api.on('live-caption-update', (data) => {
    if (!data) return;

    const text = (typeof data === 'string' ? data : (data.text || data.caption || '')).trim();

    if (text) {
      if (emptyHint) emptyHint.style.display = 'none';
      if (captionText) {
        captionText.style.display = 'block';
        captionText.innerText = text;
        captionText.classList.remove('caption-pop-anim');
        void captionText.offsetWidth;
        captionText.classList.add('caption-pop-anim');
      }
    }

    if (data.source && sourceBadge) {
      sourceBadge.innerText = data.source;
    }

    if (data.counter && seqCounter) {
      seqCounter.innerText = data.counter;
    } else if (data.index !== undefined && data.total !== undefined && seqCounter) {
      seqCounter.innerText = `[${data.index + 1}/${data.total}]`;
    }

    if (data.model && modelTag) {
      modelTag.innerText = data.model;
    }

    if (timeTag) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      timeTag.innerText = data.durationMs ? `${data.durationMs}ms | ${timeStr}` : timeStr;
    }
  });

  api.on('clear-live-caption', () => {
    if (captionText) {
      captionText.innerText = '';
      captionText.style.display = 'none';
    }
    if (emptyHint) {
      emptyHint.style.display = 'flex';
    }
    if (seqCounter) seqCounter.innerText = '--';
    if (timeTag) timeTag.innerText = 'Cleared';
  });
}
