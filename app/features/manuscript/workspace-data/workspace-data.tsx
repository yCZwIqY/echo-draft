import { useEffect, useState } from 'react';
import {
  getWorkspaceInfo,
  getWorkspaceTree,
  onWorkspaceTreeChanged,
  updateWorkspaceInfo,
} from '~/lib/electron-api';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import DnButton from '~/components/common/buttons/dn-button';
import AddWorkspaceButton from '~/components/add-workspace-modal/add-workspace-button';
import WorkspaceList from '~/features/manuscript/workspace-data/workspace-list';
import WorkflowSummary from '~/features/manuscript/workspace-data/workflow-summary';
import { WorkspaceBreadcrumb } from '~/features';

const WorkspaceData = () => {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);

  const [workspaceData, setWorkspaceData] = useState<WorkspaceNode | null>(null);
  const [description, setDescription] = useState<string>('');
  const [tree, setTree] = useState<WorkspaceNode[]>([]);

  useEffect(() => {
    (async () => {
      if (selectedWorkspace?.path) {
        const data = await getWorkspaceInfo(selectedWorkspace?.path);
        if (data) {
          setWorkspaceData(data);
          setDescription(data?.description || '');
        }

        let isMounted = true;

        const loadWorkspaceTree = async () => {
          const tree = await getWorkspaceTree(selectedWorkspace?.path);

          if (isMounted) {
            setTree(tree?.[0]?.children ?? []);
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
      } else {
        setTree([]);
      }
    })();
  }, [selectedWorkspace]);

  const handleUpdateDescription = () => {
    if (selectedWorkspace?.path) {
      void updateWorkspaceInfo(selectedWorkspace?.path, {
        description,
      });
    }
  };

  return (
    <div className={'flex flex-col flex-1 p-8'}>
      <WorkspaceBreadcrumb className='mb-4' />
      <WorkflowSummary
        workspaceData={workspaceData}
        onUpdated={(nextWorkspaceData) => {
          setWorkspaceData(nextWorkspaceData);
          setSelectedWorkspace(nextWorkspaceData);
        }}
      />
      {/*<div>*/}
      {/*  <div className={'font-bold text-xl text-gray-700'}>{workspaceData?.name}</div>*/}
      {/*  <div className={'text-xs text-gray-500 pt-2'}>*/}
      {/*    {formatDate(new Date(workspaceData?.createdAt || ''), 'YYYY-MM-DD HH:mm:SS')} 에 생성됨*/}
      {/*  </div>*/}
      {/*</div>*/}
      {/*<div className={'my-10 mx-4'}>*/}
      {/*  <textarea*/}
      {/*    className={'bg-gray-300 w-full rounded-md min-h-20 p-4 resize-none'}*/}
      {/*    value={description}*/}
      {/*    onBlur={handleUpdateDescription}*/}
      {/*    onChange={(e) => setDescription(e.target.value)}*/}
      {/*  />*/}
      {/*</div>*/}
      <div className={'flex justify-end'}>
        <AddWorkspaceButton targetPath={selectedWorkspace?.path}>
          <DnButton>추가하기</DnButton>
        </AddWorkspaceButton>
      </div>
      <WorkspaceList tree={tree} />
      {tree.length}
    </div>
  );
};

export default WorkspaceData;
