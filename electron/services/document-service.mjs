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

  return {
    createDocument,
    getDocument,
    updateDocument,
  };
}
