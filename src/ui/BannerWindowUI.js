/**
 * BannerWindowUI.js
 * Controls the Sponsor & Ad Banner Window settings in the Studio Panel.
 * Handles image upload / preview, transparent background configuration,
 * click-through toggles, target URLs, and real-time IPC synchronization.
 */

export class BannerWindowUI {
  constructor(deps = {}) {
    this.currentSettings = deps.currentSettings || {};
    this.saveSettingsFile = deps.saveSettingsFile;

    // Elements
    this.btnLaunch = null;
    this.statusTag = null;
    this.inputFile = null;
    this.btnUpload = null;
    this.btnClearImage = null;
    this.inputLinkUrl = null;
    this.inputBgColor = null;
    this.labelBgHex = null;
    this.sliderOpacity = null;
    this.labelOpacityVal = null;
    this.checkboxClickThrough = null;
    this.imgPreview = null;
    this.previewEmpty = null;
  }

  init() {
    this.btnLaunch = document.getElementById('btn-studio-launch-banner-window');
    this.statusTag = document.getElementById('studio-banner-window-status');
    this.inputFile = document.getElementById('studio-banner-file-input');
    this.btnUpload = document.getElementById('btn-studio-upload-banner');
    this.btnClearImage = document.getElementById('btn-studio-clear-banner-image');
    this.inputLinkUrl = document.getElementById('studio-banner-link-url');
    this.inputBgColor = document.getElementById('studio-banner-bg-color');
    this.labelBgHex = document.getElementById('studio-banner-bg-hex');
    this.sliderOpacity = document.getElementById('studio-banner-opacity');
    this.labelOpacityVal = document.getElementById('studio-banner-opacity-val');
    this.checkboxClickThrough = document.getElementById('studio-banner-click-through');
    this.imgPreview = document.getElementById('studio-banner-preview-img');
    this.previewEmpty = document.getElementById('studio-banner-preview-empty');

    this.initWindowControls();
    this.initImageControls();
    this.initAppearanceControls();
    this.initIPCListeners();
  }

  initWindowControls() {
    if (this.btnLaunch) {
      this.btnLaunch.addEventListener('click', () => {
        const api = window.electronAPI;
        if (api && typeof api.toggleBannerWindow === 'function') {
          api.toggleBannerWindow();
        } else if (api && typeof api.send === 'function') {
          api.send('toggle-banner-window');
        }
        this.updateStatus('🪟 Banner Window Toggled');
      });
    }

    if (this.checkboxClickThrough) {
      this.checkboxClickThrough.checked = this.currentSettings.bannerClickThrough === true;
      this.checkboxClickThrough.addEventListener('change', () => {
        const enabled = this.checkboxClickThrough.checked;
        this.currentSettings.bannerClickThrough = enabled;
        if (this.saveSettingsFile) this.saveSettingsFile();
        const api = window.electronAPI;
        if (api && typeof api.setBannerClickThrough === 'function') {
          api.setBannerClickThrough(enabled);
        } else if (api && typeof api.send === 'function') {
          api.send('set-banner-click-through', enabled);
        }
        this.updateStatus(enabled ? '🖱️ Click-Through Enabled' : '🖐️ Click-Through Disabled');
      });
    }

    // Auto-sync click-through on startup
    if (this.currentSettings.bannerClickThrough) {
      const api = window.electronAPI;
      if (api && typeof api.setBannerClickThrough === 'function') {
        api.setBannerClickThrough(true);
      } else if (api && typeof api.send === 'function') {
        api.send('set-banner-click-through', true);
      }
    }

    // Auto-open on launch if configured
    if (this.currentSettings.bannerAutoOpen) {
      const api = window.electronAPI;
      if (api && typeof api.openBannerWindow === 'function') {
        api.openBannerWindow();
      } else if (api && typeof api.send === 'function') {
        api.send('open-banner-window');
      }
    }
  }

  initImageControls() {
    // Initial preview render
    this.updateImagePreview(this.currentSettings.bannerImagePath);

    if (this.btnUpload && this.inputFile) {
      this.btnUpload.addEventListener('click', () => {
        this.inputFile.click();
      });

      this.inputFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          this.currentSettings.bannerImagePath = dataUrl;
          this.updateImagePreview(dataUrl);
          if (this.saveSettingsFile) this.saveSettingsFile();
          this.broadcastBannerData();
          this.updateStatus('🖼️ Banner Image Updated');
        };
        reader.readAsDataURL(file);
      });
    }

    if (this.btnClearImage) {
      this.btnClearImage.addEventListener('click', () => {
        this.currentSettings.bannerImagePath = '';
        if (this.inputFile) this.inputFile.value = '';
        this.updateImagePreview('');
        if (this.saveSettingsFile) this.saveSettingsFile();
        this.broadcastBannerData();
        this.updateStatus('🗑️ Banner Image Cleared');
      });
    }

    if (this.inputLinkUrl) {
      this.inputLinkUrl.value = this.currentSettings.bannerLinkUrl || '';
      const onUrlChange = (e) => {
        this.currentSettings.bannerLinkUrl = e.target.value.trim();
        if (this.saveSettingsFile) this.saveSettingsFile();
        this.broadcastBannerData();
      };
      this.inputLinkUrl.addEventListener('input', onUrlChange);
      this.inputLinkUrl.addEventListener('change', onUrlChange);
    }
  }

  initAppearanceControls() {
    const defaultBg = this.currentSettings.bannerBgColor || '#0b0f19';
    const defaultOp = this.currentSettings.bannerBgOpacity !== undefined ? this.currentSettings.bannerBgOpacity : 0.85;

    if (this.inputBgColor) {
      this.inputBgColor.value = defaultBg;
      if (this.labelBgHex) this.labelBgHex.innerText = defaultBg.toUpperCase();
      const onBgChange = (e) => {
        const hex = e.target.value;
        if (this.labelBgHex) this.labelBgHex.innerText = hex.toUpperCase();
        this.currentSettings.bannerBgColor = hex;
        if (this.saveSettingsFile) this.saveSettingsFile();
        this.broadcastBannerData();
      };
      this.inputBgColor.addEventListener('input', onBgChange);
      this.inputBgColor.addEventListener('change', onBgChange);
    }

    if (this.sliderOpacity) {
      const pct = Math.round(defaultOp * 100);
      this.sliderOpacity.value = pct;
      if (this.labelOpacityVal) this.labelOpacityVal.innerText = `${pct}%`;
      const onOpChange = (e) => {
        const opVal = parseInt(e.target.value, 10) / 100;
        if (this.labelOpacityVal) this.labelOpacityVal.innerText = `${parseInt(e.target.value, 10)}%`;
        this.currentSettings.bannerBgOpacity = opVal;
        if (this.saveSettingsFile) this.saveSettingsFile();
        this.broadcastBannerData();
      };
      this.sliderOpacity.addEventListener('input', onOpChange);
      this.sliderOpacity.addEventListener('change', onOpChange);
    }
  }

  initIPCListeners() {
    const api = window.electronAPI;
    if (api && typeof api.on === 'function') {
      api.on('banner-window-closed', () => {
        this.updateStatus('⚪ Window Closed');
      });
    }
  }

  updateImagePreview(imgSrc) {
    if (imgSrc && imgSrc.trim()) {
      if (this.imgPreview) {
        this.imgPreview.src = imgSrc;
        this.imgPreview.style.display = 'block';
      }
      if (this.previewEmpty) {
        this.previewEmpty.style.display = 'none';
      }
    } else {
      if (this.imgPreview) {
        this.imgPreview.src = '';
        this.imgPreview.style.display = 'none';
      }
      if (this.previewEmpty) {
        this.previewEmpty.style.display = 'flex';
      }
    }
  }

  broadcastBannerData() {
    const api = window.electronAPI;
    const data = {
      imagePath: this.currentSettings.bannerImagePath || '',
      linkUrl: this.currentSettings.bannerLinkUrl || '',
      bgColor: this.currentSettings.bannerBgColor || '#0b0f19',
      bgOpacity: this.currentSettings.bannerBgOpacity !== undefined ? this.currentSettings.bannerBgOpacity : 0.85
    };

    if (api && typeof api.broadcastBannerData === 'function') {
      api.broadcastBannerData(data);
    } else if (api && typeof api.send === 'function') {
      api.send('broadcast-banner-data', data);
    }
  }

  updateStatus(msg) {
    if (this.statusTag) {
      this.statusTag.innerText = msg;
    }
  }
}

export let bannerWindowUI = null;
export function setupBannerWindowUI(deps = {}) {
  bannerWindowUI = new BannerWindowUI(deps);
  bannerWindowUI.init();
  return bannerWindowUI;
}
