import path from 'node:path';
import type { App } from 'electron';

import { getWorkspaceScriptDataFilePath } from '../common/paths.js';
import { withTransaction } from '../db/connection.js';
import { deleteFile, pathExists } from './file-system.js';
import { withWorkspaceRepositories } from './workspace-repository-context.js';
import { createWorkspaceSettings } from './workspace-settings.js';
import { buildNodeInfo, toRecentVisit, type WorkspaceNodeData } from './workspace/nodes.js';
import { ensureStore } from './workspace/store.js';
import {
  mergeRecentVisits,
  normalizePath,
  toFileSystemPath,
} from './workspace/shared.js';
import type { WorkspaceStore } from './workspace/store-types.js';

export function createWorkspaceServiceContext(app: Pick<App, 'getPath'>) {
  const workspaceSettings = createWorkspaceSettings(app);
  const { settingsStore } = workspaceSettings;

  async function assertInsideWorkspace(targetPath: string) {
    const workspacePath = await workspaceSettings.getCurrentWorkspacePath();
    const resolvedWorkspacePath = normalizePath(workspacePath);
    const resolvedTargetPath = normalizePath(targetPath);
    const relativePath = path.relative(resolvedWorkspacePath, resolvedTargetPath);
    const isOutside = relativePath.startsWith('..') || path.isAbsolute(relativePath);

    if (isOutside) {
      throw new Error('작업 폴더 밖의 경로에는 접근할 수 없습니다.');
    }
  }

  async function getStoreNodeByPath(targetPath: string) {
    const workspacePath = await workspaceSettings.getCurrentWorkspacePath();
    const store = await ensureStore(workspacePath);
    const normalizedTargetPath = normalizePath(targetPath);
    const { nodeByPath } = buildNodeInfo(workspacePath, store);

    return {
      workspacePath,
      store,
      node: nodeByPath.get(normalizedTargetPath) ?? null,
    };
  }

  async function addRecentVisitToSettings(visit: WorkspaceNodeData) {
    const settings = await settingsStore.read();

    await settingsStore.write({
      ...settings,
      recentVisits: mergeRecentVisits(settings?.recentVisits, toRecentVisit(visit)),
    });
  }

  async function removeRecentVisitsFromSettings(removedIds: Set<string>) {
    const settings = await settingsStore.read();

    await settingsStore.write({
      ...settings,
      recentVisits: (settings?.recentVisits ?? []).filter(
        (visit) => !removedIds.has(visit.id ?? ''),
      ),
    });
  }

  async function addRecentVisit(_workflowPath: string, visit: WorkspaceNodeData) {
    const workspacePath = await workspaceSettings.getCurrentWorkspacePath();
    const store = await ensureStore(workspacePath);
    const nextRecentVisits = mergeRecentVisits(store.recentVisits, toRecentVisit(visit));

    await withWorkspaceRepositories(workspacePath, async ({ db, recentVisits }) => {
      await withTransaction(db, async () => {
        await recentVisits.deleteAllRecentVisits();
        await recentVisits.insertRecentVisits(nextRecentVisits);
      });
    });
  }

  function getUpdatedNodeById(workspacePath: string, store: WorkspaceStore, targetId: string) {
    const { nodeById } = buildNodeInfo(workspacePath, store);
    return nodeById.get(targetId) ?? null;
  }

  async function removeCoverImage(coverPath?: string | null) {
    if (!coverPath) {
      return;
    }

    const filePath = toFileSystemPath(coverPath);
    if (await pathExists(filePath)) {
      await deleteFile(filePath);
    }
  }

  async function removeDocumentContentFile(workspacePath: string, documentId: string) {
    const documentDataPath = getWorkspaceScriptDataFilePath(workspacePath, documentId);

    if (await pathExists(documentDataPath)) {
      await deleteFile(documentDataPath);
    }
  }

  return {
    addRecentVisit,
    addRecentVisitToSettings,
    assertInsideWorkspace,
    getCurrentWorkspaceInfo: workspaceSettings.getCurrentWorkspaceInfo,
    getCurrentWorkspacePath: workspaceSettings.getCurrentWorkspacePath,
    getStoreNodeByPath,
    getUpdatedNodeById,
    getWorkspaceInfo: workspaceSettings.getWorkspaceInfo,
    initCurrentWorkspace: workspaceSettings.initCurrentWorkspace,
    removeCoverImage,
    removeDocumentContentFile,
    removeRecentVisitsFromSettings,
    resetWorkspacePath: workspaceSettings.resetWorkspacePath,
    setCurrentWorkspacePath: workspaceSettings.setCurrentWorkspacePath,
    settingsStore,
    updateRoot: workspaceSettings.updateRoot,
    withWorkspaceRepositories,
  };
}

export type WorkspaceServiceContext = ReturnType<typeof createWorkspaceServiceContext>;
