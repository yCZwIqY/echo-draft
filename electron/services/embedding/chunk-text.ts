export type TextChunk = {
  content: string;
  chunkIndex: number;
};

type ChunkOptions = {
  maxChars?: number;
  overlapChars?: number;
};

export function chunkText(
  text: string,
  { maxChars = 1000, overlapChars = 150 }: ChunkOptions = {},
) {
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!normalized) {
    return [];
  }

  const chunks: TextChunk[] = [];
  const paragraphs = normalized.split(/\n\n+/);
  let buffer = '';

  for (const paragraph of paragraphs) {
    const next = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (next.length <= maxChars) {
      buffer = next;
      continue;
    }

    if (buffer) {
      chunks.push({
        chunkIndex: chunks.length,
        content: buffer,
      });
    }

    let cursor = 0;
    // paragraph.length를 기준으로 잘라야 긴 단일 문단도 끝까지 chunking된다.
    while (cursor < paragraph.length) {
      const content = paragraph.slice(cursor, cursor + maxChars);
      chunks.push({
        chunkIndex: chunks.length,
        content,
      });
      cursor += maxChars - overlapChars;
    }

    buffer = '';
  }

  if (buffer) {
    chunks.push({
      chunkIndex: chunks.length,
      content: buffer,
    });
  }

  return chunks;
}
