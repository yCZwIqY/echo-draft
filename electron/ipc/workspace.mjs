import { dialog, ipcMain } from 'electron';

import channels from '../common/channels.cjs';
import { ensureDirectory } from '../services/file-system.mjs';
import { createWorkspaceService } from '../services/workspace-service.mjs';

export function registerWorkspaceIpcHandlers(app) {
  const workspaceService = createWorkspaceService(app);

  ipcMain.handle(channels.workspace.getCurrentPath, async () => {
    return workspaceService.getCurrentWorkspaceInfo();
  });

  ipcMain.handle(channels.workspace.initCurrent, async () => {
    return workspaceService.initCurrentWorkspace();
  });

  ipcMain.handle(channels.workspace.selectPath, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const workspacePath = result.filePaths[0];
    await ensureDirectory(workspacePath);

    return workspaceService.setCurrentWorkspacePath(workspacePath);
  });

  ipcMain.handle(channels.workspace.resetPath, async () => {
    return workspaceService.resetWorkspacePath();
  });

  ipcMain.handle(channels.workspace.addGroup, async (_, name) => {
    return workspaceService.addGroup(name);
  });

  ipcMain.handle(channels.workspace.renameGroup, async (_, oldWorkspacePath, newName) => {
    return workspaceService.renameWorkspace(oldWorkspacePath, newName);
  });

  ipcMain.handle(channels.workspace.removeGroup, async (_, targetPath) => {
    return workspaceService.removeWorkspace(targetPath);
  });

  ipcMain.handle(channels.workspace.updateRoot, async (_, name) => {
    return workspaceService.updateRoot(name);
  })
}
