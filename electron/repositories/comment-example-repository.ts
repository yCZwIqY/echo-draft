import crypto from 'node:crypto';
import type sqlite3 from 'sqlite3';

import { all, run } from '../db/connection.js';

export type CommentExampleGender = 'male' | 'female';

export type CommentExample = {
  id: string;
  content: string;
  tone: string | null;
  ageGroup: number | null;
  gender: CommentExampleGender | null;
  expertiseLevel: number | null;
  genre: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommentExampleInput = {
  content: string;
  tone?: string | null;
  ageGroup?: number | null;
  gender?: CommentExampleGender | null;
  expertiseLevel?: number | null;
  genre?: string | null;
  source?: string | null;
};

export type FindStyleExamplesOptions = {
  startAge: number;
  endAge: number;
  expertise: number;
  limit?: number;
};

const DEFAULT_STYLE_EXAMPLE_LIMIT = 12;

export function createCommentExampleRepository(db: sqlite3.Database) {
  return {
    findAllCommentExamples() {
      return all<CommentExample>(
        db,
        `
          SELECT id, content, tone, ageGroup, gender, expertiseLevel, genre, source, createdAt, updatedAt
          FROM comment_examples
          ORDER BY updatedAt DESC
        `,
      );
    },

    findStyleExamples(options: FindStyleExamplesOptions) {
      const limit = options.limit ?? DEFAULT_STYLE_EXAMPLE_LIMIT;

      return all<CommentExample>(
        db,
        `
          SELECT id, content, tone, ageGroup, gender, expertiseLevel, genre, source, createdAt, updatedAt
          FROM comment_examples
          WHERE
            (ageGroup IS NULL OR ageGroup BETWEEN ? AND ?)
            AND (expertiseLevel IS NULL OR expertiseLevel <= ?)
          ORDER BY RANDOM()
          LIMIT ?
        `,
        [options.startAge, options.endAge, options.expertise, limit],
      );
    },

    async addCommentExample(input: CommentExampleInput) {
      const now = new Date().toISOString();
      const example: CommentExample = {
        id: crypto.randomUUID(),
        content: input.content.trim(),
        tone: normalizeOptionalString(input.tone),
        ageGroup: input.ageGroup ?? null,
        gender: input.gender ?? null,
        expertiseLevel: input.expertiseLevel ?? null,
        genre: normalizeOptionalString(input.genre),
        source: normalizeOptionalString(input.source),
        createdAt: now,
        updatedAt: now,
      };

      if (!example.content) {
        throw new Error('댓글 예시 내용이 비어 있습니다.');
      }

      await run(
        db,
        `
          INSERT INTO comment_examples (
            id, content, tone, ageGroup, gender, expertiseLevel, genre, source, createdAt, updatedAt
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          example.id,
          example.content,
          example.tone,
          example.ageGroup,
          example.gender,
          example.expertiseLevel,
          example.genre,
          example.source,
          example.createdAt,
          example.updatedAt,
        ],
      );

      return example;
    },

    removeCommentExample(id: string) {
      return run(db, 'DELETE FROM comment_examples WHERE id = ?', [id]);
    },
  };
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
