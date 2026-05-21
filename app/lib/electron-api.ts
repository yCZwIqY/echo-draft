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

export async function getWorkspaceTree() {
  const electronApi = getElectronApi();

  if (!electronApi?.getWorkspaceTree) {
    throw new Error('electronAPI.getWorkspaceTree is not available');
  }
  return electronApi.getWorkspaceTree();
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
  if (!electronApi?.selectWorkspacePath) {
    throw new Error('electronAPI.selectWorkspacePath is not available');
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

export async function getWorkspaceInfo(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.getWorkspaceInfo) {
    throw new Error('electronAPI.getWorkspaceInfo is not available');
  }

  return electronApi.getWorkspaceInfo(path);
}

export async function updateWorkspaceInfo(path: string, workspaceInfo: Partial<WorkSpaceData>) {
  const electronApi = getElectronApi();
  if (!electronApi?.updateWorkspaceInfo) {
    throw new Error('electronAPI.updateWorkspaceInfo is not available');
  }

  return electronApi.updateWorkspaceInfo(path, workspaceInfo);
}

export async function createDocument(path: string) {
  const electronApi = getElectronApi();
  if (!electronApi?.createDocument) {
    throw new Error('electronAPI.createDocument is not available');
  }

  return electronApi.createDocument(path);
}
