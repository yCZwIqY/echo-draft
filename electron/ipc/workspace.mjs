import fs from 'node:fs';

import { BrowserWindow, dialog, ipcMain, shell } from 'electron';

import channels from '../common/channels.cjs';
import { ensureDirectory } from '../services/file-system.mjs';
import { createWorkspaceService } from '../services/workspace-service.mjs';

export function registerWorkspaceIpcHandlers(app) {
  const workspaceService = createWorkspaceService(app);
  let workspaceWatcher = null;
  let watchedWorkspacePath = null;
  let notifyTreeChangedTimer = null;

  function broadcastWorkspaceTreeChanged() {
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(channels.workspace.treeChanged);
      }
    }
  }

  function scheduleWorkspaceTreeChanged() {
    if (notifyTreeChangedTimer) {
      clearTimeout(notifyTreeChangedTimer);
    }

    notifyTreeChangedTimer = setTimeout(() => {
      notifyTreeChangedTimer = null;
      broadcastWorkspaceTreeChanged();
    }, 100);
  }

  function stopWorkspaceWatcher() {
    workspaceWatcher?.close();
    workspaceWatcher = null;
    watchedWorkspacePath = null;
  }

  function startWorkspaceWatcher(workspacePath) {
    if (!workspacePath || watchedWorkspacePath === workspacePath) {
      return;
    }

    stopWorkspaceWatcher();

    workspaceWatcher = fs.watch(
      workspacePath,
      {
        recursive: true,
      },
      () => {
        scheduleWorkspaceTreeChanged();
      },
    );

    workspaceWatcher.on('error', () => {
      stopWorkspaceWatcher();
    });

    watchedWorkspacePath = workspacePath;
  }

  ipcMain.handle(channels.workspace.getWorkspaceTree, async (_, path) => {
    const rootWorkspace = await workspaceService.getCurrentWorkspaceInfo();
    startWorkspaceWatcher(rootWorkspace.path);
    return workspaceService.getWorkspaceTree(path);
  });

  ipcMain.handle(channels.workspace.getCurrentPath, async () => {
    const workspaceInfo = await workspaceService.getCurrentWorkspaceInfo();
    startWorkspaceWatcher(workspaceInfo.path);
    return workspaceInfo;
  });

  ipcMain.handle(channels.workspace.initCurrent, async () => {
    const workspaceInfo = await workspaceService.initCurrentWorkspace();
    startWorkspaceWatcher(workspaceInfo.path);
    return workspaceInfo;
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

    const workspaceInfo = await workspaceService.setCurrentWorkspacePath(workspacePath);
    startWorkspaceWatcher(workspaceInfo.path);
    scheduleWorkspaceTreeChanged();
    return workspaceInfo;
  });

  ipcMain.handle(channels.workspace.resetPath, async () => {
    const workspaceInfo = await workspaceService.resetWorkspacePath();
    startWorkspaceWatcher(workspaceInfo.path);
    scheduleWorkspaceTreeChanged();
    return workspaceInfo;
  });

  ipcMain.handle(channels.workspace.createWorkspace, async (_, name) => {
    const workspace = await workspaceService.createWorkspace(name);
    scheduleWorkspaceTreeChanged();
    return workspace;
  });

  ipcMain.handle(channels.workspace.renameWorkspace, async (_, oldWorkspacePath, newName) => {
    const workspace = await workspaceService.renameWorkspace(oldWorkspacePath, newName);
    scheduleWorkspaceTreeChanged();
    return workspace;
  });

  ipcMain.handle(channels.workspace.removeWorkspace, async (_, targetPath) => {
    const result = await workspaceService.removeWorkspace(targetPath);
    scheduleWorkspaceTreeChanged();
    return result;
  });

  ipcMain.handle(channels.workspace.purgeWorkspace, async (_, targetPath) => {
    const result = await workspaceService.purgeWorkspace(targetPath);
    scheduleWorkspaceTreeChanged();
    return result;
  });

  ipcMain.handle(channels.workspace.restoreWorkspace, async (_, targetPath) => {
    const result = await workspaceService.restoreWorkspace(targetPath);
    scheduleWorkspaceTreeChanged();
    return result;
  });

  ipcMain.handle(channels.workspace.updateRoot, async (_, name) => {
    const workspaceInfo = await workspaceService.updateRoot(name);
    startWorkspaceWatcher(workspaceInfo.path);
    scheduleWorkspaceTreeChanged();
    return workspaceInfo;
  });

  ipcMain.handle(channels.workspace.getWorkspaceInfo, async (_, targetPath) => {
    const data = await workspaceService.getWorkflowInfo(targetPath);
    return data;
  });

  ipcMain.handle(channels.workspace.getTrashItems, async () => {
    return workspaceService.getTrashItems();
  });

  ipcMain.handle(channels.workspace.updateWorkspaceInfo, async (_, targetPath, workflowInfo) => {
    const data = await workspaceService.updateWorkspaceInfo(targetPath, workflowInfo);
    return data;
  });

  app.on('before-quit', () => {
    if (notifyTreeChangedTimer) {
      clearTimeout(notifyTreeChangedTimer);
    }

    stopWorkspaceWatcher();
  });

  ipcMain.handle(channels.file.saveImage, async (_, workflowPath, fileName, buffer) => {
    return workspaceService.saveImage(workflowPath, fileName, buffer);
  });

  ipcMain.handle(channels.file.remove, async (_, filePath) => {
    await workspaceService.removeFile(filePath);
  });

  ipcMain.handle(channels.file.showInFolder, async (_, filePath) => {
    const targetPath = workspaceService.toFileSystemPath(filePath);

    console.log('[showInFolder] input:', filePath.slice(0,100));
    console.log('[showInFolder] target:', targetPath.slice(0,100));

    shell.showItemInFolder(targetPath);

    return targetPath;
  });
}
