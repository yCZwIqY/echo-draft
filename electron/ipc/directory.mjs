import { dialog, ipcMain } from 'electron';
import path from 'node:path';

import channels from '../common/channels.cjs';
import { readDirectoryTree, readTextFile } from '../services/file-system.mjs';

export function registerDirectoryIpcHandlers() {
  ipcMain.handle(channels.folder.select, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const rootPath = result.filePaths[0];

    return {
      name: path.basename(rootPath),
      path: rootPath,
      type: 'directory',
      children: await readDirectoryTree(rootPath, {
        maxDepth: 6,
        ignore: ['app.json'],
      }),
    };
  });

  ipcMain.handle(channels.file.read, async (_, filePath) => {
    return readTextFile(filePath);
  });
}
