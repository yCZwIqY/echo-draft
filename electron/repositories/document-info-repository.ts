import type sqlite3 from 'sqlite3';

import { all, run } from '../db/connection.js';
import type { WorkspaceStoreDocument } from '../services/workspace/store-types.js';

export type DocumentInfoRow = {
  nodeId: string;
  title: string;
  subTitle: string | null;
  draftPath: string | null;
  manuscriptPath: string | null;
  draftCharsWithSpaces: number;
  draftCharsWithoutSpaces: number;
  manuscriptCharsWithSpaces: number;
  manuscriptCharsWithoutSpaces: number;
};

export function createDocumentInfoRepository(db: sqlite3.Database) {
  return {
    findAllDocumentInfo() {
      return all<DocumentInfoRow>(db, 'SELECT * FROM document_info');
    },

    deleteAllDocumentInfo() {
      return run(db, 'DELETE FROM document_info');
    },

    insertDocumentInfo(document: WorkspaceStoreDocument) {
      return run(
        db,
        `
          INSERT INTO document_info (
            nodeId,
            title,
            subTitle,
            draftPath,
            manuscriptPath,
            draftCharsWithSpaces,
            draftCharsWithoutSpaces,
            manuscriptCharsWithSpaces,
            manuscriptCharsWithoutSpaces
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          document.id,
          document.title ?? document.name,
          document.subTitle ?? '',
          document.draftPath ?? `scripts/${document.id}.json`,
          document.manuscriptPath ?? `scripts/${document.id}.json`,
          document.draftLength ?? 0,
          document.draftCharsWithoutSpaces ?? 0,
          document.manuscriptLength ?? 0,
          document.manuscriptCharsWithoutSpaces ?? 0,
        ],
      );
    },

    updateDocumentInfo(document: WorkspaceStoreDocument) {
      return run(
        db,
        `
          UPDATE document_info
          SET
            title = ?,
            subTitle = ?,
            draftPath = ?,
            manuscriptPath = ?,
            draftCharsWithSpaces = ?,
            draftCharsWithoutSpaces = ?,
            manuscriptCharsWithSpaces = ?,
            manuscriptCharsWithoutSpaces = ?
          WHERE nodeId = ?
        `,
        [
          document.title ?? document.name,
          document.subTitle ?? '',
          document.draftPath ?? `scripts/${document.id}.json`,
          document.manuscriptPath ?? `scripts/${document.id}.json`,
          document.draftLength ?? 0,
          document.draftCharsWithoutSpaces ?? 0,
          document.manuscriptLength ?? 0,
          document.manuscriptCharsWithoutSpaces ?? 0,
          document.id,
        ],
      );
    },
  };
}
