import { requireElectronApi } from '~/lib/electron/client';

export async function indexDocument(documentPath: string) {
  return requireElectronApi().indexDocument(documentPath);
}

export async function searchDocuments(query: string, limit?: number) {
  return requireElectronApi().searchDocuments(query, limit);
}
