import fs from 'node:fs/promises';
import path from 'node:path';

import { getWorkspaceImagesDirectoryPath } from '../common/paths.js';
import { deleteFile, ensureDirectory } from './file-system.js';
import { ensureStore } from './workspace/store.js';
import { normalizePath, toFileSystemPath } from './workspace/shared.js';
import type { WorkspaceServiceContext } from './workspace-service-context.js';

export function createFileActions(context: WorkspaceServiceContext) {
  async function removeFile(targetPath: string) {
    return deleteFile(toFileSystemPath(targetPath));
  }

  async function saveImage(workflowPath: string, fileName: string, buffer: number[]) {
    const rootWorkspacePath = await context.getCurrentWorkspacePath();
    const normalizedWorkflowPath = normalizePath(workflowPath);
    await context.assertInsideWorkspace(normalizedWorkflowPath);
    await ensureStore(rootWorkspacePath);

    const imagesDirectoryPath = getWorkspaceImagesDirectoryPath(normalizePath(rootWorkspacePath));
    await ensureDirectory(imagesDirectoryPath);

    const safeFileName = path.basename(fileName);
    const targetPath = path.join(imagesDirectoryPath, `${crypto.randomUUID()}-${safeFileName}`);

    await fs.writeFile(targetPath, Buffer.from(buffer));

    return targetPath;
  }

  return {
    removeFile,
    saveImage,
    toFileSystemPath,
  };
}
