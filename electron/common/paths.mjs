import os from 'node:os';
import path from 'node:path';

export function getDefaultWorkspacePath() {
  return path.join(os.homedir(), 'Documents', 'draft-novel');
}

export function getDefaultWorkspaceDataFilePath(workspacePath) {
  return path.join(workspacePath, 'workspace.json');
}

export function getWorkspaceDocumentsDirectoryPath(workspacePath) {
  return path.join(workspacePath, 'documents');
}

export function getWorkspaceDocumentDataFilePath(workspacePath, documentId) {
  return path.join(getWorkspaceDocumentsDirectoryPath(workspacePath), `${documentId}.json`);
}

export function getWorkspaceImagesDirectoryPath(rootWorkspacePath) {
  return path.join(rootWorkspacePath, 'images');
}
