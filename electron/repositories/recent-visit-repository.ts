import type sqlite3 from 'sqlite3';

import { all, createPlaceholders, run } from '../db/connection.js';
import type { WorkspaceStoreRecentVisit } from '../services/workspace/store-types.js';

export type RecentVisitRow = {
  id: string;
  sortOrder: number;
  payload: string;
};

export function createRecentVisitRepository(db: sqlite3.Database) {
  return {
    findAllRecentVisits() {
      return all<RecentVisitRow>(db, 'SELECT * FROM recent_visits ORDER BY sortOrder ASC');
    },

    deleteAllRecentVisits() {
      return run(db, 'DELETE FROM recent_visits');
    },

    async insertRecentVisits(recentVisits: WorkspaceStoreRecentVisit[]) {
      for (const [index, visit] of recentVisits.entries()) {
        if (!visit.id) {
          continue;
        }

        await run(
          db,
          `
            INSERT INTO recent_visits (id, sortOrder, payload)
            VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              sortOrder = excluded.sortOrder,
              payload = excluded.payload
          `,
          [visit.id, index, JSON.stringify(visit)],
        );
      }
    },

    deleteRecentVisitsByIds(ids: string[]) {
      if (ids.length === 0) {
        return Promise.resolve();
      }

      return run(
        db,
        `DELETE FROM recent_visits WHERE id IN (${createPlaceholders(ids)})`,
        ids,
      );
    },
  };
}
