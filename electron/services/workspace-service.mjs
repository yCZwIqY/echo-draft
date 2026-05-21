import path from 'node:path';
import fs from 'node:fs/promises';

import { getDefaultWorkspaceDataFilePath, getDefaultWorkspacePath } from '../common/paths.mjs';
import { ensureDirectory, pathExists } from './file-system.mjs';
import { createSettingsStore } from './settings-store.mjs';

export function createWorkspaceService(app) {
  const settingsStore = createSettingsStore(app);

  function buildWorkspaceData(targetPath, overrides = {}) {
    const normalizedPath = path.resolve(targetPath);

    return {
      id: crypto.randomUUID(),
      path: normalizedPath,
      parentPath: path.dirname(normalizedPath),
      name: path.basename(normalizedPath),
      createdAt: new Date().toISOString(),
      recentVisits: [],
      ...overrides,
    };
  }

  async function readWorkspaceData(workspacePath) {
    const raw = await fs.readFile(getDefaultWorkspaceDataFilePath(workspacePath), 'utf8');
    return JSON.parse(raw);
  }

  async function writeWorkspaceData(workspacePath, data) {
    await fs.writeFile(
      getDefaultWorkspaceDataFilePath(workspacePath),
      JSON.stringify(data, null, 2),
      'utf8',
    );
  }

  function mergeRecentVisits(recentVisits = [], visit, max = 10) {
    return [visit, ...recentVisits.filter((item) => item?.path !== visit.path)].slice(0, max);
  }

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

  async function createWorkspace(targetPath) {
    const normalizedTargetPath = path.resolve(targetPath);
    const safeName = sanitizeGroupName(path.basename(normalizedTargetPath));
    const groupPath = path.join(path.dirname(normalizedTargetPath), safeName);

    await assertInsideWorkspace(groupPath);
    await ensureDirectory(groupPath);

    await writeWorkspaceData(
      groupPath,
      buildWorkspaceData(groupPath, {
        name: safeName,
      }),
    );

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

    return {
      path: targetPath,
      exists: await pathExists(targetPath),
    };
  }

  async function getWorkflowInfo(workflowPath) {
    const normalizedWorkflowPath = path.resolve(workflowPath);
    const workflowInfoPath = getDefaultWorkspaceDataFilePath(normalizedWorkflowPath);

    await ensureDirectory(normalizedWorkflowPath);

    if (!(await pathExists(workflowInfoPath))) {
      await writeWorkspaceData(normalizedWorkflowPath, buildWorkspaceData(normalizedWorkflowPath));
    }

    const workflowData = await readWorkspaceData(normalizedWorkflowPath);
    const currentWorkspaceRoot = path.resolve(await getCurrentWorkspacePath());
    const parentWorkflowPath = path.dirname(normalizedWorkflowPath);
    const hasParentWorkflow =
      parentWorkflowPath !== normalizedWorkflowPath &&
      parentWorkflowPath.startsWith(currentWorkspaceRoot) &&
      (await pathExists(getDefaultWorkspaceDataFilePath(parentWorkflowPath)));

    if (hasParentWorkflow) {
      await addRecentVisit(parentWorkflowPath, workflowData);
    }

    await addRecentVisitToSettings(workflowData);

    return workflowData;
  }

  async function updateWorkspaceInfo(workflowPath, data) {
    const updatedWorkspaceInfo = {
      ...(await readWorkspaceData(workflowPath)),
      ...data,
    };
    await writeWorkspaceData(workflowPath, updatedWorkspaceInfo);

    return updatedWorkspaceInfo;
  }

  async function addRecentVisit(workflowPath, visit) {
    const data = await readWorkspaceData(workflowPath);
    const updatedWorkspaceInfo = {
      ...data,
      recentVisits: mergeRecentVisits(data?.recentVisits, visit),
    };

    await writeWorkspaceData(workflowPath, updatedWorkspaceInfo);
  }

  async function addRecentVisitToSettings(visit) {
    const settings = await settingsStore.read();

    await settingsStore.write({
      ...settings,
      recentVisits: mergeRecentVisits(settings?.recentVisits, visit),
    });
  }

  return {
    createWorkspace,
    getCurrentWorkspaceInfo,
    initCurrentWorkspace,
    removeWorkspace,
    renameWorkspace,
    resetWorkspacePath,
    setCurrentWorkspacePath,
    updateRoot,
    getWorkflowInfo,
    updateWorkspaceInfo,
  };
}
