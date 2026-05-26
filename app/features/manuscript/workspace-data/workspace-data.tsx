import { useEffect, useState } from 'react';
import {
  getTrashItems,
  getWorkspaceInfo,
  getWorkspaceTree,
  onWorkspaceTreeChanged,
  purgeDocument,
  purgeWorkspace,
  restoreDocument,
  restoreWorkspace,
} from '~/lib/electron-api';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import DnButton from '~/components/common/buttons/dn-button';
import AddWorkspaceButton from '~/components/add-workspace-modal/add-workspace-button';
import WorkspaceList from '~/features/manuscript/workspace-data/workspace-list';
import TrashList from '~/features/manuscript/workspace-data/trash-list';
import WorkspaceSummary from '~/features/manuscript/workspace-data/workspace-summary';
import { WorkspaceBreadcrumb } from '~/features';

const WorkspaceData = () => {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);
  const setSelectedWorkspace = useSelectedWorkspace((state) => state.setSelectedWorkspace);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceNode | null>(null);
  const [tree, setTree] = useState<WorkspaceNode[]>([]);
  const [trashItems, setTrashItems] = useState<WorkspaceNode[]>([]);

  const loadWorkspaceTree = async (targetPath?: string) => {
    if (!targetPath) {
      setTree([]);
      return;
    }

    const nextTree = await getWorkspaceTree(targetPath);
    setTree(nextTree?.[0]?.children ?? []);
  };

  const loadTrashItems = async () => {
    const nextTrashItems = await getTrashItems();
    setTrashItems(nextTrashItems);
  };

  const handleRestoreItem = async (item: WorkspaceNode) => {
    if (item.type === 'document') {
      await restoreDocument(item.path);
    } else {
      await restoreWorkspace(item.path);
    }

    await loadWorkspaceTree(selectedWorkspace?.path);
    await loadTrashItems();
  };

  const handleDeleteItem = async (item: WorkspaceNode) => {
    if (item.type === 'document') {
      await purgeDocument(item.path);
    } else {
      await purgeWorkspace(item.path);
    }

    await loadWorkspaceTree(selectedWorkspace?.path);
    await loadTrashItems();
  };

  useEffect(() => {
    if (!selectedWorkspace?.path) {
      setWorkspaceData(null);
      setTree([]);
      return;
    }

    let isMounted = true;

    const syncWorkspaceData = async () => {
      const data = await getWorkspaceInfo(selectedWorkspace.path);

      if (isMounted && data) {
        setWorkspaceData(data);
      }
    };

    const syncWorkspaceTree = async () => {
      const nextTree = await getWorkspaceTree(selectedWorkspace.path);

      if (isMounted) {
        setTree(nextTree?.[0]?.children ?? []);
      }
    };

    void syncWorkspaceData();
    void syncWorkspaceTree();
    void loadTrashItems();

    const unsubscribe = onWorkspaceTreeChanged(() => {
      void syncWorkspaceTree();
      void loadTrashItems();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [selectedWorkspace?.id, selectedWorkspace?.path]);

  return (
    <div className={'flex flex-col flex-1 p-8 gap-4'}>
      <WorkspaceBreadcrumb />
      <WorkspaceSummary
        workspaceData={workspaceData}
        onUpdated={(nextWorkspaceData) => {
          setWorkspaceData(nextWorkspaceData);
          setSelectedWorkspace(nextWorkspaceData);
        }}
      />
      <div className={'flex justify-end'}>
        <AddWorkspaceButton
          onCreated={() => {
            void loadWorkspaceTree(selectedWorkspace?.path);
            void loadTrashItems();
          }}
          targetPath={selectedWorkspace?.path}
        >
          <DnButton>추가하기</DnButton>
        </AddWorkspaceButton>
      </div>
      <WorkspaceList tree={tree} />
      <TrashList
        items={trashItems}
        onDelete={(item) => {
          void handleDeleteItem(item);
        }}
        onRestore={(item) => {
          void handleRestoreItem(item);
        }}
      />
    </div>
  );
};

export default WorkspaceData;
