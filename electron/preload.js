const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  toggleOnTop: () => ipcRenderer.send('window-toggle-on-top'),
  onTopChanged: (cb) => ipcRenderer.on('on-top-changed', (_, val) => cb(val)),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size'),
  getAuthCode: () => ipcRenderer.invoke('get-auth-code'),
  getWallpaper: () => ipcRenderer.invoke('get-wallpaper'),
  exchangeCode: (params) => ipcRenderer.invoke('exchange-code', params),
  refreshToken: (params) => ipcRenderer.invoke('refresh-token', params),
  saveTokens: (tokens) => ipcRenderer.invoke('save-tokens', tokens),
  loadTokens: () => ipcRenderer.invoke('load-tokens')
});
