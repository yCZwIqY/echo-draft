export {};

declare global {
  type WorkspaceNodeType = 'document' | 'workspace';

  type WorkspaceNodeWorkspace = {
    description?: string;
    coverPath?: string;
    deletedAt?: string | null;
  };

  type WorkspaceNodeDocument = {
    title?: string;
    subTitle?: string;
    draft?: ScriptContent;
    manuscript?: ScriptContent;
    draftLength?: number;
    manuscriptLength?: number;
    deletedAt?: string | null;
  };

  type ScriptContent = {
    content: string;
    charsWithSpaces: number;
    charsWithoutSpaces: number;
    createdAt: string;
    updatedAt: string;
  };

  type WorkspaceNode = {
    id?: string;
    type: WorkspaceNodeType;
    path: string;
    parentPath: string;
    parentId?: string | null;
    name: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    trashed?: boolean;
    workspace?: WorkspaceNodeWorkspace;
    document?: WorkspaceNodeDocument;
    children?: WorkspaceNode[];
    recentVisits?: WorkspaceNode[];
  };

  type WorkspaceInfo = {
    path: string;
    exists: boolean;
  };

  type Setting = {
    workspacePath: string;
    recentVisits: WorkspaceNode[];
  };

  interface Window {
    electronMeta?: {
      preloadReady: boolean;
    };
    electronAPI: {
      selectFolder: () => Promise<WorkspaceNode | null>;
      readFile: (filePath: string) => Promise<string>;
      readImage: (filePath: string) => Promise<string>;

      getWorkspaceTree: (path?: string) => Promise<WorkspaceNode[]>;
      getTrashItems: () => Promise<WorkspaceNode[]>;
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
      purgeWorkspace: (targetPath: string) => Promise<{ removed: boolean; path: string }>;
      restoreWorkspace: (targetPath: string) => Promise<{ restored: boolean; path: string }>;
      getWorkspaceInfo: (targetPath: string) => Promise<WorkspaceNode>;
      updateWorkspaceInfo: (
        targetPath: string,
        workspaceInfo: Partial<WorkspaceNode>,
      ) => Promise<WorkspaceNode>;

      createDocument: (targetPath: string, name?: string) => Promise<WorkspaceNode>;
      getDocument: (documentPath: string) => Promise<WorkspaceNode>;
      removeDocument: (documentPath: string) => Promise<{ removed: boolean; path: string }>;
      purgeDocument: (documentPath: string) => Promise<{ removed: boolean; path: string }>;
      restoreDocument: (documentPath: string) => Promise<{ restored: boolean; path: string }>;
      updateDocument: (
        documentPath: string,
        data: Partial<WorkspaceNode>,
      ) => Promise<WorkspaceNode>;

      saveImage: (workflowPath: string, fileName: string, buffer: number[]) => Promise<string>;
      removeFile: (filePath: string) => Promise<void>;
      showInFolder: (filePath: string) => Promise<void>;
    };
  }
}
