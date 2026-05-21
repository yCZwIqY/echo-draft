import { useState } from 'react';
import { CiFileOn } from 'react-icons/ci';
import { AiOutlineFolder, AiOutlineFolderOpen } from 'react-icons/ai';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import { useNavigate } from 'react-router';

const WorkspaceItem = (fileTreeNode: FileTreeNode) => {
  const { name, path, type, children } = fileTreeNode;
  const navigate = useNavigate();
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);
  const [open, setOpen] = useState(false);
  return (
    <div className={'py-0.5 min-w-[100px]'}>
      <button
        onClick={() => {
          setOpen(!open);
          setSelectedWorkspace(fileTreeNode);
          navigate('manuscript');
        }}
        type={'button'}
        className={`text-sm ${selectedWorkspace?.path === path ? 'bg-primary-100 font-bold text-primary-600' : 'hover:bg-gray-200 active:bg-gray-300'} w-full p-1 px-2 flex items-center gap-2 rounded-md`}
      >
        {type === 'file' ? <CiFileOn /> : open ? <AiOutlineFolderOpen /> : <AiOutlineFolder />}
        <div>{name}</div>
      </button>
      <div className={'flex-1 overflow-hidden ml-4'}>
        {children?.map((item: FileTreeNode) => (
          <WorkspaceItem
            {...item}
            key={item.path}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkspaceItem;
