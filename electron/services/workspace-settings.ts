import type { App } from 'electron';

import { getDefaultWorkspacePath } from '../common/paths.js';
import { createSettingsStore } from './settings-store.js';
import { pathExists } from './file-system.js';
import { normalizePath } from './workspace/shared.js';
import { ensureStore } from './workspace/store.js';

export function createWorkspaceSettings(app: Pick<App, 'getPath'>) {
  const settingsStore = createSettingsStore(app);

  async function getCurrentWorkspacePath() {
    const settings = await settingsStore.read();
    return settings.workspacePath ?? getDefaultWorkspacePath();
  }

  async function getWorkspaceInfo(workspacePath: string) {
    const normalizedWorkspacePath = normalizePath(workspacePath);

    return {
      path: normalizedWorkspacePath,
      exists: await pathExists(normalizedWorkspacePath),
    };
  }

  async function getCurrentWorkspaceInfo() {
    return getWorkspaceInfo(await getCurrentWorkspacePath());
  }

  async function setCurrentWorkspacePath(workspacePath: string) {
    const normalizedWorkspacePath = normalizePath(workspacePath);
    const settings = await settingsStore.read();

    await ensureStore(normalizedWorkspacePath);
    await settingsStore.write({
      ...settings,
      workspacePath: normalizedWorkspacePath,
    });

    return {
      path: normalizedWorkspacePath,
      exists: true,
    };
  }

  async function initCurrentWorkspace() {
    const workspacePath = await getCurrentWorkspacePath();
    await ensureStore(workspacePath);

    return {
      path: workspacePath,
      exists: true,
    };
  }

  async function resetWorkspacePath() {
    const defaultWorkspacePath = getDefaultWorkspacePath();
    await ensureStore(defaultWorkspacePath);

    return setCurrentWorkspacePath(defaultWorkspacePath);
  }

  async function updateRoot(targetPath: string) {
    const normalizedTargetPath = normalizePath(targetPath);
    const settings = await settingsStore.read();

    await ensureStore(normalizedTargetPath);
    await settingsStore.write({
      ...settings,
      workspacePath: normalizedTargetPath,
    });

    return {
      path: normalizedTargetPath,
      exists: await pathExists(normalizedTargetPath),
    };
  }

  return {
    getCurrentWorkspaceInfo,
    getCurrentWorkspacePath,
    getWorkspaceInfo,
    initCurrentWorkspace,
    resetWorkspacePath,
    setCurrentWorkspacePath,
    settingsStore,
    updateRoot,
  };
}
