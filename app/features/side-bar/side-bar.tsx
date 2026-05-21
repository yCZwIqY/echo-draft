import { Link } from 'react-router';
import ChangePath from '~/components/workspace-path/change-path';
import AddWorkspaceButton from '~/components/add-group-modal/add-workspace-button';
import { useWorkspacePath } from '~/hooks';
import { useEffect, useState } from 'react';
import { getWorkspaceTree, onWorkspaceTreeChanged } from '~/lib/electron-api';
import WorkspaceItem from '~/features/side-bar/workspace-item';

const SideBar = () => {
  const { updateWorkspaceRoot, workspacePath } = useWorkspacePath();
  const [workspaceTree, setWorkspaceTree] = useState<FileTreeNode[]>([]);

  useEffect(() => {
    if (!workspacePath) {
      setWorkspaceTree([]);
      return;
    }

    let isMounted = true;

    const loadWorkspaceTree = async () => {
      const tree = await getWorkspaceTree();

      if (isMounted) {
        setWorkspaceTree(tree ?? []);
      }
    };

    void loadWorkspaceTree();

    const unsubscribe = onWorkspaceTreeChanged(() => {
      void loadWorkspaceTree();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [workspacePath]);

  return (
    <aside className={'w-[248px] h-dvh bg-gray-100 p-6 flex flex-col gap-3'}>
      <div>Draft Novel</div>
      <Link to={'/'}>홈</Link>
      <div>
        <ChangePath
          path={workspacePath}
          setWorkspace={updateWorkspaceRoot}
        />
      </div>
      <div>
        <div className={'flex justify-between items-center cursor-default py-2'}>
          <div className={'font-bold text-gray-700 text-sm'}>워크스페이스</div>
          <AddWorkspaceButton targetPath={workspacePath} />
        </div>
        <div className={'py-1 overflow-auto'}>
          {workspaceTree.map((workspace) => (
            <WorkspaceItem
              {...workspace}
              key={workspace.path}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
