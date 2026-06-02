import ollama from 'ollama';
import { readDocumentContent } from '../workspace/store.js';
import { findDocumentEmbeddingsByParentPath } from '../embedding/lancedb-store.js';
import type { WorkspaceServiceContext } from '../workspace-service-context.js';

type GenerateCommentsPayload = {
  documentPath: string;
  startAge: number;
  endAge: number;
  expertise: number;
  gender: number;
  count: number;
};

type GeneratedComment = {
  ageGroup: number;
  gender: 'male' | 'female';
  expertiseLevel: number;
  expertiseLabel: string;
  tone: string;
  usedContext: boolean;
  content: string;
};

type GenerateCommentsResult = {
  comments?: GeneratedComment[];
};

const MAX_CONTEXT_CHUNKS = 20;

export function createCommentGenerationActions(context: WorkspaceServiceContext) {
  async function generateComments(payload: GenerateCommentsPayload) {
    const { workspacePath, node } = await context.getStoreNodeByPath(payload.documentPath);

    if (!node || node.type !== 'document') {
      throw new Error('댓글을 생성할 문서를 찾을 수 없습니다.');
    }

    const setting = await context.withWorkspaceRepositories(
      workspacePath,
      async ({ settingInfo }) => settingInfo.findSettingInfo(),
    );

    if (!setting.selectedLLMModel) {
      throw new Error('LLM 모델이 선택되지 않았습니다.');
    }

    const content = await readDocumentContent(workspacePath, node.id);

    // 댓글의 직접 대상이 되는 현재 스크립트.
    const targetScript = [
      content.title,
      content.subTitle,
      content.draft?.content,
      content.manuscript?.content,
    ]
      .filter(Boolean)
      .join('\n\n');

    // 같은 부모 그룹 아래에서 이미 적재된 chunk만 가져온다.
    // 적재된 chunk가 없으면 빈 배열로 진행한다.
    const contextChunks = await findDocumentEmbeddingsByParentPath(
      workspacePath,
      node.parentPath,
      MAX_CONTEXT_CHUNKS,
    );

    const { systemPrompt, userPrompt } = buildCommentPrompt({
      ...payload,
      targetTitle: content.title ?? node.name,
      targetScript,
      contextChunks: contextChunks.filter(
        (chunk) => chunk.documentPath !== payload.documentPath,
      ),
    });

    const response = await ollama.chat({
      model: setting.selectedLLMModel,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      format: 'json',
    });

    const parsed = parseGeneratedComments(response.message.content);

    return parsed.comments;
  }

  function buildCommentPrompt({
    startAge,
    endAge,
    expertise,
    gender,
    count,
    targetTitle,
    targetScript,
    contextChunks,
  }: {
    startAge: number;
    endAge: number;
    expertise: number;
    gender: number;
    count: number;
    targetTitle: string;
    targetScript: string;
    contextChunks: Array<{
      title?: string;
      documentPath?: string;
      content?: string;
    }>;
  }): { systemPrompt: string; userPrompt: string } {
    const contextText =
      contextChunks.length > 0
        ? contextChunks
            .map(
              (chunk, index) => `
  [CONTEXT ${index + 1}]
  문서: ${chunk.title ?? chunk.documentPath ?? 'unknown'}
  내용:
  ${chunk.content ?? ''}
  `,
            )
            .join('\n')
        : '없음';

    const systemPrompt = `
너는 웹소설 플랫폼의 실제 독자 댓글을 생성하는 시스템이다.

절대 규칙:
- 댓글의 직접 대상은 TARGET_SCRIPT뿐이다.
- GROUP_CONTEXT는 세계관, 인물 관계, 앞뒤 흐름을 이해하기 위한 참고 자료로만 사용한다.
- GROUP_CONTEXT에만 있고 TARGET_SCRIPT에 없는 사건, 설정, 반전, 결말을 직접 언급하지 않는다.
- 댓글은 짧고 자연스러운 실제 독자 반응이어야 한다.
- 출력은 반드시 JSON 객체 하나만 반환한다.
- 마크다운, 설명, 코드블록, JSON 밖의 텍스트를 절대 포함하지 않는다.
`;

    const userPrompt = `
독자 조건:
- 연령대: ${startAge}대 ~ ${endAge}대
- 최대 전문성 수치: ${expertise}
- 성비: male ${gender}%, female ${100 - gender}%
- 생성할 댓글 수: ${count}개

필드 규칙:
- ageGroup은 ${startAge}, ${startAge + 10}, ... ${endAge} 중 하나의 숫자만 사용한다.
- gender는 "male" 또는 "female"만 사용한다.
- expertiseLevel은 0, 20, 40, 60, 80, 100 중 하나만 사용한다.
- expertiseLevel은 최대 전문성 수치보다 높으면 안 된다.
- expertiseLabel은 expertiseLevel에 맞춰 사용한다.
  - 0: 입문 독자
  - 20: 가벼운 독자
  - 40: 꾸준한 독자
  - 60: 깊이 읽는 독자
  - 80: 창작 경험자
  - 100: 편집 전문가
- tone은 "몰입", "의문", "추측", "아쉬움", "기대", "캐릭터 반응", "분석" 중 하나만 사용한다.
- usedContext는 GROUP_CONTEXT를 댓글 작성에 참고했으면 true, 아니면 false다.

댓글 작성 규칙:
1. 현재 스크립트 안에 드러난 장면, 대사, 감정, 전개에 반응한다.
2. 다양한 반응을 섞는다.
3. 전문성이 낮을수록 짧고 감정적이며 구어체에 가깝게 쓴다.
4. 전문성이 높을수록 구체적인 장면 판단이나 구성 비판을 조금 더 넣는다.
5. 어린 연령대일수록 단순하고 직관적인 표현을 쓴다.
6. 모든 댓글이 같은 말투가 되지 않게 한다.
7. 비판의 경우, 작가를 공격하는 내용도 허용한다.

TARGET_SCRIPT 제목:
${targetTitle}

TARGET_SCRIPT:
${targetScript}

GROUP_CONTEXT:
${contextText}

반환 형식 예시:
{
  "comments": [
    {
      "ageGroup": 20,
      "gender": "male",
      "expertiseLevel": 20,
      "expertiseLabel": "가벼운 독자",
      "tone": "몰입",
      "usedContext": false,
      "content": "댓글 내용"
    }
  ]
}
`;

    return { systemPrompt, userPrompt };
  }

  function parseGeneratedComments(content: string): { comments: GeneratedComment[] } {
    let parsed: GenerateCommentsResult;

    try {
      parsed = JSON.parse(content) as GenerateCommentsResult;
    } catch {
      throw new Error(`댓글 생성 결과를 JSON으로 해석하지 못했습니다: ${content}`);
    }

    if (!Array.isArray(parsed.comments)) {
      throw new Error(`댓글 생성 결과에 comments 배열이 없습니다: ${content}`);
    }

    return { comments: parsed.comments };
  }

  return {
    generateComments,
  };
}
