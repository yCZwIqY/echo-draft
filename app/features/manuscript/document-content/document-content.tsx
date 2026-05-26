import DnEditor from '~/components/editor/dn-editor';
import { useEffect, useState } from 'react';
import DnSwitch from '~/components/common/switch/dn-switch';
import type { Option } from '~/components';
import DnButton from '~/components/common/buttons/dn-button';
import { showToast } from '~/lib/toast-manager';
import { updateDocument } from '~/lib/electron-api';

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
  const [draft, setDraft] = useState('');
  const [manuscript, setManuscript] = useState('');
  const [draftStatus, setDraftStatus] = useState<DocumentTextStatus>({
    charsWithSpaces: 0,
    charsWithoutSpaces: 0,
  });
  const [manuscriptStatus, setManuscriptStatus] = useState<DocumentTextStatus>({
    charsWithSpaces: 0,
    charsWithoutSpaces: 0,
  });
  const [showType, setShowType] = useState<ShowType>('SPLIT');

  useEffect(() => {
    if (workspaceData) {
      setDraft(workspaceData.document?.draft?.content ?? '');
      setDraftStatus({
        charsWithSpaces: workspaceData.document?.draft?.charsWithSpaces ?? 0,
        charsWithoutSpaces: workspaceData.document?.draft?.charsWithoutSpaces ?? 0,
      });
      setManuscript(workspaceData?.document?.manuscript?.content ?? '');
      setManuscriptStatus({
        charsWithSpaces: workspaceData.document?.manuscript?.charsWithSpaces ?? 0,
        charsWithoutSpaces: workspaceData.document?.manuscript?.charsWithoutSpaces ?? 0,
      });
    }

    return () => {
      setDraft('');
      setManuscript('');
      setDraftStatus({
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
      });
      setManuscriptStatus({
        charsWithSpaces: 0,
        charsWithoutSpaces: 0,
      });
    };
  }, [workspaceData?.document?.manuscript?.content, workspaceData?.document?.draft?.content]);

  const handleSave = async () => {
    if (!workspaceData?.path) {
      return;
    }

    const updatedWorkspace = await updateDocument(workspaceData?.path, {
      ...workspaceData,
      document: {
        ...workspaceData.document,
        draft: {
          ...workspaceData.document?.draft,
          content: draft,
          charsWithSpaces: draftStatus.charsWithSpaces,
          charsWithoutSpaces: draftStatus.charsWithoutSpaces,
          updatedAt: new Date().toISOString(),
          createdAt: workspaceData.document?.draft?.createdAt ?? '',
        },
        manuscript: {
          ...workspaceData.document?.manuscript,
          content: manuscript,
          charsWithSpaces: manuscriptStatus.charsWithSpaces,
          charsWithoutSpaces: manuscriptStatus.charsWithoutSpaces,
          updatedAt: new Date().toISOString(),
          createdAt: workspaceData.document?.manuscript?.createdAt ?? '',
        },
      },
    });
    if (updatedWorkspace) onUpdated?.(updatedWorkspace);

    showToast('저장완료', 'success');
  };

  return (
    <div
      className={'h-[90dvh] bg-white rounded-lg p-4 shadow-md my-4 flex flex-col overflow-hidden'}
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
                  <div className={'text-sm text-stone-700'}>{draftStatus.charsWithoutSpaces}자</div>
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
                <div className={'text-sm text-stone-700'}>{manuscriptStatus.charsWithSpaces}자</div>
              </div>
              <div className={'rounded-lg bg-stone-100 px-4 py-3'}>
                <div className={'text-xs text-stone-400 pb-1'}> 공백 미포함</div>
                <div className={'text-sm text-stone-700'}>{manuscriptStatus.charsWithoutSpaces}자</div>
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
  );
};
