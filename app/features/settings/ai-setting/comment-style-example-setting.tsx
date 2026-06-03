import { useEffect, useState } from 'react';

import ConfirmModalWrapper from '~/components/confirm-modal/confirm-modal-wrapper';
import DnButton from '~/components/common/buttons/dn-button';
import {
  addCommentExample,
  listCommentExamples,
  removeCommentExample,
} from '~/lib/electron/comment-api';

const EXPERTISE_LABEL: Record<number, string> = {
  0: '처음 읽는 독자',
  20: '가볍게 즐기는 독자',
  40: '자주 읽는 독자',
  60: '꼼꼼히 읽는 독자',
  80: '글을 써본 독자',
  100: '편집/비평 경험자',
};

const AGE_GROUPS = [10, 20, 30, 40, 50, 60, 70, 80];
const EXPERTISE_LEVELS = [0, 20, 40, 60, 80, 100];

const CommentStyleExampleSetting = () => {
  const [commentExamples, setCommentExamples] = useState<CommentExample[]>([]);
  const [commentExampleContent, setCommentExampleContent] = useState('');
  const [commentExampleTone, setCommentExampleTone] = useState('');
  const [commentExampleAgeGroup, setCommentExampleAgeGroup] = useState('');
  const [commentExampleExpertise, setCommentExampleExpertise] = useState('');
  const [isSavingCommentExample, setIsSavingCommentExample] = useState(false);
  const [removingExampleId, setRemovingExampleId] = useState<string | null>(null);

  useEffect(() => {
    void loadCommentExamples();
  }, []);

  const loadCommentExamples = async () => {
    const examples = await listCommentExamples();
    setCommentExamples(examples);
  };

  const handleAddCommentExample = async () => {
    const content = commentExampleContent.trim();

    if (!content) {
      return;
    }

    setIsSavingCommentExample(true);

    try {
      await addCommentExample({
        content,
        tone: commentExampleTone || null,
        ageGroup: commentExampleAgeGroup ? Number(commentExampleAgeGroup) : null,
        expertiseLevel: commentExampleExpertise ? Number(commentExampleExpertise) : null,
      });
      setCommentExampleContent('');
      await loadCommentExamples();
    } finally {
      setIsSavingCommentExample(false);
    }
  };

  const handleRemoveCommentExample = async (id: string) => {
    setRemovingExampleId(id);

    try {
      await removeCommentExample(id);
      await loadCommentExamples();
    } finally {
      setRemovingExampleId(null);
    }
  };

  return (
    <section className={'w-full rounded-lg bg-white shadow-md'}>
      <div
        className={'flex items-start justify-between gap-4 border-b border-neutral-200 px-4 py-3'}
      >
        <div>
          <div className={'text-sm font-bold text-neutral-600'}>댓글 스타일 예시</div>
          <p className={'mt-1 text-xs text-neutral-400'}>
            실제 독자 댓글을 저장하면 댓글 생성 시 문체 예시로 참고합니다.
          </p>
        </div>
        <div className={'text-xs text-neutral-400'}>{commentExamples.length}개</div>
      </div>

      <div className={'grid gap-2 px-4 py-4'}>
        <textarea
          className={
            'min-h-20 w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400'
          }
          onChange={(event) => setCommentExampleContent(event.target.value)}
          placeholder='예: 아 여기서 끊는 건 진짜 너무하네'
          value={commentExampleContent}
        />
        <div className={'grid grid-cols-3 gap-2'}>
          <select
            className={
              'rounded-md border border-neutral-200 bg-white px-2 py-2 text-xs outline-none'
            }
            onChange={(event) => setCommentExampleAgeGroup(event.target.value)}
            value={commentExampleAgeGroup}
          >
            <option value=''>나이대 전체</option>
            {AGE_GROUPS.map((ageGroup) => (
              <option
                key={ageGroup}
                value={ageGroup}
              >
                {ageGroup}대
              </option>
            ))}
          </select>
          <select
            className={
              'rounded-md border border-neutral-200 bg-white px-2 py-2 text-xs outline-none'
            }
            onChange={(event) => setCommentExampleExpertise(event.target.value)}
            value={commentExampleExpertise}
          >
            <option value=''>전문성 전체</option>
            {EXPERTISE_LEVELS.map((expertise) => (
              <option
                key={expertise}
                value={expertise}
              >
                {EXPERTISE_LABEL[expertise]}
              </option>
            ))}
          </select>
          <input
            className={
              'rounded-md border border-neutral-200 bg-white px-2 py-2 text-xs outline-none'
            }
            onChange={(event) => setCommentExampleTone(event.target.value)}
            placeholder='톤 예) 공감, 의문'
            value={commentExampleTone}
          />
        </div>
        <div className={'flex justify-end'}>
          <DnButton
            loading={isSavingCommentExample}
            onClick={handleAddCommentExample}
            variant='outlined'
          >
            예시 저장
          </DnButton>
        </div>
      </div>

      <div className={'overflow-x-auto p-3'}>
        <table className={'w-full min-w-[760px]'}>
          <colgroup>
            <col className={'w-[52px]'} />
            <col className={'w-[44%]'} />
            <col className={'w-[10%]'} />
            <col className={'w-[14%]'} />
            <col className={'w-[10%]'} />
            <col className={'w-[52px]'} />
          </colgroup>
          <thead className={'border-b border-neutral-200'}>
            <tr className={'h-12 text-sm'}>
              <th>No.</th>
              <th>댓글 예시</th>
              <th>나이대</th>
              <th>전문성</th>
              <th>톤</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {commentExamples.length === 0 && (
              <tr>
                <td
                  className={'p-4 text-center text-sm text-neutral-500'}
                  colSpan={6}
                >
                  저장된 댓글 스타일 예시가 없습니다.
                </td>
              </tr>
            )}
            {commentExamples.map((example, index) => (
              <tr
                className={'border-b border-neutral-100 hover:bg-primary-100/10'}
                key={example.id}
              >
                <td className={'p-2 text-center font-bold text-neutral-500'}>
                  {(index + 1).toLocaleString()}
                </td>
                <td className={'px-2 py-4 text-sm text-neutral-700'}>
                  <div className={'line-clamp-3 whitespace-pre-line break-words'}>
                    {example.content}
                  </div>
                </td>
                <td className={'text-center text-sm text-neutral-500'}>
                  {example.ageGroup ? `${example.ageGroup}대` : '전체'}
                </td>
                <td className={'text-center text-sm text-neutral-500'}>
                  {formatExpertise(example.expertiseLevel)}
                </td>
                <td className={'text-center text-sm text-neutral-500'}>{example.tone ?? '-'}</td>
                <td>
                  <div className={'flex justify-center'}>
                    <ConfirmModalWrapper
                      confirmLabel={'삭제'}
                      confirmVariant={'red'}
                      description={
                        <div className={'py-10 text-center'}>
                          <span className={'font-bold text-primary-500'}>댓글 스타일 예시</span>
                          를
                          <br />
                          삭제하시겠습니까?
                        </div>
                      }
                      onConfirm={() => void handleRemoveCommentExample(example.id)}
                    >
                      <button
                        className={
                          'text-xs text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-neutral-300'
                        }
                        disabled={removingExampleId === example.id}
                        type='button'
                      >
                        삭제
                      </button>
                    </ConfirmModalWrapper>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

function formatExpertise(expertiseLevel: number | null) {
  if (expertiseLevel === null) {
    return '전체';
  }

  return EXPERTISE_LABEL[expertiseLevel] ?? `전문성 ${expertiseLevel}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default CommentStyleExampleSetting;
