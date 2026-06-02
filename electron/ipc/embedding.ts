import { ipcMain } from 'electron';
import channels from '../common/channels.cjs';
import type { createWorkspaceService } from '../services/workspace-service.js';
import { requireString } from './ipc-guards.js';

export function registerEmbeddingIPCHandler(
  workspaceService: ReturnType<typeof createWorkspaceService>,
) {
  ipcMain.handle(channels.embedding.indexDocument, async (_, targetPath) => {
    return workspaceService.indexDocument(requireString(targetPath, 'targetPath'));
  });
  ipcMain.handle(channels.embedding.searchDocument, async (_, query, limit = 10) => {
    return workspaceService.searchDocuments(requireString(query, 'query'), limit);
  });
}
