import path from 'node:path';
import * as lancedb from '@lancedb/lancedb';

export const DOCUMENT_EMBEDDINGS_TABLE = 'document_embeddings';
export type DocumentEmbeddingRow = {
  id: string;
  documentId: string;
  documentPath: string;
  title: string;
  content: string;
  chunkIndex: number;
  vector: number[];
  updatedAt: string;
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

  return table.search(vector).limit(limit).toArray();
}
