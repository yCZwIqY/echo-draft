import { registerDirectoryIpcHandlers } from './directory.mjs';
import { registerWorkspaceIpcHandlers } from './workspace.mjs';

export function registerIpcHandlers(app) {
  registerDirectoryIpcHandlers();
  registerWorkspaceIpcHandlers(app);
}
