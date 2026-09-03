/**
 * banner.js
 * Controller for the independent floating sponsor & ad banner window.
 * Displays uploaded banner images with custom background transparency and optional click-through / URL links.
 */

let currentBgColor = '#0b0f19';
let currentOpacity = 0.85;
let currentImagePath = '';
let currentLinkUrl = '';

const container = document.getElementById('banner-window-container');
const bannerBody = document.getElementById('banner-body');
const bannerPlaceholder = document.getElementById('banner-placeholder');
const bannerImg = document.getElementById('banner-img');
const btnClose = document.getElementById('btn-banner-close');

/**
 * Converts a hex color string (#rrggbb or #rgb) to RGB components.
 */
function hexToRgb(hex) {
  let c = (hex || '#0b0f19').replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 11, g: 15, b: 25 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Applies background color, opacity, image, and link updates.
 */
function applyBannerData(data = {}, save = true) {
  if (data.bgColor !== undefined) currentBgColor = data.bgColor;
  if (data.opacity !== undefined) currentOpacity = Math.max(0, Math.min(1, parseFloat(data.opacity)));
  if (data.imagePath !== undefined) currentImagePath = data.imagePath;
  if (data.linkUrl !== undefined) currentLinkUrl = data.linkUrl;

  const rgb = hexToRgb(currentBgColor);
  const rootStyle = document.documentElement.style;

  rootStyle.setProperty('--banner-bg-color', currentBgColor);
  rootStyle.setProperty('--banner-bg-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  rootStyle.setProperty('--banner-bg-opacity', currentOpacity.toFixed(2));

  // Render Image or Placeholder
  if (currentImagePath && currentImagePath.trim()) {
    bannerImg.src = currentImagePath;
    bannerImg.style.display = 'block';
    if (bannerPlaceholder) bannerPlaceholder.style.display = 'none';
  } else {
    bannerImg.src = '';
    bannerImg.style.display = 'none';
    if (bannerPlaceholder) bannerPlaceholder.style.display = 'flex';
  }

  // Handle clickable URL
  if (currentLinkUrl && currentLinkUrl.trim()) {
    bannerBody.classList.add('clickable');
    bannerBody.title = `Click to visit: ${currentLinkUrl}`;
  } else {
    bannerBody.classList.remove('clickable');
    bannerBody.removeAttribute('title');
  }

  // Save to localStorage
  if (save) {
    try {
      localStorage.setItem('mascot_banner_data', JSON.stringify({
        bgColor: currentBgColor,
        opacity: currentOpacity,
        imagePath: currentImagePath,
        linkUrl: currentLinkUrl
      }));
    } catch (e) {
      console.warn('[Banner] Could not cache banner state:', e);
    }
  }
}

// Restore saved styling on startup
try {
  const saved = localStorage.getItem('mascot_banner_data');
  if (saved) {
    applyBannerData(JSON.parse(saved), false);
  } else {
    applyBannerData({
      bgColor: '#0b0f19',
      opacity: 0.85,
      imagePath: '',
      linkUrl: ''
    }, false);
  }
} catch (e) {
  applyBannerData({}, false);
}

// Handle Banner Body Click (Navigate to Link if present)
if (bannerBody) {
  bannerBody.addEventListener('click', (e) => {
    // Ignore clicks if click-through is enabled or clicking close button
    if (!currentLinkUrl || !currentLinkUrl.trim()) return;
    try {
      const url = currentLinkUrl.trim();
      const api = window.electronAPI;
      if (api && typeof api.openExternalUrl === 'function') {
        api.openExternalUrl(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('[Banner] Failed to open link:', err);
    }
  });
}

// Close button
if (btnClose) {
  btnClose.addEventListener('click', () => {
    const api = window.electronAPI;
    if (api && typeof api.closeBannerWindow === 'function') {
      api.closeBannerWindow();
    } else if (api && typeof api.send === 'function') {
      api.send('close-banner-window');
    }
  });
}

// IPC Listener for Live Banner Updates
const api = window.electronAPI;
if (api && typeof api.on === 'function') {
  api.on('banner-data-update', (data) => {
    if (!data) return;
    applyBannerData({
      bgColor: data.bgColor,
      opacity: data.opacity !== undefined ? data.opacity : data.bgOpacity,
      imagePath: data.imagePath,
      linkUrl: data.linkUrl
    }, true);
  });
}
