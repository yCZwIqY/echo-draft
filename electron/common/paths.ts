import os from 'node:os';
import path from 'node:path';

export function getDefaultWorkspacePath() {
  return path.join(os.homedir(), 'Documents', 'draft-novel');
}

export function getWorkspaceDatabaseFilePath(workspacePath: string) {
  return path.join(workspacePath, 'echo-draft.sqlite');
}

export function getWorkspaceScriptsDirectoryPath(workspacePath: string) {
  return path.join(workspacePath, 'scripts');
}

export function getWorkspaceScriptDataFilePath(workspacePath: string, documentId: string) {
  return path.join(getWorkspaceScriptsDirectoryPath(workspacePath), `${documentId}.json`);
}

export function getWorkspaceImagesDirectoryPath(rootWorkspacePath: string) {
  return path.join(rootWorkspacePath, 'images');
}
