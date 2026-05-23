import { createDocumentService } from '../services/document-service.mjs';
import { ipcMain } from 'electron';
import channels from '../common/channels.cjs';

export function registerDocumentIpcHandlers(app) {
  const documentService = createDocumentService(app);

  ipcMain.handle(channels.document.createDocument, async (_, workspace, name) => {
    return documentService.createDocument(workspace, name);
  });

  ipcMain.handle(channels.document.getDocument, async (_, documentPath) => {
    return documentService.getDocument(documentPath);
  });

  ipcMain.handle(channels.document.removeDocument, async (_, documentPath) => {
    return documentService.removeDocument(documentPath);
  });

  ipcMain.handle(channels.document.purgeDocument, async (_, documentPath) => {
    return documentService.purgeDocument(documentPath);
  });

  ipcMain.handle(channels.document.restoreDocument, async (_, documentPath) => {
    return documentService.restoreDocument(documentPath);
  });

  ipcMain.handle(channels.document.updateDocument, async (_, documentPath, data) => {
    return documentService.updateDocument(documentPath, data);
  });
}
