export function getElectronMeta() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.electronMeta ?? null;
}

export function getElectronApi() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.electronAPI ?? null;
}

export function isElectronReady() {
  return Boolean(getElectronApi());
}

export async function getWorkspaceTree(path?: string) {
  const electronApi = getElectronApi();

  if (!electronApi?.getWorkspaceTree) {
    throw new Error('electronAPI.getWorkspaceTree is not available');
  }
  return electronApi.getWorkspaceTree(path);
}

export async function getTrashItems() {
  const electronApi = getElectronApi();

  if (!electronApi?.getTrashItems) {
    throw new Error('electronAPI.getTrashItems is not available');
  }

  return electronApi.getTrashItems();
}

export function onWorkspaceTreeChanged(listener: () => void) {
  const electronApi = getElectronApi();

  if (!electronApi?.onWorkspaceTreeChanged) {
    throw new Error('electronAPI.onWorkspaceTreeChanged is not available');
  }

  return electronApi.onWorkspaceTreeChanged(listener);
}

export async function selectFolder() {
  const electronApi = getElectronApi();

  if (!electronApi?.selectFolder) {
    return null;
  }

  return electronApi.selectFolder();
}

export async function readFile(filePath: string) {
  const electronApi = getElectronApi();

  if (!electronApi?.readFile) {
    throw new Error('electronAPI.readFile is not available');
  }

  return electronApi.readFile(filePath);
}

export async function readImage(filePath: string) {
  const electronApi = getElectronApi();

  if (!electronApi?.readImage) {
    throw new Error('electronAPI.readImage is not available');
  }

  return electronApi.readImage(filePath);
}

export async function getCurrentWorkspacePath() {
  const electronApi = getElectronApi();

  if (!electronApi?.getCurrentWorkspacePath) {
    throw new Error('electronAPI.getCurrentWorkspacePath is not available');
  }

  return electronApi.getCurrentWorkspacePath();
}

export async function initCurrentWorkspace() {
  const electronApi = getElectronApi();

  if (!electronApi?.initCurrentWorkspace) {
    throw new Error('electronAPI.initCurrentWorkspace is not available');
  }

  return electronApi.initCurrentWorkspace();
}

export async function selectWorkspacePath() {
  const electronApi = getElectronApi();

  if (!electronApi?.selectWorkspacePath) {
    throw new Error('electronAPI.selectWorkspacePath is not available');
  }

  return electronApi.selectWorkspacePath();
}

export async function updateWorkspaceRootPath(targetPath: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.updateWorkspaceRoot) {
    throw new Error('electronAPI.updateWorkspaceRoot is not available');
  }

  return electronApi.updateWorkspaceRoot(targetPath);
}

export async function createWorkspace(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.createWorkspace) {
    throw new Error('electronAPI.createWorkspace is not available');
  }

  return electronApi.createWorkspace(path);
}

export async function removeWorkspace(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.removeWorkspace) {
    throw new Error('electronAPI.removeWorkspace is not available');
  }

  return electronApi.removeWorkspace(path);
}

export async function purgeWorkspace(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.purgeWorkspace) {
    throw new Error('electronAPI.purgeWorkspace is not available');
  }

  return electronApi.purgeWorkspace(path);
}

export async function restoreWorkspace(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.restoreWorkspace) {
    throw new Error('electronAPI.restoreWorkspace is not available');
  }

  return electronApi.restoreWorkspace(path);
}

export async function getWorkspaceInfo(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.getWorkspaceInfo) {
    throw new Error('electronAPI.getWorkspaceInfo is not available');
  }

  return electronApi.getWorkspaceInfo(path);
}

export async function updateWorkspaceInfo(path: string, workspaceInfo: Partial<WorkspaceNode>) {
  const electronApi = getElectronApi();
  if (!electronApi?.updateWorkspaceInfo) {
    throw new Error('electronAPI.updateWorkspaceInfo is not available');
  }

  return electronApi.updateWorkspaceInfo(path, workspaceInfo);
}

export async function createDocument(path: string, name?: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.createDocument) {
    throw new Error('electronAPI.createDocument is not available');
  }

  return electronApi.createDocument(path, name);
}

export async function getDocument(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.getDocument) {
    throw new Error('electronAPI.getDocument is not available');
  }

  return electronApi.getDocument(path);
}

export async function removeDocument(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.removeDocument) {
    throw new Error('electronAPI.removeDocument is not available');
  }

  return electronApi.removeDocument(path);
}

export async function purgeDocument(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.purgeDocument) {
    throw new Error('electronAPI.purgeDocument is not available');
  }

  return electronApi.purgeDocument(path);
}

export async function restoreDocument(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.restoreDocument) {
    throw new Error('electronAPI.restoreDocument is not available');
  }

  return electronApi.restoreDocument(path);
}

export async function updateDocument(path: string, data: Partial<WorkspaceNode>) {
  const electronApi = getElectronApi();
  if (!electronApi?.updateDocument) {
    throw new Error('electronAPI.updateDocument is not available');
  }

  return electronApi.updateDocument(path, data);
}

export async function saveImage(workflowPath: string, file: File) {
  const electronApi = getElectronApi();
  if (!electronApi?.saveImage) {
    throw new Error('electronAPI.saveImage is not available');
  }

  const arrayBuffer = await file.arrayBuffer();
  return await window.electronAPI.saveImage(
    workflowPath,
    file.name,
    Array.from(new Uint8Array(arrayBuffer)),
  );
}

export async function removeFile(filePath: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.removeFile) {
    throw new Error('electronAPI.removeFile is not available');
  }
  return electronApi.removeFile(filePath);
}


export async function showInFolder(filePath: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.showInFolder) {
    throw new Error('electronAPI.showInFolder is not available');
  }
  return electronApi.showInFolder(filePath);
}
