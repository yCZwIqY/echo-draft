import fs from 'node:fs/promises';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import type { App } from 'electron';

import { all, run } from '../db/connection.js';

type CurrentWorkspaceRow = {
  id: 'default';
  workspacePath: string | null;
};

const DEFAULT_SETTING_ID = 'default';
const sqlite = sqlite3.verbose();

export function createCurrentWorkspaceRepository(app: Pick<App, 'getPath'>) {
  let initializePromise: Promise<void> | null = null;

  function getDatabasePath() {
    return path.join(app.getPath('userData'), 'settings.sqlite');
  }

  async function withAppSettingsDatabase<Result>(
    callback: (db: sqlite3.Database) => Promise<Result>,
  ) {
    await fs.mkdir(app.getPath('userData'), {
      recursive: true,
    });

    const db = new sqlite.Database(getDatabasePath());

    try {
      return await callback(db);
    } finally {
      await new Promise<void>((resolve, reject) => {
        db.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  }

  async function initialize() {
    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = withAppSettingsDatabase(async (db) => {
      await run(
        db,
        `
          CREATE TABLE IF NOT EXISTS current_workspace (
            id TEXT PRIMARY KEY CHECK (id = 'default'),
            workspacePath TEXT
          )
        `,
      );
    });

    return initializePromise;
  }

  return {
    async getCurrentWorkspacePath() {
      await initialize();

      return withAppSettingsDatabase(async (db) => {
        const rows = await all<CurrentWorkspaceRow>(
          db,
          'SELECT id, workspacePath FROM current_workspace WHERE id = ?',
          [DEFAULT_SETTING_ID],
        );

        return rows[0]?.workspacePath ?? null;
      });
    },

    async setCurrentWorkspacePath(workspacePath: string) {
      await initialize();

      await withAppSettingsDatabase(async (db) => {
        await run(
          db,
          `
            INSERT INTO current_workspace (id, workspacePath)
            VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET
              workspacePath = excluded.workspacePath
          `,
          [DEFAULT_SETTING_ID, workspacePath],
        );
      });
    },
  };
}
