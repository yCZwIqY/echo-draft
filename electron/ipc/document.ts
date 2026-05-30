import { ipcMain } from 'electron';
import channels from '../common/channels.cjs';
import { parseDocumentUpdatePayload } from '../services/workspace/payloads.js';
import type { createWorkspaceService } from '../services/workspace-service.js';
import { optionalString, requireString } from './ipc-guards.js';

export function registerDocumentIpcHandlers(
  workspaceService: ReturnType<typeof createWorkspaceService>,
) {
  ipcMain.handle(channels.document.createDocument, async (_, workspace, name) => {
    return workspaceService.createDocument(
      requireString(workspace, 'workspace'),
      optionalString(name, 'name'),
    );
  });

  ipcMain.handle(channels.document.getDocument, async (_, documentPath) => {
    return workspaceService.getDocument(requireString(documentPath, 'documentPath'));
  });

  ipcMain.handle(channels.document.removeDocument, async (_, documentPath) => {
    return workspaceService.removeDocument(requireString(documentPath, 'documentPath'));
  });

  ipcMain.handle(channels.document.purgeDocument, async (_, documentPath) => {
    return workspaceService.purgeDocument(requireString(documentPath, 'documentPath'));
  });

  ipcMain.handle(channels.document.restoreDocument, async (_, documentPath) => {
    return workspaceService.restoreDocument(requireString(documentPath, 'documentPath'));
  });

  ipcMain.handle(channels.document.updateDocument, async (_, documentPath, data) => {
    return workspaceService.updateDocument(
      requireString(documentPath, 'documentPath'),
      parseDocumentUpdatePayload(data),
    );
  });
}
