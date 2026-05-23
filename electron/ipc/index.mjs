import { registerDirectoryIpcHandlers } from './directory.mjs';
import { registerWorkspaceIpcHandlers } from './workspace.mjs';
import { registerDocumentIpcHandlers } from './document.mjs';

export function registerIpcHandlers(app) {
  registerDirectoryIpcHandlers();
  registerWorkspaceIpcHandlers(app);
  registerDocumentIpcHandlers(app);
}
