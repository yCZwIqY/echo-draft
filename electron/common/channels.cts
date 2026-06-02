const channels = {
  folder: {
    select: 'folder:select',
  },
  file: {
    read: 'file:read',
    readImage: 'file:read-image',
    remove: 'file:remove',
    saveImage: 'file:save-image',
    showInFolder: 'show-in-folder',

  },
  workspace: {
    getWorkspaceTree: 'workspace:get-tree',
    getTrashItems: 'workspace:get-trash-items',
    treeChanged: 'workspace:tree-changed',
    getCurrentPath: 'workspace:get-current-path',
    initCurrent: 'workspace:init-current',
    selectPath: 'workspace:select-path',
    resetPath: 'workspace:reset-path',
    updateRoot: 'workspace:update-root',
    createWorkspace: 'workspace:create',
    renameWorkspace: 'workspace:rename',
    removeWorkspace: 'workspace:remove',
    purgeWorkspace: 'workspace:purge',
    restoreWorkspace: 'workspace:restore',
    getWorkspaceInfo: 'workspace:get-info',
    updateWorkspaceInfo: 'workspace:update-info',
  },
  document: {
    createDocument: 'document:create',
    getDocument: 'document:get',
    removeDocument: 'document:remove',
    purgeDocument: 'document:purge',
    restoreDocument: 'document:restore',
    updateDocument: 'document:update',
  },
  setting: {
    getInfo: 'setting:get-info',
    updateSelectedEmbeddingModel: 'setting:update-selected-embedding-model',
    updateSelectedLLMModel: 'setting:update-selected-llm-model',
  },
  embedding: {
    indexDocument: 'embedding:index',
    searchDocument: 'embedding:search',
  }
};

export = channels;
