import { useWorkspacePath } from '~/hooks';
import { useModal } from '~/hooks/use-modal';
import DnInput from '~/components/common/inputs/dn-input';
import { type ReactNode, useEffect, useState } from 'react';
import DnButton from '~/components/common/buttons/dn-button';
import { showToast } from '~/lib/toast-manager';
import { createDocument } from '~/lib/electron-api';
import { AiOutlineFolderOpen } from 'react-icons/ai';
import { CiFileOn } from 'react-icons/ci';

interface Props {
  targetPath?: string;
  children?: ReactNode;
  onCreated?: () => void;
}
const AddWorkspaceButton = ({ targetPath, children, onCreated }: Props) => {
  const { workspacePath, createNewWorkspace } = useWorkspacePath();
  const [parentGroup, setParentGroup] = useState(targetPath || workspacePath);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    setParentGroup(targetPath || workspacePath);
    return () => {
      setName('');
    };
  }, [targetPath, workspacePath]);

  useEffect(() => {
    return () => {
      setName('');
    };
  }, []);

  const { portal, isOpen, setIsOpen } = useModal(
    {
      content: (
        <div
          className={
            'w-[320px] rounded-[28px] bg-stone-50 p-8 text-stone-900 shadow-[0_30px_90px_rgba(15,23,42,0.22)] ring-1 ring-white/70'
          }
        >
          <div className={'flex items-start justify-between gap-4 pb-6'}>
            <div>
              <div className={'typo-b2-b text-stone-900'}>새 문서 혹은 그룹 추가</div>
            </div>
          </div>
          <div className={'text-stone-500 text-xs'}>
            하위에 생성: <br />
            <div className={'truncate'}> {parentGroup}</div>
          </div>
          <div className={'pt-4'}>
            <DnInput
              className={'w-full border-stone-300 bg-white'}
              id={'group-name'}
              placeholder={'이름을 입력해주세요.'}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={'grid grid-cols-2 gap-3 pt-5'}>
            <DnButton
              onClick={() => handleCreateWorkspace()}
              className={
                'flex h-auto! flex-col gap-3 rounded-2xl! px-4 py-5 shadow-[0_18px_40px_rgba(37,99,235,0.18)]'
              }
            >
              <AiOutlineFolderOpen size={30} />새 그룹 추가
            </DnButton>
            <DnButton
              onClick={() => handleCreateDocument()}
              className={
                'flex h-auto! flex-col gap-3 rounded-2xl! border border-stone-300 bg-white px-4 py-5 text-stone-800 shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
              }
              variant={'outlined'}
            >
              <CiFileOn size={30} />새 문서 추가
            </DnButton>
          </div>
        </div>
      ),
    },
    [parentGroup],
  );

  const handleCreateWorkspace = async () => {
    if (!name) {
      showToast('그룹 이름을 입력해주세요.', 'danger');
      return;
    }

    try {
      await createNewWorkspace(parentGroup, name);
      onCreated?.();
      setIsOpen(false);
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  const handleCreateDocument = async () => {
    if (!name) {
      showToast('문서 이름을 입력해주세요.', 'danger');
      return;
    }

    try {
      await createDocument(parentGroup, name);
      onCreated?.();
      setIsOpen(false);
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  return (
    <>
      <button
        className={'cursor-pointer'}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        {children ?? (
          <span
            className={
              'flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-600'
            }
          >
            <AiOutlineFolderOpen size={16} />
          </span>
        )}
      </button>
      {isOpen && portal}
    </>
  );
};

export default AddWorkspaceButton;
