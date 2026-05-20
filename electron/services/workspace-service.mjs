import path from 'node:path';
import fs from 'node:fs/promises';

import { getDefaultWorkspacePath } from '../common/paths.mjs';
import { ensureDirectory, pathExists } from './file-system.mjs';
import { createSettingsStore } from './settings-store.mjs';

export function createWorkspaceService(app) {
  const settingsStore = createSettingsStore(app);

  async function getCurrentWorkspacePath() {
    const settings = await settingsStore.read();
    return settings.workspacePath ?? getDefaultWorkspacePath();
  }

  async function getWorkspaceInfo(workspacePath) {
    return {
      path: workspacePath,
      exists: await pathExists(workspacePath),
    };
  }

  async function getCurrentWorkspaceInfo() {
    return getWorkspaceInfo(await getCurrentWorkspacePath());
  }

  async function setCurrentWorkspacePath(workspacePath) {
    const settings = await settingsStore.read();

    await settingsStore.write({
      ...settings,
      workspacePath,
    });

    return {
      path: workspacePath,
      exists: true,
    };
  }

  async function initCurrentWorkspace() {
    const workspacePath = await getCurrentWorkspacePath();
    await ensureDirectory(workspacePath);

    return {
      path: workspacePath,
      exists: true,
    };
  }

  async function resetWorkspacePath() {
    const defaultWorkspacePath = getDefaultWorkspacePath();
    await ensureDirectory(defaultWorkspacePath);

    return setCurrentWorkspacePath(defaultWorkspacePath);
  }

  function sanitizeGroupName(name) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error('그룹 이름이 비어 있습니다.');
    }

    if (/[\\/:*?"<>|]/.test(trimmedName)) {
      throw new Error('그룹 이름에 사용할 수 없는 문자가 포함되어 있습니다.');
    }

    return trimmedName;
  }

  async function assertInsideWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const resolvedWorkspacePath = path.resolve(workspacePath);
    const resolvedTargetPath = path.resolve(targetPath);
    const relativePath = path.relative(resolvedWorkspacePath, resolvedTargetPath);
    const isOutside = relativePath.startsWith('..') || path.isAbsolute(relativePath);

    if (isOutside) {
      throw new Error('작업 폴더 밖의 경로에는 접근할 수 없습니다.');
    }
  }

  async function addGroup(name) {
    const workspacePath = await getCurrentWorkspacePath();
    const safeName = sanitizeGroupName(name);
    const groupPath = path.join(workspacePath, safeName);

    await assertInsideWorkspace(groupPath);
    await ensureDirectory(groupPath);

    return {
      name: safeName,
      path: groupPath,
    };
  }

  async function renameWorkspace(oldWorkspacePath, newName) {
    await assertInsideWorkspace(oldWorkspacePath);

    const safeNewName = sanitizeGroupName(newName);
    const parentPath = path.dirname(oldWorkspacePath);
    const newWorkspacePath = path.join(parentPath, safeNewName);

    await assertInsideWorkspace(newWorkspacePath);
    await fs.rename(oldWorkspacePath, newWorkspacePath);

    return {
      oldPath: oldWorkspacePath,
      newPath: newWorkspacePath,
    };
  }

  async function removeWorkspace(targetPath) {
    await assertInsideWorkspace(targetPath);

    await fs.rm(targetPath, {
      recursive: true,
      force: true,
    });

    return {
      removed: true,
      path: targetPath,
    };
  }

  async function updateRoot(targetPath) {
    const settings = await settingsStore.read();
   await settingsStore.write({
      ...settings,
      workspacePath: targetPath,
    });
  }

  return {
    addGroup,
    getCurrentWorkspaceInfo,
    initCurrentWorkspace,
    removeWorkspace,
    renameWorkspace,
    resetWorkspacePath,
    setCurrentWorkspacePath,
    updateRoot
  };
}
