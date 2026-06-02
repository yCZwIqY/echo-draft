import { createDocumentActions } from './document-actions.js';
import { createFileActions } from './file-actions.js';
import { createSettingActions } from './setting-actions.js';
import { createWorkspaceActions } from './workspace-actions.js';
import { createWorkspaceServiceContext } from './workspace-service-context.js';
import type { App } from 'electron';
import { createDocumentEmbeddingAction } from './embedding/document-embedding-action.js';
import { createCommentGenerationActions } from './comment/comment-generation-actions.js';

export function createWorkspaceService(app: Pick<App, 'getPath'>) {
  const context = createWorkspaceServiceContext(app);
  const workspaceActions = createWorkspaceActions(context);
  const documentActions = createDocumentActions(context);
  const fileActions = createFileActions(context);
  const settingActions = createSettingActions(context);
  const documentEmbeddingAction = createDocumentEmbeddingAction(context);
  const commentGenerationActions = createCommentGenerationActions(context);

  return {
    addRecentVisit: context.addRecentVisit,
    createDocument: documentActions.createDocument,
    createWorkspace: workspaceActions.createWorkspace,
    getCurrentWorkspaceInfo: context.getCurrentWorkspaceInfo,
    getCurrentWorkspacePath: context.getCurrentWorkspacePath,
    getDocument: documentActions.getDocument,
    getStoreNodeByPath: context.getStoreNodeByPath,
    getSettingInfo: settingActions.getSettingInfo,
    getTrashItems: workspaceActions.getTrashItems,
    getWorkflowInfo: workspaceActions.getWorkflowInfo,
    getWorkspaceInfo: context.getWorkspaceInfo,
    getWorkspaceTree: workspaceActions.getWorkspaceTree,
    initCurrentWorkspace: context.initCurrentWorkspace,
    purgeDocument: documentActions.purgeDocument,
    purgeWorkspace: workspaceActions.purgeWorkspace,
    removeDocument: documentActions.removeDocument,
    removeFile: fileActions.removeFile,
    removeWorkspace: workspaceActions.removeWorkspace,
    restoreDocument: documentActions.restoreDocument,
    restoreWorkspace: workspaceActions.restoreWorkspace,
    renameWorkspace: workspaceActions.renameWorkspace,
    resetWorkspacePath: context.resetWorkspacePath,
    saveImage: fileActions.saveImage,
    setCurrentWorkspacePath: context.setCurrentWorkspacePath,
    toFileSystemPath: fileActions.toFileSystemPath,
    updateDocument: documentActions.updateDocument,
    updateRoot: context.updateRoot,
    updateSelectedEmbeddingModel: settingActions.updateSelectedEmbeddingModel,
    updateSelectedLLMModel: settingActions.updateSelectedLLMModel,
    updateWorkflowInfo: workspaceActions.updateWorkflowInfo,
    updateWorkspaceInfo: workspaceActions.updateWorkspaceInfo,

    //documentEmbeddingAction
    indexDocument: documentEmbeddingAction.indexDocument,
    searchDocuments: documentEmbeddingAction.searchDocuments,

    //commentGenerationActions
    generateComments: commentGenerationActions.generateComments,
  };
}
