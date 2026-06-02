import { registerDirectoryIpcHandlers } from './directory.js';
import { registerSettingIpcHandlers } from './setting.js';
import { registerWorkspaceIpcHandlers } from './workspace.js';
import { registerDocumentIpcHandlers } from './document.js';
import { createWorkspaceService } from '../services/workspace-service.js';
import type { App } from 'electron';
import { registerEmbeddingIPCHandler } from './embedding.js';
import { registerCommentIpcHandlers } from './comment.js';

export function registerIpcHandlers(app: App) {
  const workspaceService = createWorkspaceService(app);

  registerDirectoryIpcHandlers();
  registerWorkspaceIpcHandlers(app, workspaceService);
  registerDocumentIpcHandlers(workspaceService);
  registerSettingIpcHandlers(workspaceService);
  registerEmbeddingIPCHandler(workspaceService);
  registerCommentIpcHandlers(workspaceService);
}
