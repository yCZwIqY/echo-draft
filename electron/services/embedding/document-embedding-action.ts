import type { WorkspaceServiceContext } from '../workspace-service-context.js';
import { chunkText, type TextChunk } from './chunk-text.js';
import { embedTexts } from './embedding-service.js';
import { now } from '../workspace/shared.js';
import {
  type DocumentEmbeddingRow,
  replaceDocumentEmbedding,
  searchDocumentEmbeddings,
} from './lancedb-store.js';
import type { WorkspaceRepositories } from '../workspace-repository-context.js';
import { readDocumentContent } from '../workspace/store.js';

export function createDocumentEmbeddingAction(context: WorkspaceServiceContext) {
  async function indexDocument(documentPath: string) {

    console.log('createDocumentEmbeddingAction - indexDocument');

    const { workspacePath, node } = await context.getStoreNodeByPath(documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('임베딩할 문서를 찾을 수 없습니다.');
    }

    const setting = await context.withWorkspaceRepositories(
      workspacePath,
      async ({ settingInfo }: WorkspaceRepositories) => settingInfo.findSettingInfo(),
    );

    if (!setting.selectedEmbeddingModel) {
      throw new Error('임베딩 모델이 선택되지 않았습니다.');
    }

    const content = await readDocumentContent(workspacePath, node.id);
    const text = [
      content.title,
      content.subTitle,
      content.draft?.content,
      content.manuscript?.content,
    ]
      .filter(Boolean)
      .join('\n\n');

    const chunks = chunkText(text);
    const embeddings = await embedTexts(
      setting.selectedEmbeddingModel,
      chunks.map((chunk: TextChunk) => chunk.content),
    );

    const rows: DocumentEmbeddingRow[] =
      chunks.map((chunk: TextChunk, index: number) => ({
        id: `${node.id}:${chunk.chunkIndex}`,
        documentId: node.id,
        documentPath: node.path,
        title: node.document?.title ?? node.name ?? '',
        content: chunk.content ?? '',
        chunkIndex: chunk.chunkIndex,
        vector: embeddings[index],
        updatedAt: now(),
      })) ?? [];

    await replaceDocumentEmbedding(workspacePath, node.id, rows);

    return {
      documentId: node.id,
      chunks: rows.length,
    };
  }

  async function searchDocuments(query: string, limit = 10) {
    const workspacePath = await context.getCurrentWorkspacePath();

    const setting = await context.withWorkspaceRepositories(
      workspacePath,
      async ({ settingInfo }: WorkspaceRepositories) => settingInfo.findSettingInfo(),
    );

    if (!setting.selectedEmbeddingModel) {
      throw new Error('임베딩 모델이 선택되지 않았습니다.');
    }

    const [queryVector] = await embedTexts(setting.selectedEmbeddingModel, [query]);

    if (!queryVector) {
      return [];
    }

    return searchDocumentEmbeddings(workspacePath, queryVector, limit);
  }

  return {
    indexDocument,
    searchDocuments,
  };
}
