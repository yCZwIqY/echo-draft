import path from 'node:path';
import fs from 'node:fs/promises';

import {
  getDefaultWorkspacePath,
  getWorkspaceDocumentDataFilePath,
  getWorkspaceImagesDirectoryPath,
} from '../common/paths.mjs';
import { deleteFile, ensureDirectory, pathExists } from './file-system.mjs';
import { createSettingsStore } from './settings-store.mjs';
import {
  buildStoredDocumentMeta,
  createEmptyStore,
  ensureStore,
  readDocumentContent,
  writeDocumentContent,
  writeStore,
} from './workspace/store.mjs';
import {
  buildDocumentNode,
  buildNodeInfo,
  buildRootWorkspaceNode,
  buildTrashNodes,
  buildTreeNodes,
  buildWorkspaceNode,
  toRecentVisit,
} from './workspace/nodes.mjs';
import {
  collectDocumentIdsByGroupIds,
  collectGroupAncestorIds,
  collectGroupDescendantIds,
  mergeRecentVisits,
  normalizePath,
  now,
  sanitizeNodeName,
  toFileSystemPath,
} from './workspace/shared.mjs';

export function createWorkspaceService(app) {
  const settingsStore = createSettingsStore(app);

  async function getCurrentWorkspacePath() {
    const settings = await settingsStore.read();
    return settings.workspacePath ?? getDefaultWorkspacePath();
  }

  async function assertInsideWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const resolvedWorkspacePath = normalizePath(workspacePath);
    const resolvedTargetPath = normalizePath(targetPath);
    const relativePath = path.relative(resolvedWorkspacePath, resolvedTargetPath);
    const isOutside = relativePath.startsWith('..') || path.isAbsolute(relativePath);

    if (isOutside) {
      throw new Error('작업 폴더 밖의 경로에는 접근할 수 없습니다.');
    }
  }

  async function getWorkspaceInfo(workspacePath) {
    const normalizedWorkspacePath = normalizePath(workspacePath);

    return {
      path: normalizedWorkspacePath,
      exists: await pathExists(normalizedWorkspacePath),
    };
  }

  async function getCurrentWorkspaceInfo() {
    return getWorkspaceInfo(await getCurrentWorkspacePath());
  }

  async function setCurrentWorkspacePath(workspacePath) {
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

  async function updateRoot(targetPath) {
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

  async function getStoreNodeByPath(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const store = await ensureStore(workspacePath);
    const normalizedTargetPath = normalizePath(targetPath);
    const { nodeByPath } = buildNodeInfo(workspacePath, store);

    return {
      workspacePath,
      store,
      node: nodeByPath.get(normalizedTargetPath) ?? null,
    };
  }

  async function addRecentVisitToSettings(visit) {
    const settings = await settingsStore.read();

    await settingsStore.write({
      ...settings,
      recentVisits: mergeRecentVisits(settings?.recentVisits, toRecentVisit(visit)),
    });
  }

  async function removeRecentVisitsFromSettings(removedIds) {
    const settings = await settingsStore.read();

    await settingsStore.write({
      ...settings,
      recentVisits: (settings?.recentVisits ?? []).filter((visit) => !removedIds.has(visit.id ?? '')),
    });
  }

  async function addRecentVisit(workflowPath, visit) {
    const workspacePath = await getCurrentWorkspacePath();
    const store = await ensureStore(workspacePath);
    const nextStore = {
      ...store,
      recentVisits: mergeRecentVisits(store.recentVisits, toRecentVisit(visit)),
    };

    await writeStore(workspacePath, nextStore);
  }

  function getUpdatedNodeById(workspacePath, store, targetId) {
    const { nodeById } = buildNodeInfo(workspacePath, store);
    return nodeById.get(targetId) ?? null;
  }

  async function createWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedTargetPath = normalizePath(targetPath);
    const parentPath = path.dirname(normalizedTargetPath);
    const safeName = sanitizeNodeName(path.basename(normalizedTargetPath));

    if (await pathExists(normalizedTargetPath)) {
      throw new Error('같은 레벨에선 중복되는 이름을 사용할 수 없습니다.');
    }

    await assertInsideWorkspace(normalizedTargetPath);

    const store = await ensureStore(workspacePath);
    const { nodeByPath } = buildNodeInfo(workspacePath, store);
    const parentNode =
      normalizePath(parentPath) === normalizePath(workspacePath)
        ? null
        : nodeByPath.get(normalizePath(parentPath));

    if (parentNode && parentNode.type !== 'workspace') {
      throw new Error('문서 아래에는 그룹을 생성할 수 없습니다.');
    }

    const newGroup = {
      id: crypto.randomUUID(),
      type: 'workspace',
      name: safeName,
      parentId: parentNode?.id ?? null,
      description: '',
      coverPath: '',
      createdAt: now(),
      updatedAt: now(),
      deletedAt: null,
    };

    await writeStore(workspacePath, {
      ...store,
      groups: [...store.groups, newGroup],
    });

    return {
      id: newGroup.id,
      name: safeName,
      path: path.join(parentPath, safeName),
    };
  }

  async function renameWorkspace(oldWorkspacePath, newName) {
    const workspacePath = await getCurrentWorkspacePath();
    const safeNewName = sanitizeNodeName(newName);
    const { store, node } = await getStoreNodeByPath(oldWorkspacePath);

    if (!node || node.type !== 'workspace') {
      throw new Error('수정할 그룹을 찾을 수 없습니다.');
    }

    await writeStore(workspacePath, {
      ...store,
      groups: store.groups.map((group) =>
        group.id === node.id ? { ...group, name: safeNewName, updatedAt: now() } : group,
      ),
    });

    return {
      oldPath: oldWorkspacePath,
      newPath: path.join(node.parentPath, safeNewName),
    };
  }

  async function softDeleteWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const { store, node } = await getStoreNodeByPath(targetPath);

    if (!node || node.type !== 'workspace') {
      throw new Error('삭제할 그룹을 찾을 수 없습니다.');
    }

    const removedGroupIds = collectGroupDescendantIds(store.groups, node.id);
    const deletedAt = now();
    const nextStore = {
      ...store,
      groups: store.groups.map((group) =>
        removedGroupIds.has(group.id) ? { ...group, deletedAt, updatedAt: deletedAt } : group,
      ),
      documents: store.documents.map((document) =>
        removedGroupIds.has(document.parentId ?? '')
          ? { ...document, deletedAt, updatedAt: deletedAt }
          : document,
      ),
      recentVisits: (store.recentVisits ?? []).filter(
        (visit) => !removedGroupIds.has(visit.id ?? ''),
      ),
    };

    await writeStore(workspacePath, nextStore);

    return {
      removed: true,
      path: targetPath,
    };
  }

  async function removeWorkspace(targetPath) {
    return softDeleteWorkspace(targetPath);
  }

  async function removeCoverImage(coverPath) {
    if (!coverPath) {
      return;
    }

    const filePath = toFileSystemPath(coverPath);
    if (await pathExists(filePath)) {
      await deleteFile(filePath);
    }
  }

  async function removeDocumentContentFile(workspacePath, documentId) {
    const documentDataPath = getWorkspaceDocumentDataFilePath(workspacePath, documentId);

    if (await pathExists(documentDataPath)) {
      await deleteFile(documentDataPath);
    }
  }

  async function purgeWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const { store, node } = await getStoreNodeByPath(targetPath);

    if (!node || node.type !== 'workspace') {
      throw new Error('영구 삭제할 그룹을 찾을 수 없습니다.');
    }

    const removedGroupIds = collectGroupDescendantIds(store.groups, node.id);
    const removedGroups = store.groups.filter((group) => removedGroupIds.has(group.id));
    const removedDocuments = store.documents.filter((document) =>
      removedGroupIds.has(document.parentId ?? ''),
    );
    const removedDocumentIds = new Set(removedDocuments.map((document) => document.id));
    const removedNodeIds = new Set([...removedGroupIds, ...removedDocumentIds]);

    for (const group of removedGroups) {
      await removeCoverImage(group.coverPath);
    }

    for (const document of removedDocuments) {
      await removeDocumentContentFile(workspacePath, document.id);
    }

    const nextStore = {
      ...store,
      groups: store.groups.filter((group) => !removedGroupIds.has(group.id)),
      documents: store.documents.filter((document) => !removedDocumentIds.has(document.id)),
      recentVisits: (store.recentVisits ?? []).filter((visit) => !removedNodeIds.has(visit.id ?? '')),
    };

    await writeStore(workspacePath, nextStore);
    await removeRecentVisitsFromSettings(removedNodeIds);

    return {
      removed: true,
      path: targetPath,
    };
  }

  async function restoreWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const { store, node } = await getStoreNodeByPath(targetPath);

    if (!node || node.type !== 'workspace') {
      throw new Error('복구할 워크스페이스를 찾을 수 없습니다.');
    }

    const { groupsById } = buildNodeInfo(workspacePath, store);
    const restoredSubtreeGroupIds = collectGroupDescendantIds(store.groups, node.id);
    const restoredAncestorGroupIds = collectGroupAncestorIds(groupsById, node.parentId ?? null);
    const restoredTargetGroupIds = new Set([
      ...restoredSubtreeGroupIds,
      ...restoredAncestorGroupIds,
    ]);
    const restoredDocumentIds = collectDocumentIdsByGroupIds(
      store.documents,
      restoredSubtreeGroupIds,
    );
    const restoredAt = now();

    const nextStore = {
      ...store,
      groups: store.groups.map((group) =>
        restoredTargetGroupIds.has(group.id)
          ? { ...group, deletedAt: null, updatedAt: restoredAt }
          : group,
      ),
      documents: store.documents.map((document) =>
        restoredDocumentIds.has(document.id)
          ? { ...document, deletedAt: null, updatedAt: restoredAt }
          : document,
      ),
    };

    await writeStore(workspacePath, nextStore);

    return {
      restored: true,
      path: targetPath,
    };
  }

  async function createDocument(parentPath, name) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedParentPath = normalizePath(parentPath);
    const documentName = sanitizeNodeName(name || `${Date.now()}`);
    const store = await ensureStore(workspacePath);
    const { nodeByPath } = buildNodeInfo(workspacePath, store);
    const parentNode =
      normalizedParentPath === normalizePath(workspacePath)
        ? null
        : nodeByPath.get(normalizedParentPath);

    if (parentNode && parentNode.type !== 'workspace') {
      throw new Error('문서 아래에는 문서를 생성할 수 없습니다.');
    }

    const document = {
      id: crypto.randomUUID(),
      type: 'document',
      name: documentName,
      title: documentName,
      subTitle: '',
      parentId: parentNode?.id ?? null,
      createdAt: now(),
      updatedAt: now(),
      draftLength: 0,
      manuscriptLength: 0,
      deletedAt: null,
    };

    const nextStore = {
      ...store,
      documents: [...store.documents, document],
    };

    await writeStore(workspacePath, nextStore);
    await writeDocumentContent(workspacePath, document.id, {
      id: document.id,
      title: documentName,
      subTitle: '',
      draft: {
        content: '',
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
        createdAt: now(),
        updatedAt: now(),
      },
    });

    return buildDocumentNode(
      document,
      path.join(normalizedParentPath, `${documentName}.json`),
      normalizedParentPath,
    );
  }

  async function getDocument(documentPath) {
    const { workspacePath, node } = await getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('문서를 찾을 수 없습니다.');
    }

    const content = await readDocumentContent(workspacePath, node.id);
    const document = {
      ...node,
      document: {
        ...node.document,
        title: content.title ?? node.document?.title ?? node.name,
        subTitle: content.subTitle ?? node.document?.subTitle,
        draft: content.draft,
        manuscript: content.manuscript,
        draftLength: content.draft?.content?.length ?? node.document?.draftLength ?? 0,
        manuscriptLength:
          content.manuscript?.content?.length ?? node.document?.manuscriptLength ?? 0,
      },
    };

    if (!document.deletedAt) {
      await addRecentVisitToSettings(document);
    }

    return document;
  }

  async function softDeleteDocument(documentPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const { store, node } = await getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('삭제할 문서를 찾을 수 없습니다.');
    }

    const deletedAt = now();
    const nextStore = {
      ...store,
      documents: store.documents.map((document) =>
        document.id === node.id ? { ...document, deletedAt, updatedAt: deletedAt } : document,
      ),
      recentVisits: (store.recentVisits ?? []).filter((visit) => visit.id !== node.id),
    };

    await writeStore(workspacePath, nextStore);

    return {
      removed: true,
      path: documentPath,
    };
  }

  async function removeDocument(documentPath) {
    return softDeleteDocument(documentPath);
  }

  async function purgeDocument(documentPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const { store, node } = await getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('영구 삭제할 문서를 찾을 수 없습니다.');
    }

    await removeDocumentContentFile(workspacePath, node.id);

    const removedIds = new Set([node.id]);
    const nextStore = {
      ...store,
      documents: store.documents.filter((document) => document.id !== node.id),
      recentVisits: (store.recentVisits ?? []).filter((visit) => visit.id !== node.id),
    };

    await writeStore(workspacePath, nextStore);
    await removeRecentVisitsFromSettings(removedIds);

    return {
      removed: true,
      path: documentPath,
    };
  }

  async function restoreDocument(documentPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const { store, node } = await getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('복구할 문서를 찾을 수 없습니다.');
    }

    const { groupsById } = buildNodeInfo(workspacePath, store);
    const restoredAncestorGroupIds = collectGroupAncestorIds(groupsById, node.parentId ?? null);
    const restoredAt = now();

    const nextStore = {
      ...store,
      groups: store.groups.map((group) =>
        restoredAncestorGroupIds.has(group.id)
          ? { ...group, deletedAt: null, updatedAt: restoredAt }
          : group,
      ),
      documents: store.documents.map((document) =>
        document.id === node.id
          ? { ...document, deletedAt: null, updatedAt: restoredAt }
          : document,
      ),
    };

    await writeStore(workspacePath, nextStore);

    return {
      restored: true,
      path: documentPath,
    };
  }

  async function updateDocument(documentPath, data) {
    const { workspacePath, store, node } = await getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('수정할 문서를 찾을 수 없습니다.');
    }

    const documentData = data.document ?? {};
    const currentContent = await readDocumentContent(workspacePath, node.id);
    const nextContent = {
      ...currentContent,
      id: node.id,
      title: documentData.title ?? currentContent.title ?? node.document?.title ?? node.name,
      subTitle: documentData.subTitle ?? currentContent.subTitle ?? node.document?.subTitle,
      draft: documentData.draft ?? currentContent.draft,
      manuscript: documentData.manuscript ?? currentContent.manuscript,
    };

    const nextStore = {
      ...store,
      documents: store.documents.map((document) =>
        document.id === node.id
          ? buildStoredDocumentMeta(
              {
                ...document,
                name: data.name ?? document.name,
                updatedAt: now(),
                deletedAt: data.deletedAt ?? document.deletedAt ?? null,
              },
              nextContent,
            )
          : document,
      ),
    };

    await writeStore(workspacePath, nextStore);
    await writeDocumentContent(workspacePath, node.id, nextContent);

    const updatedNode = getUpdatedNodeById(workspacePath, nextStore, node.id);
    return getDocument(updatedNode?.path ?? documentPath);
  }

  async function getWorkflowInfo(workflowPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedWorkflowPath = normalizePath(workflowPath);
    const store = await ensureStore(workspacePath);

    const workflowData =
      normalizedWorkflowPath === normalizePath(workspacePath)
        ? buildRootWorkspaceNode(workspacePath, store)
        : buildNodeInfo(workspacePath, store).nodeByPath.get(normalizedWorkflowPath) ?? null;

    if (!workflowData) {
      throw new Error('워크스페이스를 찾을 수 없습니다.');
    }

    if (!workflowData.deletedAt) {
      await addRecentVisitToSettings(workflowData);
    }

    return workflowData;
  }

  async function updateWorkspaceInfo(workflowPath, data) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedWorkflowPath = normalizePath(workflowPath);
    const store = await ensureStore(workspacePath);
    const workspaceData = data.workspace ?? {};

    if (normalizedWorkflowPath === normalizePath(workspacePath)) {
      const nextStore = {
        ...store,
        workspace: {
          ...store.workspace,
          name: data.name ?? store.workspace.name,
          description: workspaceData.description ?? store.workspace.description ?? '',
          coverPath: workspaceData.coverPath ?? store.workspace.coverPath ?? '',
          deletedAt: data.deletedAt ?? store.workspace.deletedAt ?? null,
          updatedAt: now(),
        },
      };

      await writeStore(workspacePath, nextStore);
      return buildRootWorkspaceNode(workspacePath, nextStore);
    }

    const { nodeByPath } = buildNodeInfo(workspacePath, store);
    const targetNode = nodeByPath.get(normalizedWorkflowPath);

    if (!targetNode || targetNode.type !== 'workspace') {
      throw new Error('수정할 워크스페이스를 찾을 수 없습니다.');
    }

    const nextStore = {
      ...store,
      groups: store.groups.map((group) =>
        group.id === targetNode.id
          ? {
              ...group,
              name: data.name ?? group.name,
              description: workspaceData.description ?? group.description ?? '',
              coverPath: workspaceData.coverPath ?? group.coverPath ?? '',
              deletedAt: data.deletedAt ?? group.deletedAt ?? null,
              updatedAt: now(),
            }
          : group,
      ),
    };

    await writeStore(workspacePath, nextStore);
    return getUpdatedNodeById(workspacePath, nextStore, targetNode.id);
  }

  async function updateWorkflowInfo(workflowPath, data) {
    return updateWorkspaceInfo(workflowPath, data);
  }

  async function getWorkspaceTree(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const store = await ensureStore(workspacePath);
    const tree = buildTreeNodes(workspacePath, store);

    if (!targetPath) {
      return tree;
    }

    const normalizedTargetPath = normalizePath(targetPath);
    const stack = [...tree];

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }

      if (normalizePath(node.path) === normalizedTargetPath) {
        return [node];
      }

      if (node.children) {
        stack.push(...node.children);
      }
    }

    return [];
  }

  async function getTrashItems() {
    const workspacePath = await getCurrentWorkspacePath();
    const store = await ensureStore(workspacePath);

    return buildTrashNodes(workspacePath, store);
  }

  async function removeFile(targetPath) {
    return deleteFile(toFileSystemPath(targetPath));
  }

  async function saveImage(workflowPath, fileName, buffer) {
    const rootWorkspacePath = await getCurrentWorkspacePath();
    const normalizedWorkflowPath = normalizePath(workflowPath);
    await assertInsideWorkspace(normalizedWorkflowPath);
    await ensureStore(rootWorkspacePath);

    const imagesDirectoryPath = getWorkspaceImagesDirectoryPath(normalizePath(rootWorkspacePath));
    await ensureDirectory(imagesDirectoryPath);

    const safeFileName = path.basename(fileName);
    const targetPath = path.join(imagesDirectoryPath, `${crypto.randomUUID()}-${safeFileName}`);

    await fs.writeFile(targetPath, Buffer.from(buffer));

    return targetPath;
  }

  return {
    addRecentVisit,
    createDocument,
    createWorkspace,
    getCurrentWorkspaceInfo,
    getCurrentWorkspacePath,
    getDocument,
    getStoreNodeByPath,
    getTrashItems,
    getWorkflowInfo,
    getWorkspaceInfo,
    getWorkspaceTree,
    initCurrentWorkspace,
    purgeDocument,
    purgeWorkspace,
    removeDocument,
    removeFile,
    removeWorkspace,
    restoreDocument,
    restoreWorkspace,
    renameWorkspace,
    resetWorkspacePath,
    saveImage,
    setCurrentWorkspacePath,
    toFileSystemPath,
    updateDocument,
    updateRoot,
    updateWorkflowInfo,
    updateWorkspaceInfo,
  };
}
