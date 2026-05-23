import { createWorkspaceService } from './workspace-service.mjs';

export function createDocumentService(app) {
  const workspaceService = createWorkspaceService(app);

  async function createDocument(workspacePath, name) {
    return workspaceService.createDocument(workspacePath, name);
  }

  async function getDocument(documentPath) {
    return workspaceService.getDocument(documentPath);
  }

  async function updateDocument(documentPath, data) {
    return workspaceService.updateDocument(documentPath, data);
  }

  async function removeDocument(documentPath) {
    return workspaceService.removeDocument(documentPath);
  }

  async function purgeDocument(documentPath) {
    return workspaceService.purgeDocument(documentPath);
  }

  async function restoreDocument(documentPath) {
    return workspaceService.restoreDocument(documentPath);
  }

  return {
    createDocument,
    getDocument,
    purgeDocument,
    removeDocument,
    restoreDocument,
    updateDocument,
  };
}
