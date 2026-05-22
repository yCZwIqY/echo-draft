import { useState } from 'react';
import { CiFileOn } from 'react-icons/ci';
import { AiOutlineFolder, AiOutlineFolderOpen, AiOutlinePlus } from 'react-icons/ai';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import { useNavigate } from 'react-router';
import AddWorkspaceButton from '~/components/add-workspace-modal/add-workspace-button';
import { BiUpArrow } from 'react-icons/bi';
import DnIconButton from '~/components/common/buttons/dn-icon-button';

type Props = WorkspaceNode & {};

const SideBarItem = (fileTreeNode: Props) => {
  const { name, path, id, type, children, ...workspaceNode } = fileTreeNode;
  const navigate = useNavigate();
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);
  const [open, setOpen] = useState(false);
  const isSelected = selectedWorkspace?.path === path;
  const hasChildren = type === 'workspace' && (children?.length ?? 0) > 0;

  return (
    <div className={'min-w-fit'}>
      <div
        onClick={() => {
          if (hasChildren) {
            setOpen((prev) => !prev);
          }
          setSelectedWorkspace({
            ...workspaceNode,
            name,
            path,
            type,
            children,
          });
          navigate('manuscript');
        }}
        className={`group flex w-full cursor-pointer items-center rounded-2xl border text-sm transition-all duration-300 gap-3 px-3 py-1 ${isSelected ? 'border-primary-100 bg-primary-50 text-primary-700 border-primary-200' : 'border-transparent text-stone-600 hover:border-stone-200 hover:bg-white/75 hover:text-stone-900'}`}
      >
        <div
          className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
        >
          {type === 'document' ? (
            <CiFileOn className={'text-[16px]'} />
          ) : open ? (
            <AiOutlineFolderOpen className={'text-[18px]'} />
          ) : (
            <AiOutlineFolder className={'text-[18px]'} />
          )}
        </div>
        <div
          className={`flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden transition-all duration-300 max-w-[220px] opacity-100`}
        >
          <div className={'truncate font-medium'}>{name.split('.')[0]}</div>
          {hasChildren && (
            <div
              className={`text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            >
              <BiUpArrow />
            </div>
          )}
        </div>
        {type === 'workspace' && (
          <AddWorkspaceButton targetPath={path}>
            <DnIconButton
              className={'rounded-full'}
              size={'s'}
              variant={'ghost'}
            >
              <AiOutlinePlus />
            </DnIconButton>
          </AddWorkspaceButton>
        )}
      </div>
      <div
        className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${open ? 'mt-1.5 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}
      >
        <div className={'overflow-auto'}>
          <div className={'ml-4 border-l border-stone-200/80 pl-3'}>
            {children?.map((item: WorkspaceNode) => (
              <SideBarItem
                {...item}
                key={item.path}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBarItem;
