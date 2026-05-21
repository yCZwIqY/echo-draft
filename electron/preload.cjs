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

  //workspace
  getWorkspaceTree: () => ipcRenderer.invoke(channels.workspace.getWorkspaceTree),
  onWorkspaceTreeChanged: (listener) => {
    const wrappedListener = () => listener();
    ipcRenderer.on(channels.workspace.treeChanged, wrappedListener);

    return () => {
      ipcRenderer.removeListener(channels.workspace.treeChanged, wrappedListener);
    };
  },
  getCurrentWorkspacePath: () => ipcRenderer.invoke(channels.workspace.getCurrentPath),
  initCurrentWorkspace: () => ipcRenderer.invoke(channels.workspace.initCurrent),
  selectWorkspacePath: () => ipcRenderer.invoke(channels.workspace.selectPath),
  resetWorkspacePath: () => ipcRenderer.invoke(channels.workspace.resetPath),
  updateWorkspaceRoot: (targetPath) =>
    ipcRenderer.invoke(channels.workspace.updateRoot, targetPath),
  createWorkspace: (name) => ipcRenderer.invoke(channels.workspace.createWorkspace, name),
  renameWorkspace: (oldWorkspacePath, newName) =>
    ipcRenderer.invoke(channels.workspace.renameWorkspace, oldWorkspacePath, newName),
  removeWorkspace: (targetPath) =>
    ipcRenderer.invoke(channels.workspace.removeWorkspace, targetPath),
  getWorkspaceInfo: (targetPath) =>
    ipcRenderer.invoke(channels.workspace.getWorkspaceInfo, targetPath),
  updateWorkspaceInfo: (targetPath, workspaceInfo) =>
    ipcRenderer.invoke(channels.workspace.updateWorkspaceInfo, targetPath, workspaceInfo),

  //document
  createDocument: () => ipcRenderer.invoke(channels.document.createDocument),
});
