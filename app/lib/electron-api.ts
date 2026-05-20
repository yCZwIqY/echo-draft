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
