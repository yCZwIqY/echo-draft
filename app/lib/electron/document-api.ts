import { requireElectronApi } from './client';

export async function createDocument(path: string, name?: string) {
  return requireElectronApi().createDocument(path, name);
}

export async function getDocument(path: string) {
  return requireElectronApi().getDocument(path);
}

export async function removeDocument(path: string) {
  return requireElectronApi().removeDocument(path);
}

export async function purgeDocument(path: string) {
  return requireElectronApi().purgeDocument(path);
}

export async function restoreDocument(path: string) {
  return requireElectronApi().restoreDocument(path);
}

export async function updateDocument(path: string, data: DocumentUpdatePayload) {
  return requireElectronApi().updateDocument(path, data);
}
