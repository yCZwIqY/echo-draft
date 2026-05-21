import { createDocumentService } from '../services/document-service.mjs';
import { ipcMain } from 'electron';
import channels from '../common/channels.cjs';

export function registerDocumentIpcHandlers(app) {
  const documentService = createDocumentService(app);

  ipcMain.handle(channels.document.createDocument, async (_, targetPath) => {
    return documentService.createDocument(targetPath);
  });
}
