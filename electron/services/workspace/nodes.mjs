import path from 'node:path';

export function buildWorkspaceNode(entity, nodePath, parentPath, children = []) {
  return {
    id: entity.id,
    type: 'workspace',
    name: entity.name,
    path: nodePath,
    parentPath,
    parentId: entity.parentId ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt ?? null,
    trashed: Boolean(entity.deletedAt),
    workspace: {
      description: entity.description ?? '',
      coverPath: entity.coverPath ?? '',
      deletedAt: entity.deletedAt ?? null,
    },
    children,
  };
}

export function buildDocumentNode(entity, nodePath, parentPath, content = undefined) {
  return {
    id: entity.id,
    type: 'document',
    name: `${entity.name}.json`,
    path: nodePath,
    parentPath,
    parentId: entity.parentId ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    deletedAt: entity.deletedAt ?? null,
    trashed: Boolean(entity.deletedAt),
    document: {
      title: content?.title ?? entity.title ?? entity.name,
      subTitle: content?.subTitle ?? entity.subTitle,
      draft: content?.draft,
      manuscript: content?.manuscript,
      draftLength: content?.draft?.content?.length ?? entity.draftLength ?? 0,
      manuscriptLength: content?.manuscript?.content?.length ?? entity.manuscriptLength ?? 0,
      deletedAt: entity.deletedAt ?? null,
    },
  };
}

export function buildEntityMaps(store) {
  const groupsById = new Map(store.groups.map((group) => [group.id, group]));
  const documentsById = new Map(store.documents.map((document) => [document.id, document]));

  return {
    groupsById,
    documentsById,
  };
}

export function buildGroupPath(workspacePath, groupsById, group) {
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

export function buildNodeInfo(workspacePath, store) {
  const { groupsById, documentsById } = buildEntityMaps(store);
  const groupPathsById = new Map();
  const nodeByPath = new Map();
  const nodeById = new Map();

  for (const group of store.groups) {
    const groupPath = buildGroupPath(workspacePath, groupsById, group);
    groupPathsById.set(group.id, groupPath);
  }

  for (const group of store.groups) {
    const groupPath = groupPathsById.get(group.id);
    const parentPath = group.parentId ? (groupPathsById.get(group.parentId) ?? workspacePath) : workspacePath;
    const node = buildWorkspaceNode(group, groupPath, parentPath);

    nodeByPath.set(groupPath, node);
    nodeById.set(group.id, node);
  }

  for (const document of store.documents) {
    const parentPath = document.parentId ? (groupPathsById.get(document.parentId) ?? workspacePath) : workspacePath;
    const documentPath = path.join(parentPath, `${document.name}.json`);
    const node = buildDocumentNode(document, documentPath, parentPath);

    nodeByPath.set(documentPath, node);
    nodeById.set(document.id, node);
  }

  return {
    groupPathsById,
    nodeByPath,
    nodeById,
    groupsById,
    documentsById,
  };
}

export function buildRootWorkspaceNode(workspacePath, store) {
  return buildWorkspaceNode(
    store.workspace,
    workspacePath,
    path.dirname(workspacePath),
  );
}

export function buildTreeNodes(workspacePath, store, options = {}) {
  const includeDeleted = options.includeDeleted ?? false;
  const { groupPathsById, groupsById } = buildNodeInfo(workspacePath, store);
  const childrenByParentId = new Map();

  for (const group of store.groups) {
    if (!includeDeleted && group.deletedAt) {
      continue;
    }

    const key = group.parentId ?? '__root__';
    const currentChildren = childrenByParentId.get(key) ?? [];
    currentChildren.push(group);
    childrenByParentId.set(key, currentChildren);
  }

  for (const document of store.documents) {
    if (!includeDeleted && document.deletedAt) {
      continue;
    }

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
          const parentPath = item.parentId ? (groupPathsById.get(item.parentId) ?? workspacePath) : workspacePath;

          return buildWorkspaceNode(item, itemPath, parentPath, buildChildren(item.id));
        }

        const parentPath = item.parentId ? (groupPathsById.get(item.parentId) ?? workspacePath) : workspacePath;

        return buildDocumentNode(item, path.join(parentPath, `${item.name}.json`), parentPath);
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

export function buildTrashNodes(workspacePath, store) {
  const { groupPathsById } = buildNodeInfo(workspacePath, store);
  const items = [];

  for (const group of store.groups) {
    if (!group.deletedAt) {
      continue;
    }

    const groupPath = groupPathsById.get(group.id);
    const parentPath = group.parentId ? (groupPathsById.get(group.parentId) ?? workspacePath) : workspacePath;
    items.push(buildWorkspaceNode(group, groupPath, parentPath));
  }

  for (const document of store.documents) {
    if (!document.deletedAt) {
      continue;
    }

    const parentPath = document.parentId ? (groupPathsById.get(document.parentId) ?? workspacePath) : workspacePath;
    items.push(buildDocumentNode(document, path.join(parentPath, `${document.name}.json`), parentPath));
  }

  return items.sort((a, b) => {
    return new Date(b.deletedAt ?? 0).getTime() - new Date(a.deletedAt ?? 0).getTime();
  });
}

export function toRecentVisit(node) {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    path: node.path,
    parentPath: node.parentPath,
    parentId: node.parentId ?? null,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    deletedAt: node.deletedAt ?? null,
    trashed: Boolean(node.deletedAt),
    workspace: node.workspace,
    document: node.document
      ? {
          title: node.document.title,
          subTitle: node.document.subTitle,
          draftLength: node.document.draftLength,
          manuscriptLength: node.document.manuscriptLength,
          deletedAt: node.document.deletedAt ?? null,
        }
      : undefined,
  };
}
