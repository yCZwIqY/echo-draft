import ollama from 'ollama/browser';
import type { ModelResponse } from 'ollama';

import { showToast } from '~/lib/toast-manager';

export const DEFAULT_EMBEDDING_MODEL = 'dengcao/Qwen3-Embedding-0.6B:Q8_0';
export type OllamaModel = ModelResponse & { capabilities: string[] };

export async function getOllamaRunning() {
  try {
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}

export async function getOllamaModels() {
  try {
    const response = await ollama.list();
    const models = await Promise.all(
      response.models.map(async (model): Promise<OllamaModel> => {
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

    return {
      models,
    };
  } catch (error) {
    showToast(JSON.stringify(error), 'danger');
    return {
      models: [],
    };
  }
}

export async function getOllamaEmbeddings(
  input: string | string[],
  model = DEFAULT_EMBEDDING_MODEL,
) {
  return ollama.embed({
    model,
    input,
  });
}
