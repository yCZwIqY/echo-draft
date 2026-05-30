import type sqlite3 from 'sqlite3';

import { initializeSchema, withDatabase } from '../db/connection.js';
import { createDocumentInfoRepository } from '../repositories/document-info-repository.js';
import { createGroupInfoRepository } from '../repositories/group-info-repository.js';
import { createRecentVisitRepository } from '../repositories/recent-visit-repository.js';
import { createWorkspaceNodeRepository } from '../repositories/workspace-node-repository.js';

export type WorkspaceRepositories = {
  db: sqlite3.Database;
  documentInfo: ReturnType<typeof createDocumentInfoRepository>;
  groupInfo: ReturnType<typeof createGroupInfoRepository>;
  recentVisits: ReturnType<typeof createRecentVisitRepository>;
  workspaceNodes: ReturnType<typeof createWorkspaceNodeRepository>;
};

export function withWorkspaceRepositories<Result>(
  workspacePath: string,
  callback: (repositories: WorkspaceRepositories) => Promise<Result>,
) {
  return withDatabase(workspacePath, async (db) => {
    await initializeSchema(db);

    return callback({
      db,
      documentInfo: createDocumentInfoRepository(db),
      groupInfo: createGroupInfoRepository(db),
      recentVisits: createRecentVisitRepository(db),
      workspaceNodes: createWorkspaceNodeRepository(db),
    });
  });
}
