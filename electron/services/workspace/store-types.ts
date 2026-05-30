export type StoredNodeType = 'workspace' | 'document';

export type StoredScriptContent = {
  content: string;
  charsWithSpaces: number;
  charsWithoutSpaces: number;
  createdAt: string;
  updatedAt: string;
};

export type StoredDocumentContent = {
  id?: string;
  title?: string;
  subTitle?: string;
  draft?: StoredScriptContent;
  manuscript?: StoredScriptContent;
};

export type WorkspaceStoreRoot = {
  id: string;
  name: string;
  description: string;
  coverPath: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type WorkspaceStoreGroup = WorkspaceStoreRoot & {
  type: 'workspace';
  parentId: string | null;
};

export type WorkspaceStoreDocument = {
  id: string;
  type: 'document';
  parentId: string | null;
  name: string;
  title: string;
  subTitle?: string;
  draftPath?: string;
  manuscriptPath?: string;
  draftLength: number;
  draftCharsWithoutSpaces: number;
  manuscriptLength: number;
  manuscriptCharsWithoutSpaces: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type WorkspaceStoreRecentVisit = {
  id?: string;
  path?: string;
  [key: string]: unknown;
};

export type WorkspaceStore = {
  version: number;
  workspace: WorkspaceStoreRoot;
  groups: WorkspaceStoreGroup[];
  documents: WorkspaceStoreDocument[];
  recentVisits: WorkspaceStoreRecentVisit[];
};

export type StoredDocumentMetaInput = Partial<WorkspaceStoreDocument> &
  Pick<WorkspaceStoreDocument, 'id' | 'name'> & {
    draft?: StoredScriptContent;
    manuscript?: StoredScriptContent;
  };
