import type sqlite3 from 'sqlite3';

import { all, run } from '../db/connection.js';
import type { WorkspaceStoreGroup, WorkspaceStoreRoot } from '../services/workspace/store-types.js';

export type GroupInfoRow = {
  nodeId: string;
  description: string | null;
  coverPath: string | null;
};

export function createGroupInfoRepository(db: sqlite3.Database) {
  return {
    findAllGroupInfo() {
      return all<GroupInfoRow>(db, 'SELECT * FROM group_info');
    },

    deleteAllGroupInfo() {
      return run(db, 'DELETE FROM group_info');
    },

    insertGroupInfo(group: WorkspaceStoreGroup | WorkspaceStoreRoot) {
      return run(db, 'INSERT INTO group_info (nodeId, description, coverPath) VALUES (?, ?, ?)', [
        group.id,
        group.description ?? '',
        group.coverPath ?? '',
      ]);
    },

    updateGroupInfo(
      nodeId: string,
      data: Partial<Pick<WorkspaceStoreGroup, 'description' | 'coverPath'>>,
    ) {
      return run(
        db,
        `
          UPDATE group_info
          SET
            description = COALESCE(?, description),
            coverPath = COALESCE(?, coverPath)
          WHERE nodeId = ?
        `,
        [data.description ?? null, data.coverPath ?? null, nodeId],
      );
    },
  };
}
