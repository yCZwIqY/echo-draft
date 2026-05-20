const { contextBridge, ipcRenderer } = require('electron');
const channels = require('./common/channels.cjs');

contextBridge.exposeInMainWorld('electronMeta', {
  preloadReady: true,
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke(channels.folder.select),
  readFile: (filePath) => ipcRenderer.invoke(channels.file.read, filePath),
  getCurrentWorkspacePath: () => ipcRenderer.invoke(channels.workspace.getCurrentPath),
  initCurrentWorkspace: () => ipcRenderer.invoke(channels.workspace.initCurrent),
  selectWorkspacePath: () => ipcRenderer.invoke(channels.workspace.selectPath),
  resetWorkspacePath: () => ipcRenderer.invoke(channels.workspace.resetPath),
  addGroup: (name) => ipcRenderer.invoke(channels.workspace.addGroup, name),
  renameGroup: (oldWorkspacePath, newName) =>
    ipcRenderer.invoke(channels.workspace.renameGroup, oldWorkspacePath, newName),
  removeGroup: (targetPath) => ipcRenderer.invoke(channels.workspace.removeGroup, targetPath),
});
