import { requireElectronApi } from './client';

export async function getSettingInfo() {
  return requireElectronApi().getSettingInfo();
}

export async function updateSelectedEmbeddingModel(selectedEmbeddingModel: string | null) {
  return requireElectronApi().updateSelectedEmbeddingModel(selectedEmbeddingModel);
}

export async function updateSelectedLLMModel(selectedLLMModel: string | null) {
  return requireElectronApi().updateSelectedLLMModel(selectedLLMModel);
}
