import fs from 'node:fs/promises';

import { getWorkspaceScriptDataFilePath, getWorkspaceScriptsDirectoryPath } from '../../common/paths.js';
import { ensureDirectory, pathExists } from '../file-system.js';
import type { StoredDocumentContent } from './store-types.js';

export function isEmptyJsonFileContent(raw: unknown) {
  return typeof raw !== 'string' || raw.trim() === '';
}

export async function ensureScriptsDirectory(workspacePath: string) {
  await ensureDirectory(getWorkspaceScriptsDirectoryPath(workspacePath));
}

export async function readDocumentContent(
  workspacePath: string,
  documentId: string,
): Promise<StoredDocumentContent> {
  const scriptDataPath = getWorkspaceScriptDataFilePath(workspacePath, documentId);

  if (!(await pathExists(scriptDataPath))) {
    return {
      title: '',
      subTitle: '',
      draft: undefined,
      manuscript: undefined,
    };
  }

  try {
    const raw = await fs.readFile(scriptDataPath, 'utf8');

    if (isEmptyJsonFileContent(raw)) {
      return {
        title: '',
        subTitle: '',
        draft: undefined,
        manuscript: undefined,
      };
    }

    return JSON.parse(raw) as StoredDocumentContent;
  } catch {
    return {
      title: '',
      subTitle: '',
      draft: undefined,
      manuscript: undefined,
    };
  }
}

export async function writeDocumentContent(
  workspacePath: string,
  documentId: string,
  data: StoredDocumentContent,
) {
  await ensureScriptsDirectory(workspacePath);
  await fs.writeFile(
    getWorkspaceScriptDataFilePath(workspacePath, documentId),
    JSON.stringify(data, null, 2),
    'utf8',
  );
}
