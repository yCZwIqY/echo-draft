import DnEditor from '~/components/editor/dn-editor';
import { useEffect, useState } from 'react';
import DnSwitch from '~/components/common/switch/dn-switch';
import type { Option } from '~/components';
import DnButton from '~/components/common/buttons/dn-button';
import { showToast } from '~/lib/toast-manager';
import GenerateComment from '~/features/manuscript/document-content/comments/generate-comment';
import Comments from '~/features/manuscript/document-content/comments/comments';
import { useDocumentContent } from '~/features/manuscript/document-content/hooks';

type Props = {
  workspaceData: WorkspaceNode;
  onUpdated?: (workspaceData: WorkspaceNode) => void;
};

type DocumentTextStatus = {
  charsWithSpaces: number;
  charsWithoutSpaces: number;
};

type ShowType = 'DRAFT' | 'MANUSCRIPT' | 'SPLIT';
const ShowTypeOptions: Option<ShowType>[] = [
  {
    value: 'DRAFT',
    label: '초안만',
  },
  {
    value: 'SPLIT',
    label: '분할보기',
  },
  {
    value: 'MANUSCRIPT',
    label: '원고만',
  },
];

export const DocumentContent = ({ workspaceData, onUpdated }: Props) => {
  const {
    draft,
    setDraft,
    manuscript,
    setManuscript,
    draftStatus,
    setDraftStatus,
    manuscriptStatus,
    setManuscriptStatus,
    resetContent,
    handleUpdate,
  } = useDocumentContent();
  const [showType, setShowType] = useState<ShowType>('SPLIT');

  useEffect(() => {
    resetContent(workspaceData);

    return () => {
      resetContent();
    };
  }, [workspaceData?.document?.manuscript?.content, workspaceData?.document?.draft?.content]);

  const handleSave = async () => {
    const updatedWorkspace = await handleUpdate(workspaceData);
    if (updatedWorkspace) onUpdated?.(updatedWorkspace);
    showToast('저장완료', 'success');
  };

  return (
    <div>
      <div
        className={'h-[90dvh] min-w-0 bg-white rounded-lg p-4 shadow-md my-4 flex flex-col overflow-hidden'}
      >
        <div className={'w-[300px]'}>
          <DnSwitch
            options={ShowTypeOptions}
            value={showType}
            setValue={setShowType}
          />
        </div>
        <div className={'flex flex-1 gap-4 p-4 overflow-hidden'}>
          {showType !== 'MANUSCRIPT' && (
            <>
              <div className={'flex-1 flex-col flex gap-2'}>
                <div className={'grid grid-cols-2 gap-3'}>
                  <div className={'rounded-lg bg-stone-100 px-4 py-3'}>
                    <div className={'text-xs text-stone-400 pb-1'}> 공백 포함 </div>
                    <div className={'text-sm text-stone-700'}>{draftStatus.charsWithSpaces}자</div>
                  </div>
                  <div className={'rounded-lg bg-stone-100 px-4 py-3'}>
                    <div className={'text-xs text-stone-400 pb-1'}> 공백 미포함</div>
                    <div className={'text-sm text-stone-700'}>
                      {draftStatus.charsWithoutSpaces}자
                    </div>
                  </div>
                </div>
                <DnEditor
                  content={draft}
                  setContent={setDraft}
                  setStatus={setDraftStatus}
                />
              </div>
              <div className={'w-px h-full border-r border-neutral-100'} />
            </>
          )}
          {showType !== 'DRAFT' && (
            <div className={'flex-1 flex-col flex gap-2'}>
              <div className={'grid grid-cols-2 gap-3'}>
                <div className={'rounded-lg bg-stone-100 px-4 py-3'}>
                  <div className={'text-xs text-stone-400 pb-1'}> 공백 포함 </div>
                  <div className={'text-sm text-stone-700'}>
                    {manuscriptStatus.charsWithSpaces}자
                  </div>
                </div>
                <div className={'rounded-lg bg-stone-100 px-4 py-3'}>
                  <div className={'text-xs text-stone-400 pb-1'}> 공백 미포함</div>
                  <div className={'text-sm text-stone-700'}>
                    {manuscriptStatus.charsWithoutSpaces}자
                  </div>
                </div>
              </div>
              <DnEditor
                content={manuscript}
                setContent={setManuscript}
                setStatus={setManuscriptStatus}
              />
            </div>
          )}
        </div>
        <DnButton
          className={'w-[120px] self-end'}
          onClick={handleSave}
        >
          저장
        </DnButton>
      </div>
      <div className={'flex flex-col gap-2'}>
        <GenerateComment />
        <Comments />
      </div>
    </div>
  );
};
