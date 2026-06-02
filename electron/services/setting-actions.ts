import type { WorkspaceServiceContext } from './workspace-service-context.js';

export function createSettingActions(context: WorkspaceServiceContext) {
  async function getSettingInfo() {
    const workspacePath = await context.getCurrentWorkspacePath();

    return context.withWorkspaceRepositories(workspacePath, async ({ settingInfo }) => {
      return settingInfo.findSettingInfo();
    });
  }

  async function updateSelectedEmbeddingModel(selectedEmbeddingModel: string | null) {
    const workspacePath = await context.getCurrentWorkspacePath();

    await context.withWorkspaceRepositories(workspacePath, async ({ settingInfo }) => {
      await settingInfo.updateSelectedEmbeddingModel(selectedEmbeddingModel);
    });

    return getSettingInfo();
  }

  async function updateSelectedLLMModel(selectedLLMModel: string | null) {
    const workspacePath = await context.getCurrentWorkspacePath();

    await context.withWorkspaceRepositories(workspacePath, async ({ settingInfo }) => {
      await settingInfo.updateSelectedLLMModel(selectedLLMModel);
    });

    return getSettingInfo();
  }

  return {
    getSettingInfo,
    updateSelectedEmbeddingModel,
    updateSelectedLLMModel,
  };
}
