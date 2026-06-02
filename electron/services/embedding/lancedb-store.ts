import path from 'node:path';
import * as lancedb from '@lancedb/lancedb';

export const DOCUMENT_EMBEDDINGS_TABLE = 'document_embeddings';
export type DocumentEmbeddingRow = {
  id: string;
  documentId: string;
  documentPath: string;
  parentPath: string;
  title: string;
  content: string;
  chunkIndex: number;
  vector: number[];
  updatedAt: string;
};

export type DocumentEmbeddingSearchResult = Omit<DocumentEmbeddingRow, 'vector'> & {
  distance: number | null;
};

type LanceDbSearchRow = Partial<DocumentEmbeddingRow> & {
  _distance?: number;
  _score?: number;
};

export function getLanceDbPath(workspacePath: string) {
  return path.join(workspacePath, 'lancedb');
}

export async function connectLanceDb(workspacePath: string) {
  return lancedb.connect(getLanceDbPath(workspacePath));
}

export async function getDocumentEmbeddingsTable(workspacePath: string) {
  const db = await connectLanceDb(workspacePath);
  const tableNames = await db.tableNames();

  if (tableNames.includes(DOCUMENT_EMBEDDINGS_TABLE)) {
    return db.openTable(DOCUMENT_EMBEDDINGS_TABLE);
  }

  return null;
}

export async function replaceDocumentEmbedding(
  workspacePath: string,
  documentId: string,
  rows: DocumentEmbeddingRow[],
) {
  const db = await connectLanceDb(workspacePath);
  const tableNames = await db.tableNames();

  if (!tableNames.includes(DOCUMENT_EMBEDDINGS_TABLE)) {
    if (rows.length === 0) {
      return;
    }

    await db.createTable(DOCUMENT_EMBEDDINGS_TABLE, rows);
    return;
  }

  const table = await db.openTable(DOCUMENT_EMBEDDINGS_TABLE);

  await table.delete(`documentId = '${documentId.replaceAll("'", "''")}'`);
  if (rows.length > 0) {
    await table.add(rows);
  }
}

export async function searchDocumentEmbeddings(
  workspacePath: string,
  vector: number[],
  limit = 10,
) {
  const table = await getDocumentEmbeddingsTable(workspacePath);
  if (!table) return [];

  const rows = (await table.search(vector).limit(limit).toArray()) as LanceDbSearchRow[];

  return rows.map(toSearchResult);
}

export async function findDocumentEmbeddingsByParentPath(
  workspacePath: string,
  parentPath: string,
  limit = 10,
) {
  const table = await getDocumentEmbeddingsTable(workspacePath);
  if (!table) return [];

  const rows = (await table
    .query()
    .where(`documentPath LIKE '${parentPath.replaceAll("'", "''")}%'`)
    .limit(limit)
    .toArray()) as LanceDbSearchRow[];

  return rows.map(toSearchResult);
}

function toSearchResult(row: LanceDbSearchRow): DocumentEmbeddingSearchResult {
  return {
    id: String(row.id ?? ''),
    documentId: String(row.documentId ?? ''),
    documentPath: String(row.documentPath ?? ''),
    parentPath: String(row.parentPath ?? ''),
    title: String(row.title ?? ''),
    content: String(row.content ?? ''),
    chunkIndex: Number(row.chunkIndex ?? 0),
    updatedAt: String(row.updatedAt ?? ''),
    distance: typeof row._distance === 'number' ? row._distance : null,
  };
}
