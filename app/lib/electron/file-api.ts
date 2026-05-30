import { requireElectronApi } from './client';

export async function selectFolder() {
  const electronApi = requireElectronApi();

  if (!electronApi.selectFolder) {
    return null;
  }

  return electronApi.selectFolder();
}

export async function readFile(filePath: string) {
  return requireElectronApi().readFile(filePath);
}

export async function readImage(filePath: string) {
  return requireElectronApi().readImage(filePath);
}

export async function saveImage(workflowPath: string, file: File) {
  const arrayBuffer = await file.arrayBuffer();

  return requireElectronApi().saveImage(
    workflowPath,
    file.name,
    Array.from(new Uint8Array(arrayBuffer)),
  );
}

export async function removeFile(filePath: string) {
  return requireElectronApi().removeFile(filePath);
}

export async function showInFolder(filePath: string) {
  return requireElectronApi().showInFolder(filePath);
}
