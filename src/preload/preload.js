const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateMaterial: (data) => ipcRenderer.invoke('generate-material', data),
  onStreamChunk: (callback) => {
    const listener = (event, chunk) => callback(chunk);
    ipcRenderer.on('stream-chunk', listener);
    return () => ipcRenderer.removeListener('stream-chunk', listener);
  },
  onStreamComplete: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('stream-complete', listener);
    return () => ipcRenderer.removeListener('stream-complete', listener);
  },
});
