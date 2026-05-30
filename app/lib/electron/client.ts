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

export function requireElectronApi() {
  const electronApi = getElectronApi();

  if (!electronApi) {
    throw new Error('electronAPI is not available');
  }

  return electronApi;
}
