export {};

declare global {
  type FileTreeNode = {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileTreeNode[];
  };

  type WorkspaceInfo = {
    path: string;
    exists: boolean;
  };

  interface Window {
    electronMeta?: {
      preloadReady: boolean;
    };
    electronAPI: {
      selectFolder: () => Promise<FileTreeNode | null>;
      readFile: (filePath: string) => Promise<string>;

      getCurrentWorkspacePath: () => Promise<WorkspaceInfo>;
      initCurrentWorkspace: () => Promise<WorkspaceInfo>;
      selectWorkspacePath: () => Promise<WorkspaceInfo | null>;
      resetWorkspacePath: () => Promise<WorkspaceInfo>;
      updateWorkspaceRoot: (targetPath: string) => Promise<WorkspaceInfo>;
      addGroup: (name: string) => Promise<{ name: string; path: string }>;
      renameWorkspace: (oldWorkspacePath: string, newName: string) => Promise<{ oldPath: string; newPath: string }>;
      removeWorkspace: (targetPath: string) => Promise<{ removed: boolean; path: string }>;
    };
  }
}
