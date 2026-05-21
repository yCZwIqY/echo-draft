module.exports = {
  folder: {
    select: 'folder:select',
  },
  file: {
    read: 'file:read',
  },
  workspace: {
    getWorkspaceTree: 'workspace:get-tree',
    treeChanged: 'workspace:tree-changed',
    getCurrentPath: 'workspace:get-current-path',
    initCurrent: 'workspace:init-current',
    selectPath: 'workspace:select-path',
    resetPath: 'workspace:reset-path',
    updateRoot: 'workspace:update-root',
    createWorkspace: 'workspace:create',
    renameWorkspace: 'workspace:rename',
    removeWorkspace: 'workspace:remove',
    getWorkspaceInfo: 'workspace:get-info',
    updateWorkspaceInfo: 'workspace:update-info',
  },
  document: {
    createDocument: 'document:create',
  }
};
