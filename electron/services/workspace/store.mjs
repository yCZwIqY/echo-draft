import path from 'node:path';
import fs from 'node:fs/promises';

import {
  getDefaultWorkspaceDataFilePath,
  getWorkspaceDocumentDataFilePath,
  getWorkspaceDocumentsDirectoryPath,
} from '../../common/paths.mjs';
import { ensureDirectory, pathExists, readDirectoryTree } from '../file-system.mjs';
import { now, normalizePath } from './shared.mjs';

export function createEmptyStore(workspacePath) {
  const timestamp = now();

  return {
    version: 2,
    workspace: {
      id: crypto.randomUUID(),
      name: path.basename(workspacePath),
      description: '',
      coverPath: '',
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    },
    groups: [],
    documents: [],
    recentVisits: [],
  };
}

function isEmptyJsonFileContent(raw) {
  return typeof raw !== 'string' || raw.trim() === '';
}

export async function readStore(workspacePath) {
  const raw = await fs.readFile(getDefaultWorkspaceDataFilePath(workspacePath), 'utf8');

  if (isEmptyJsonFileContent(raw)) {
    return null;
  }

  return JSON.parse(raw);
}

export async function ensureDocumentsDirectory(workspacePath) {
  await ensureDirectory(getWorkspaceDocumentsDirectoryPath(workspacePath));
}

export async function readDocumentContent(workspacePath, documentId) {
  const documentDataPath = getWorkspaceDocumentDataFilePath(workspacePath, documentId);

  if (!(await pathExists(documentDataPath))) {
    return {
      title: '',
      subTitle: '',
      draft: undefined,
      manuscript: undefined,
    };
  }

  try {
    const raw = await fs.readFile(documentDataPath, 'utf8');

    if (isEmptyJsonFileContent(raw)) {
      return {
        title: '',
        subTitle: '',
        draft: undefined,
        manuscript: undefined,
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      title: '',
      subTitle: '',
      draft: undefined,
      manuscript: undefined,
    };
  }
}

export async function writeDocumentContent(workspacePath, documentId, data) {
  await ensureDocumentsDirectory(workspacePath);
  await fs.writeFile(
    getWorkspaceDocumentDataFilePath(workspacePath, documentId),
    JSON.stringify(data, null, 2),
    'utf8',
  );
}

export function buildStoredDocumentMeta(document, content = {}) {
  return {
    ...document,
    title: content.title ?? document.title ?? document.name,
    subTitle: content.subTitle ?? document.subTitle,
    draftLength: content.draft?.content?.length ?? document.draftLength ?? 0,
    manuscriptLength: content.manuscript?.content?.length ?? document.manuscriptLength ?? 0,
    deletedAt: document.deletedAt ?? null,
  };
}

export async function writeStore(workspacePath, store) {
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

export async function migrateStoreDocumentStorage(workspacePath, store) {
  let didChange = false;
  const nextGroups = store.groups.map((group) => ({
    coverPath: '',
    deletedAt: null,
    ...group,
  }));
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

    const nextDocument = buildStoredDocumentMeta(
      {
        deletedAt: null,
        ...document,
        draft: undefined,
        manuscript: undefined,
      },
      nextContent,
    );

    if (
      document.title !== nextDocument.title ||
      document.subTitle !== nextDocument.subTitle ||
      document.draftLength !== nextDocument.draftLength ||
      document.manuscriptLength !== nextDocument.manuscriptLength ||
      document.deletedAt !== nextDocument.deletedAt ||
      hasInlineContent
    ) {
      didChange = true;
    }

    nextDocuments.push(nextDocument);
  }

  const nextWorkspace = {
    coverPath: '',
    deletedAt: null,
    ...store.workspace,
  };

  if (!didChange && nextGroups === store.groups && nextWorkspace === store.workspace) {
    return store;
  }

  return {
    ...store,
    version: 2,
    workspace: nextWorkspace,
    groups: nextGroups,
    documents: nextDocuments,
  };
}

export async function convertLegacyTreeToStore(workspacePath) {
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
          coverPath: '',
          createdAt: now(),
          updatedAt: now(),
          deletedAt: null,
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
        deletedAt: null,
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

export async function ensureStore(workspacePath) {
  const normalizedWorkspacePath = normalizePath(workspacePath);
  const storeFilePath = getDefaultWorkspaceDataFilePath(normalizedWorkspacePath);

  await ensureDirectory(normalizedWorkspacePath);

  if (await pathExists(storeFilePath)) {
    let store = null;

    try {
      store = await readStore(normalizedWorkspacePath);
    } catch {
      store = null;
    }

    if (!store) {
      const { store: recoveredStore, documentContents } =
        await convertLegacyTreeToStore(normalizedWorkspacePath);
      const nextStore = await writeStore(normalizedWorkspacePath, recoveredStore);

      for (const documentContent of documentContents) {
        await writeDocumentContent(normalizedWorkspacePath, documentContent.id, documentContent);
      }

      return nextStore;
    }

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
