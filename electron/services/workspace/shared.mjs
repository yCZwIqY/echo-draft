import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function now() {
  return new Date().toISOString();
}

export function normalizePath(targetPath) {
  return path.resolve(targetPath);
}

export function toFileSystemPath(targetPath) {
  if (typeof targetPath === 'string' && targetPath.startsWith('file://')) {
    return fileURLToPath(targetPath);
  }

  return targetPath;
}

export function mergeRecentVisits(recentVisits = [], visit, max = 10) {
  return [visit, ...recentVisits.filter((item) => item?.path !== visit.path)].slice(0, max);
}

export function sanitizeNodeName(name) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('이름이 비어 있습니다.');
  }

  if (/[\\/:*?"<>|]/.test(trimmedName)) {
    throw new Error('이름에 사용할 수 없는 문자가 포함되어 있습니다.');
  }

  return trimmedName;
}

export function collectGroupDescendantIds(groups, targetId) {
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

export function collectGroupAncestorIds(groupsById, targetParentId) {
  const ancestors = new Set();
  let cursorId = targetParentId;

  while (cursorId) {
    const parent = groupsById.get(cursorId);
    if (!parent || ancestors.has(parent.id)) {
      break;
    }

    ancestors.add(parent.id);
    cursorId = parent.parentId ?? null;
  }

  return ancestors;
}

export function collectDocumentIdsByGroupIds(documents, groupIds) {
  const documentIds = new Set();

  for (const document of documents) {
    if (groupIds.has(document.parentId ?? '')) {
      documentIds.add(document.id);
    }
  }

  return documentIds;
}
