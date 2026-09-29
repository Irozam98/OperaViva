const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  savePDF: (options) => ipcRenderer.invoke('save-pdf', options),
  previewPDF: (options) => ipcRenderer.invoke('preview-pdf', options),
  print: () => ipcRenderer.invoke('print'),
  openPath: (targetPath) => ipcRenderer.invoke('open-path', targetPath)
});
