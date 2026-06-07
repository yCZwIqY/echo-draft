import { requireElectronApi } from '~/lib/electron/client';

export type OllamaModel = Awaited<
  ReturnType<Window['electronAPI']['listOllamaModels']>
>['models'][number];

export async function getOllamaRunning() {
  return requireElectronApi().isOllamaRunning();
}

export async function getOllamaModels() {
  return requireElectronApi().listOllamaModels();
}
