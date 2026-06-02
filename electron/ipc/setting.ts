import { ipcMain } from 'electron';

import channels from '../common/channels.cjs';
import type { createWorkspaceService } from '../services/workspace-service.js';
import { optionalString } from './ipc-guards.js';

export function registerSettingIpcHandlers(
  workspaceService: ReturnType<typeof createWorkspaceService>,
) {
  ipcMain.handle(channels.setting.getInfo, async () => {
    return workspaceService.getSettingInfo();
  });

  ipcMain.handle(channels.setting.updateSelectedEmbeddingModel, async (_, selectedEmbeddingModel) => {
    return workspaceService.updateSelectedEmbeddingModel(
      optionalString(selectedEmbeddingModel, 'selectedEmbeddingModel') ?? null,
    );
  });

  ipcMain.handle(channels.setting.updateSelectedLLMModel, async (_, selectedLLMModel) => {
    return workspaceService.updateSelectedLLMModel(
      optionalString(selectedLLMModel, 'selectedLLMModel') ?? null,
    );
  });
}
