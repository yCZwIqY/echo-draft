import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import {
  getDefaultWorkspaceDataFilePath,
  getDefaultWorkspacePath,
  getWorkspaceDocumentDataFilePath,
  getWorkspaceDocumentsDirectoryPath,
  getWorkspaceImagesDirectoryPath,
} from '../common/paths.mjs';
import { deleteFile, ensureDirectory, pathExists, readDirectoryTree } from './file-system.mjs';
import { createSettingsStore } from './settings-store.mjs';

function now() {
  return new Date().toISOString();
}

function normalizePath(targetPath) {
  return path.resolve(targetPath);
}

function toFileSystemPath(targetPath) {
  if (typeof targetPath === 'string' && targetPath.startsWith('file://')) {
    return fileURLToPath(targetPath);
  }

  return targetPath;
}

export function createWorkspaceService(app) {
  const settingsStore = createSettingsStore(app);

  async function getCurrentWorkspacePath() {
    const settings = await settingsStore.read();
    return settings.workspacePath ?? getDefaultWorkspacePath();
  }

  function createEmptyStore(workspacePath) {
    const timestamp = now();

    return {
      version: 1,
      workspace: {
        id: crypto.randomUUID(),
        name: path.basename(workspacePath),
        description: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      groups: [],
      documents: [],
      recentVisits: [],
    };
  }

  async function readStore(workspacePath) {
    const raw = await fs.readFile(getDefaultWorkspaceDataFilePath(workspacePath), 'utf8');
    return JSON.parse(raw);
  }

  async function ensureDocumentsDirectory(workspacePath) {
    await ensureDirectory(getWorkspaceDocumentsDirectoryPath(workspacePath));
  }

  async function readDocumentContent(workspacePath, documentId) {
    const documentDataPath = getWorkspaceDocumentDataFilePath(workspacePath, documentId);

    if (!(await pathExists(documentDataPath))) {
      return {
        title: '',
        subTitle: '',
        draft: undefined,
        manuscript: undefined,
      };
    }

    const raw = await fs.readFile(documentDataPath, 'utf8');
    return JSON.parse(raw);
  }

  async function writeDocumentContent(workspacePath, documentId, data) {
    await ensureDocumentsDirectory(workspacePath);
    await fs.writeFile(
      getWorkspaceDocumentDataFilePath(workspacePath, documentId),
      JSON.stringify(data, null, 2),
      'utf8',
    );
  }

  function buildDocumentSummary(document, content = {}) {
    return {
      id: document.id,
      type: 'document',
      name: document.name,
      title: content.title ?? document.title ?? document.name,
      subTitle: content.subTitle ?? document.subTitle,
      parentId: document.parentId ?? null,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      draftLength: content.draft?.content?.length ?? 0,
      manuscriptLength: content.manuscript?.content?.length ?? 0,
    };
  }

  function toRecentVisit(node) {
    return {
      id: node.id,
      type: node.type,
      path: node.path,
      parentPath: node.parentPath,
      name: node.name,
      title: node.title,
      subTitle: node.subTitle,
      description: node.description,
      thumbnail: node.thumbnail,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    };
  }

  async function writeStore(workspacePath, store) {
    const normalizedWorkspacePath = normalizePath(workspacePath);
    const nextStore = {
      ...store,
      workspace: {
        ...store.workspace,
        updatedAt: now(),
      },
    };

    await fs.writeFile(
      getDefaultWorkspaceDataFilePath(normalizedWorkspacePath),
      JSON.stringify(nextStore, null, 2),
      'utf8',
    );
    await ensureDocumentsDirectory(normalizedWorkspacePath);

    return nextStore;
  }

  async function migrateStoreDocumentStorage(workspacePath, store) {
    let didChange = false;
    const nextDocuments = [];

    for (const document of store.documents) {
      const documentContentPath = getWorkspaceDocumentDataFilePath(workspacePath, document.id);
      const hasInlineContent = 'draft' in document || 'manuscript' in document;
      const existingContent = await readDocumentContent(workspacePath, document.id);
      const nextContent = {
        id: document.id,
        title: existingContent.title || document.title || document.name,
        subTitle: existingContent.subTitle || document.subTitle,
        draft: existingContent.draft ?? document.draft,
        manuscript: existingContent.manuscript ?? document.manuscript,
      };

      if (hasInlineContent || !(await pathExists(documentContentPath))) {
        await writeDocumentContent(workspacePath, document.id, nextContent);
        didChange = true;
      }

      const nextDraftLength = nextContent.draft?.content?.length ?? document.draftLength ?? 0;
      const nextManuscriptLength =
        nextContent.manuscript?.content?.length ?? document.manuscriptLength ?? 0;

      if (
        document.title !== nextContent.title ||
        document.subTitle !== nextContent.subTitle ||
        document.draftLength !== nextDraftLength ||
        document.manuscriptLength !== nextManuscriptLength ||
        hasInlineContent
      ) {
        didChange = true;
      }

      nextDocuments.push({
        ...document,
        title: nextContent.title,
        subTitle: nextContent.subTitle,
        draftLength: nextDraftLength,
        manuscriptLength: nextManuscriptLength,
        draft: undefined,
        manuscript: undefined,
      });
    }

    if (!didChange) {
      return store;
    }

    return {
      ...store,
      documents: nextDocuments,
    };
  }

  async function convertLegacyTreeToStore(workspacePath) {
    const normalizedWorkspacePath = normalizePath(workspacePath);
    const tree = await readDirectoryTree(normalizedWorkspacePath, { maxDepth: 100 });
    const store = createEmptyStore(normalizedWorkspacePath);
    const documentContents = [];

    async function walk(nodes, parentId = null) {
      for (const node of nodes) {
        if (node.type === 'workspace') {
          const group = {
            id: crypto.randomUUID(),
            type: 'workspace',
            name: node.name,
            parentId,
            description: '',
            createdAt: now(),
            updatedAt: now(),
          };

          store.groups.push(group);
          await walk(node.children ?? [], group.id);
          continue;
        }

        const documentPath = normalizePath(node.path);
        const documentName = node.name.replace(/\.json$/i, '');
        let legacyDocument = null;

        try {
          const raw = await fs.readFile(documentPath, 'utf8');
          legacyDocument = JSON.parse(raw);
        } catch {
          legacyDocument = null;
        }

        const documentId = legacyDocument?.id ?? crypto.randomUUID();
        const createdAt =
          legacyDocument?.createdAt instanceof Date
            ? legacyDocument.createdAt.toISOString()
            : (legacyDocument?.createdAt ?? now());
        const updatedAt =
          legacyDocument?.updatedAt instanceof Date
            ? legacyDocument.updatedAt.toISOString()
            : (legacyDocument?.updatedAt ?? now());
        const documentMeta = {
          id: documentId,
          type: 'document',
          name: legacyDocument?.name ?? documentName,
          title: legacyDocument?.title ?? documentName,
          subTitle: legacyDocument?.subTitle,
          parentId,
          createdAt,
          updatedAt,
          draftLength: legacyDocument?.draft?.content?.length ?? 0,
          manuscriptLength: legacyDocument?.manuscript?.content?.length ?? 0,
        };

        store.documents.push(documentMeta);
        documentContents.push({
          id: documentId,
          title: documentMeta.title,
          subTitle: documentMeta.subTitle,
          draft: legacyDocument?.draft,
          manuscript: legacyDocument?.manuscript,
        });
      }
    }

    await walk(tree);
    return {
      store,
      documentContents,
    };
  }

  async function ensureStore(workspacePath) {
    const normalizedWorkspacePath = normalizePath(workspacePath);
    const storeFilePath = getDefaultWorkspaceDataFilePath(normalizedWorkspacePath);

    await ensureDirectory(normalizedWorkspacePath);

    if (await pathExists(storeFilePath)) {
      const store = await readStore(normalizedWorkspacePath);
      const migratedStore = await migrateStoreDocumentStorage(normalizedWorkspacePath, store);

      if (migratedStore !== store) {
        return writeStore(normalizedWorkspacePath, migratedStore);
      }

      return migratedStore;
    }

    const { store, documentContents } = await convertLegacyTreeToStore(normalizedWorkspacePath);
    const nextStore = await writeStore(normalizedWorkspacePath, store);

    for (const documentContent of documentContents) {
      await writeDocumentContent(normalizedWorkspacePath, documentContent.id, documentContent);
    }

    return nextStore;
  }

  function mergeRecentVisits(recentVisits = [], visit, max = 10) {
    return [visit, ...recentVisits.filter((item) => item?.path !== visit.path)].slice(0, max);
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
    const resolvedWorkspacePath = normalizePath(workspacePath);
    const resolvedTargetPath = normalizePath(targetPath);
    const relativePath = path.relative(resolvedWorkspacePath, resolvedTargetPath);
    const isOutside = relativePath.startsWith('..') || path.isAbsolute(relativePath);

    if (isOutside) {
      throw new Error('작업 폴더 밖의 경로에는 접근할 수 없습니다.');
    }
  }

  function buildEntityMaps(store) {
    const groupsById = new Map(store.groups.map((group) => [group.id, group]));

    return {
      groupsById,
    };
  }

  function buildGroupPath(workspacePath, groupsById, group) {
    const segments = [group.name];
    let cursor = group;

    while (cursor.parentId) {
      const parent = groupsById.get(cursor.parentId);
      if (!parent) {
        break;
      }

      segments.unshift(parent.name);
      cursor = parent;
    }

    return path.join(workspacePath, ...segments);
  }

  function buildNodeInfo(workspacePath, store) {
    const { groupsById } = buildEntityMaps(store);
    const groupPathsById = new Map();
    const nodeByPath = new Map();

    for (const group of store.groups) {
      const groupPath = buildGroupPath(workspacePath, groupsById, group);
      groupPathsById.set(group.id, groupPath);

      nodeByPath.set(groupPath, {
        ...group,
        path: groupPath,
        parentPath: group.parentId
          ? (groupPathsById.get(group.parentId) ?? workspacePath)
          : workspacePath,
      });
    }

    for (const document of store.documents) {
      const parentPath = document.parentId
        ? (groupPathsById.get(document.parentId) ?? workspacePath)
        : workspacePath;
      const documentPath = path.join(parentPath, `${document.name}.json`);

      nodeByPath.set(documentPath, {
        ...document,
        path: documentPath,
        parentPath,
      });
    }

    return {
      groupPathsById,
      nodeByPath,
      groupsById,
    };
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

  async function createWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedTargetPath = normalizePath(targetPath);
    const parentPath = path.dirname(normalizedTargetPath);
    const safeName = sanitizeGroupName(path.basename(normalizedTargetPath));

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
      createdAt: now(),
      updatedAt: now(),
    };

    const nextStore = {
      ...store,
      groups: [...store.groups, newGroup],
    };

    await writeStore(workspacePath, nextStore);

    return {
      name: safeName,
      path: path.join(parentPath, safeName),
    };
  }

  async function renameWorkspace(oldWorkspacePath, newName) {
    const workspacePath = await getCurrentWorkspacePath();
    const safeNewName = sanitizeGroupName(newName);
    const { store, node } = await getStoreNodeByPath(oldWorkspacePath);

    if (!node || node.type !== 'workspace') {
      throw new Error('수정할 그룹을 찾을 수 없습니다.');
    }

    const nextStore = {
      ...store,
      groups: store.groups.map((group) =>
        group.id === node.id ? { ...group, name: safeNewName, updatedAt: now() } : group,
      ),
    };

    await writeStore(workspacePath, nextStore);

    return {
      oldPath: oldWorkspacePath,
      newPath: path.join(node.parentPath, safeNewName),
    };
  }

  function collectGroupDescendantIds(groups, targetId) {
    const descendants = new Set([targetId]);
    let changed = true;

    while (changed) {
      changed = false;

      for (const group of groups) {
        if (group.parentId && descendants.has(group.parentId) && !descendants.has(group.id)) {
          descendants.add(group.id);
          changed = true;
        }
      }
    }

    return descendants;
  }

  async function removeWorkspace(targetPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const { store, node } = await getStoreNodeByPath(targetPath);

    if (!node || node.type !== 'workspace') {
      throw new Error('삭제할 그룹을 찾을 수 없습니다.');
    }

    const removedGroupIds = collectGroupDescendantIds(store.groups, node.id);
    const nextStore = {
      ...store,
      groups: store.groups.filter((group) => !removedGroupIds.has(group.id)),
      documents: store.documents.filter(
        (document) => !removedGroupIds.has(document.parentId ?? ''),
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

  function buildTreeNodes(workspacePath, store) {
    const { groupPathsById } = buildNodeInfo(workspacePath, store);
    const childrenByParentId = new Map();

    for (const group of store.groups) {
      const key = group.parentId ?? '__root__';
      const currentChildren = childrenByParentId.get(key) ?? [];
      currentChildren.push(group);
      childrenByParentId.set(key, currentChildren);
    }

    for (const document of store.documents) {
      const key = document.parentId ?? '__root__';
      const currentChildren = childrenByParentId.get(key) ?? [];
      currentChildren.push(document);
      childrenByParentId.set(key, currentChildren);
    }

    const buildChildren = (parentId = '__root__') => {
      const items = childrenByParentId.get(parentId) ?? [];

      return items
        .map((item) => {
          if (item.type === 'workspace') {
            const itemPath = groupPathsById.get(item.id);

            return {
              name: item.name,
              path: itemPath,
              type: 'workspace',
              children: buildChildren(item.id),
            };
          }

          const parentPath = item.parentId
            ? (groupPathsById.get(item.parentId) ?? workspacePath)
            : workspacePath;

          return {
            name: `${item.name}.json`,
            path: path.join(parentPath, `${item.name}.json`),
            type: 'document',
          };
        })
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'workspace' ? -1 : 1;
          }

          return a.name.localeCompare(b.name);
        });
    };

    return buildChildren();
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

  async function getWorkflowInfo(workflowPath) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedWorkflowPath = normalizePath(workflowPath);
    const store = await ensureStore(workspacePath);
    const { nodeByPath } = buildNodeInfo(workspacePath, store);
    const workflowData = nodeByPath.get(normalizedWorkflowPath) ?? {
      ...store.workspace,
      type: 'workspace',
      path: workspacePath,
      parentPath: path.dirname(workspacePath),
    };

    await addRecentVisitToSettings(workflowData);

    return workflowData;
  }

  async function updateWorkspaceInfo(workflowPath, data) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedWorkflowPath = normalizePath(workflowPath);
    const store = await ensureStore(workspacePath);
    const { nodeByPath } = buildNodeInfo(workspacePath, store);
    const targetNode = nodeByPath.get(normalizedWorkflowPath);

    if (!targetNode || targetNode.type !== 'workspace') {
      throw new Error('수정할 워크스페이스를 찾을 수 없습니다.');
    }

    const nextStore = {
      ...store,
      groups: store.groups.map((group) =>
        group.id === targetNode.id ? { ...group, ...data, updatedAt: now() } : group,
      ),
    };

    await writeStore(workspacePath, nextStore);
    const { node } = await getStoreNodeByPath(normalizedWorkflowPath);
    return node;
  }

  async function updateWorkflowInfo(workflowPath, data) {
    return updateWorkspaceInfo(workflowPath, data);
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

  async function addRecentVisitToSettings(visit) {
    const settings = await settingsStore.read();

    await settingsStore.write({
      ...settings,
      recentVisits: mergeRecentVisits(settings?.recentVisits, toRecentVisit(visit)),
    });
  }

  async function createDocument(parentPath, name) {
    const workspacePath = await getCurrentWorkspacePath();
    const normalizedParentPath = normalizePath(parentPath);
    const documentName = sanitizeGroupName(name || `${Date.now()}`);
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
      parentId: parentNode?.id ?? null,
      createdAt: now(),
      updatedAt: now(),
      draftLength: 0,
      manuscriptLength: 0,
    };

    const nextStore = {
      ...store,
      documents: [...store.documents, document],
    };

    await writeStore(workspacePath, nextStore);
    await writeDocumentContent(workspacePath, document.id, {
      id: document.id,
      title: documentName,
      draft: {
        content: '',
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
        createdAt: now(),
        updatedAt: now(),
      },
    });

    return {
      ...document,
      parentPath: normalizedParentPath,
      path: path.join(normalizedParentPath, `${documentName}.json`),
    };
  }

  async function getDocument(documentPath) {
    const { workspacePath, node } = await getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('문서를 찾을 수 없습니다.');
    }

    const content = await readDocumentContent(workspacePath, node.id);
    const document = {
      ...node,
      title: content.title ?? node.title ?? node.name,
      subTitle: content.subTitle ?? node.subTitle,
      draft: content.draft,
      manuscript: content.manuscript,
      draftLength: content.draft?.content?.length ?? node.draftLength ?? 0,
      manuscriptLength: content.manuscript?.content?.length ?? node.manuscriptLength ?? 0,
    };

    await addRecentVisitToSettings(document);

    return document;
  }

  async function updateDocument(documentPath, data) {
    const { workspacePath, store, node } = await getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('수정할 문서를 찾을 수 없습니다.');
    }

    const currentContent = await readDocumentContent(workspacePath, node.id);
    const nextContent = {
      ...currentContent,
      ...data,
      id: node.id,
      title: data.title ?? currentContent.title ?? node.title ?? node.name,
      subTitle: data.subTitle ?? currentContent.subTitle ?? node.subTitle,
      draft: data.draft ?? currentContent.draft,
      manuscript: data.manuscript ?? currentContent.manuscript,
    };

    const nextDraftLength = nextContent.draft?.content?.length ?? 0;
    const nextManuscriptLength = nextContent.manuscript?.content?.length ?? 0;

    const nextStore = {
      ...store,
      documents: store.documents.map((document) =>
        document.id === node.id
          ? {
              ...document,
              name: data.name ?? document.name,
              title: nextContent.title,
              subTitle: nextContent.subTitle,
              draftLength: nextDraftLength,
              manuscriptLength: nextManuscriptLength,
              updatedAt: now(),
            }
          : document,
      ),
    };

    await writeStore(workspacePath, nextStore);
    await writeDocumentContent(workspacePath, node.id, nextContent);
    const { nodeByPath } = buildNodeInfo(workspacePath, nextStore);
    const updatedDocumentPath =
      [...nodeByPath.entries()].find(([, item]) => item.id === node.id)?.[0] ?? documentPath;

    return getDocument(updatedDocumentPath);
  }

  async function removeFile(targetPath) {
    return await deleteFile(toFileSystemPath(targetPath));
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
    createDocument,
    createWorkspace,
    getCurrentWorkspaceInfo,
    getDocument,
    getStoreNodeByPath,
    getWorkflowInfo,
    getWorkspaceInfo,
    getWorkspaceTree,
    initCurrentWorkspace,
    removeWorkspace,
    renameWorkspace,
    resetWorkspacePath,
    saveImage,
    setCurrentWorkspacePath,
    updateRoot,
    updateWorkflowInfo,
    updateDocument,
    updateWorkspaceInfo,
    addRecentVisit,
    removeFile,
  };
}
