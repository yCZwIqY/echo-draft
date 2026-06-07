import { ipcMain } from 'electron';
import ollama from 'ollama';

import channels from '../common/channels.cjs';

export function registerOllamaIpcHandlers() {
  ipcMain.handle(channels.ollama.isRunning, async () => {
    try {
      await ollama.list();
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle(channels.ollama.listModels, async () => {
    const response = await ollama.list();
    const models = await Promise.all(
      response.models.map(async (model) => {
        try {
          const detail = await ollama.show({
            model: model.model,
          });

          return {
            ...model,
            capabilities: detail.capabilities ?? [],
          };
        } catch {
          return {
            ...model,
            capabilities: [],
          };
        }
      }),
    );

    return { models };
  });
}
