import type { createWorkspaceService } from '../services/workspace-service.js';
import channels from '../common/channels.cjs';
import { ipcMain } from 'electron';

export function registerCommentIpcHandlers(
  workspaceService: ReturnType<typeof createWorkspaceService>,
) {
  ipcMain.handle(channels.comment.generateComments, async (_, payload) => {
    return workspaceService.generateComments(payload);
  });
}
