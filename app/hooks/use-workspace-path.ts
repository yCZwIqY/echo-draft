import { useEffect, useState } from 'react';

import {
  getElectronMeta,
  initCurrentWorkspace,
  isElectronReady,
  selectWorkspacePath,
  updateWorkspaceRootPath,
} from '~/lib/electron-api';

export function useWorkspacePath() {
  const [workspacePath, setWorkspacePath] = useState('');
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (!isElectronReady()) {
      setWorkspacePath('');
      setStatusText(getElectronMeta()?.preloadReady ? 'electronAPI missing' : 'preload missing');
      return;
    }

    setStatusText('electron ready');

    initCurrentWorkspace()
      .then((result) => {
        setWorkspacePath(result.path);
        setStatusText('');
      })
      .catch((error: unknown) => {
        setStatusText(error instanceof Error ? error.message : 'workspace init failed');
      });
  }, []);

  const changeWorkspacePath = async () => {
    const result = await selectWorkspacePath();

    if (!result) {
      return null;
    }

    setWorkspacePath(result.path);
    setStatusText('');

    return result;
  };

  const updateWorkspaceRoot = async (workspaceInfo: WorkspaceInfo | null) => {
    if (workspaceInfo) {
      return await updateWorkspaceRootPath(workspaceInfo?.path);
    }

    return null;
  };

  return {
    changeWorkspacePath,
    statusText,
    workspacePath,
    updateWorkspaceRoot
  };
}
