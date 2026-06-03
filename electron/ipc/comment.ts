import type { createWorkspaceService } from '../services/workspace-service.js';
import channels from '../common/channels.cjs';
import { ipcMain } from 'electron';
import { requireString } from './ipc-guards.js';

export function registerCommentIpcHandlers(
  workspaceService: ReturnType<typeof createWorkspaceService>,
) {
  ipcMain.handle(channels.comment.addExample, async (_, payload) => {
    return workspaceService.addCommentExample(payload);
  });

  ipcMain.handle(channels.comment.generateComments, async (_, payload) => {
    return workspaceService.generateComments(payload);
  });

  ipcMain.handle(channels.comment.listExamples, async () => {
    return workspaceService.listCommentExamples();
  });

  ipcMain.handle(channels.comment.removeExample, async (_, id) => {
    return workspaceService.removeCommentExample(requireString(id, 'id'));
  });
}
