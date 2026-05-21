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

  type WorkSpaceData = {
    id?: string;
    path: string;
    parentPath: string;
    name: string;
    description?: string;
    thumbnail?: string;
    createdAt?: string;
    recentVisits?: (WorkSpaceData | DocumentData)[];
  };

  type ScriptContent = {
    content: string;
    charsWithSpaces: number;
    charsWithoutSpaces: number;
    createdAt: string;
    updatedAt: string;
  };

  type DocumentData = {
    id?: string;
    parentPath: string;
    path: string;
    name: string;
    title: string;
    subTitle?: string;
    draft?: ScriptContent;
    manuscript?: ScriptContent;
  };

  type Setting = {
    workspacePath: string;
    recentVisits: (WorkSpaceData | DocumentData)[];
  };

  interface Window {
    electronMeta?: {
      preloadReady: boolean;
    };
    electronAPI: {
      selectFolder: () => Promise<FileTreeNode | null>;
      readFile: (filePath: string) => Promise<string>;

      //workspace
      getWorkspaceTree: () => Promise<FileTreeNode[]>;
      onWorkspaceTreeChanged: (listener: () => void) => () => void;
      getCurrentWorkspacePath: () => Promise<WorkspaceInfo>;
      initCurrentWorkspace: () => Promise<WorkspaceInfo>;
      selectWorkspacePath: () => Promise<WorkspaceInfo | null>;
      resetWorkspacePath: () => Promise<WorkspaceInfo>;
      updateWorkspaceRoot: (targetPath: string) => Promise<WorkspaceInfo>;
      createWorkspace: (name: string) => Promise<{ name: string; path: string }>;
      renameWorkspace: (
        oldWorkspacePath: string,
        newName: string,
      ) => Promise<{ oldPath: string; newPath: string }>;
      removeWorkspace: (targetPath: string) => Promise<{ removed: boolean; path: string }>;
      getWorkspaceInfo: (targetPath: string) => Promise<WorkSpaceData>;
      updateWorkspaceInfo: (
        targetPath: string,
        workspaceInfo: Partial<WorkSpaceData>,
      ) => Promise<WorkSpaceData>;

      //document
      createDocument: (targetPath: string) => Promise<DocumentData>;
    };
  }
}
