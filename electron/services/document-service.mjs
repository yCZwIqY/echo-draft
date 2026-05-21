import { formatDate } from '../../utils/date-utils.ts';
import path from 'node:path';
import fs from 'node:fs/promises';

export function createDocumentService(app) {
  async function createDocument(workspacePath) {
    const documentName = `${formatDate(new Date())}`;
    const documentData = {
      id: crypto.randomUUID(),
      name: documentName,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentPath: workspacePath,
      path: path.join(workspacePath, `${documentName}.json`),
    };
    await fs.writeFile(
      path.join(workspacePath, `${documentName}.json`),
      JSON.stringify(documentData, null, 2),
      'utf8',
    );

    return documentData;
  }

  return {
    createDocument,
  };
}
