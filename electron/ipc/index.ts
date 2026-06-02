import { registerDirectoryIpcHandlers } from './directory.js';
import { registerSettingIpcHandlers } from './setting.js';
import { registerWorkspaceIpcHandlers } from './workspace.js';
import { registerDocumentIpcHandlers } from './document.js';
import { createWorkspaceService } from '../services/workspace-service.js';
import type { App } from 'electron';

export function registerIpcHandlers(app: App) {
  const workspaceService = createWorkspaceService(app);

  registerDirectoryIpcHandlers();
  registerWorkspaceIpcHandlers(app, workspaceService);
  registerDocumentIpcHandlers(workspaceService);
  registerSettingIpcHandlers(workspaceService);
}
