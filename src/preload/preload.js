const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateMaterial: (data) => ipcRenderer.invoke('generate-material', data),
  testConnection: (settings) => ipcRenderer.invoke('test-connection', settings),
});
