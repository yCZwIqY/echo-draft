import { useWorkspacePath } from '~/hooks';
import { AiOutlinePlus } from 'react-icons/ai';
import { useModal } from '~/hooks/use-modal';
import DnInput from '~/components/common/inputs/dn-input';
import { useEffect, useState } from 'react';
import DnButton from '~/components/common/buttons/dn-button';
import ChangePath from '~/components/workspace-path/change-path';
import { showToast } from '~/lib/toast-manager';

interface Props {
  targetPath?: string;
}
const AddWorkspaceButton = ({ targetPath }: Props) => {
  const { workspacePath, createNewWorkspace } = useWorkspacePath();
  const [parentGroup, setParentGroup] = useState(targetPath || workspacePath);
  const [groupName, setGroupName] = useState<string>('');

  useEffect(() => {
    setParentGroup(targetPath || workspacePath);
  }, [targetPath, workspacePath]);

  const { portal, isOpen, setIsOpen } = useModal(
    {
      content: (
        <div className={'bg-white p-10 rounded-md shadow-md'}>
          <div className={'typo-b3-b pb-4'}>새 그룹 추가</div>
          <ChangePath
            label={'이 경로 하위에 추가'}
            path={parentGroup}
            setWorkspace={(workspace) => setParentGroup(workspace.path)}
          />
          <div className={'pt-2'}>
            <DnInput
              className={'w-[300px]!'}
              id={'group-name'}
              placeholder={'추가할 그룹 이름을 입력해주세요.'}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className={'flex justify-center pt-4 gap-2'}>
            <DnButton onClick={() => handleCreateWorkspace()}>추가</DnButton>
            <DnButton
              variant={'outlined'}
              onClick={() => setIsOpen(false)}
            >
              취소
            </DnButton>
          </div>
        </div>
      ),
    },
    [parentGroup],
  );

  const handleCreateWorkspace = async () => {
    if (!groupName) {
      showToast('그룹 이름을 입력해주세요.', 'danger');
      return;
    }

    try {
      await createNewWorkspace(parentGroup, groupName);
      setIsOpen(false);
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  return (
    <>
      <button
        className={'bg-black rounded-sm p-0.5 cursor-pointer'}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <AiOutlinePlus
          color={'white'}
          size={16}
        />
      </button>
      {isOpen && portal}
    </>
  );
};

export default AddWorkspaceButton;
