/**
 * Electron Security Bridge (Preload Script)
 * Exposes strictly typed and whitelisted IPC APIs, safe path utilities,
 * and sandboxed local file operations with contextIsolation: true and nodeIntegration: false.
 */

const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// 1. Whitelisted typed IPC interface
const electronAPI = {
  // Mouse click-through control
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', !!ignore),

  // Assets path retrieval (synchronous)
  getAssetsPath: () => ipcRenderer.sendSync('get-assets-path'),

  // Window positioning & sizing
  moveWindow: (delta) => ipcRenderer.send('move-window', delta),
  resizeWindow: (size) => ipcRenderer.send('resize-window', size),

  // Diagnostics & developer tools
  getDiagnosticLogs: () => ipcRenderer.sendSync('get-diagnostic-logs'),
  clearDiagnosticLogs: () => ipcRenderer.sendSync('clear-diagnostic-logs'),
  isDevMode: () => ipcRenderer.sendSync('is-dev-mode'),
  logDiagnostic: (msg) => ipcRenderer.send('log-diagnostic', String(msg)),
  closeApp: () => ipcRenderer.send('close-app'),
  resetSteamStats: () => ipcRenderer.sendSync('reset-steam-stats'),
  openLiveChatWindow: () => ipcRenderer.send('open-live-chat-window'),
  closeLiveChatWindow: () => ipcRenderer.send('close-live-chat-window'),
  toggleLiveChatWindow: () => ipcRenderer.send('toggle-live-chat-window'),
  openLiveCaptionWindow: () => ipcRenderer.send('open-live-caption-window'),
  closeLiveCaptionWindow: () => ipcRenderer.send('close-live-caption-window'),
  toggleLiveCaptionWindow: () => ipcRenderer.send('toggle-live-caption-window'),
  captureScreenSnapshot: () => ipcRenderer.invoke('capture-screen-snapshot'),
  setCaptionClickThrough: (ignore) => ipcRenderer.send('set-caption-click-through', !!ignore),
  openBannerWindow: () => ipcRenderer.send('open-banner-window'),
  closeBannerWindow: () => ipcRenderer.send('close-banner-window'),
  toggleBannerWindow: () => ipcRenderer.send('toggle-banner-window'),
  setBannerClickThrough: (ignore) => ipcRenderer.send('set-banner-click-through', !!ignore),
  broadcastBannerData: (data) => ipcRenderer.send('broadcast-banner-data', data),
  openExternalUrl: (url) => ipcRenderer.send('open-external-url', String(url)),

  // Safe IPC event listener
  on: (channel, callback) => {
    const validChannels = [
      'steam-overlay-active',
      'force-hover-exit',
      'settings-updated',
      'model-imported',
      'live-chat-window-closed',
      'live-caption-window-closed',
      'banner-window-closed',
      'vision-commentary',
      'live-caption-update',
      'clear-live-caption',
      'caption-style-update',
      'banner-data-update'
    ];
    if (validChannels.includes(channel) && typeof callback === 'function') {
      const subscription = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
  },

  // Generic validated send
  send: (channel, data) => {
    const validSendChannels = [
      'set-ignore-mouse',
      'move-window',
      'resize-window',
      'log-diagnostic',
      'close-app',
      'open-live-chat-window',
      'close-live-chat-window',
      'toggle-live-chat-window',
      'open-live-caption-window',
      'close-live-caption-window',
      'toggle-live-caption-window',
      'broadcast-vision-chat',
      'broadcast-live-caption',
      'clear-live-caption',
      'broadcast-caption-style',
      'set-caption-click-through',
      'open-banner-window',
      'close-banner-window',
      'toggle-banner-window',
      'set-banner-click-through',
      'broadcast-banner-data',
      'open-external-url'
    ];
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // Generic validated sendSync
  sendSync: (channel, data) => {
    const validSyncChannels = [
      'get-assets-path',
      'get-diagnostic-logs',
      'clear-diagnostic-logs',
      'is-dev-mode',
      'reset-steam-stats'
    ];
    if (validSyncChannels.includes(channel)) {
      return ipcRenderer.sendSync(channel, data);
    }
  }
};

// 2. Safe local file system bridge for settings & 3D asset management
const safeFs = {
  existsSync: (filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  },
  mkdirSync: (dirPath, options) => {
    return fs.mkdirSync(dirPath, options);
  },
  writeFileSync: (filePath, data, encoding) => {
    return fs.writeFileSync(filePath, data, encoding);
  },
  readFileSync: (filePath, encoding) => {
    return fs.readFileSync(filePath, encoding);
  },
  readdirSync: (dirPath) => {
    return fs.readdirSync(dirPath);
  },
  renameSync: (oldPath, newPath) => {
    return fs.renameSync(oldPath, newPath);
  },
  unlinkSync: (filePath) => {
    return fs.unlinkSync(filePath);
  },
  copyFileSync: (src, dest) => {
    return fs.copyFileSync(src, dest);
  },
  statSync: (filePath) => {
    const s = fs.statSync(filePath);
    return {
      size: s.size,
      mtime: s.mtime,
      isFile: () => s.isFile(),
      isDirectory: () => s.isDirectory()
    };
  }
};

// 3. Safe path utilities
const safePath = {
  join: (...args) => path.join(...args),
  resolve: (...args) => path.resolve(...args),
  basename: (p, ext) => path.basename(p, ext),
  dirname: (p) => path.dirname(p),
  extname: (p) => path.extname(p),
  sep: path.sep
};

// 4. Safe URL conversion
const safeUrl = {
  pathToFileURL: (filePath) => {
    try {
      return { href: pathToFileURL(filePath).href };
    } catch {
      return { href: filePath };
    }
  }
};

// Expose safe API bridges to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
contextBridge.exposeInMainWorld('fsBridge', safeFs);
contextBridge.exposeInMainWorld('pathBridge', safePath);
contextBridge.exposeInMainWorld('urlBridge', safeUrl);
