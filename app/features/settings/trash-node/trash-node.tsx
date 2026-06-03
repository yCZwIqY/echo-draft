import { useEffect, useState } from 'react';
import {
  getTrashItems,
  purgeDocument,
  purgeWorkspace,
  restoreDocument,
  restoreWorkspace,
} from '~/lib/electron';
import TrashList from '~/features/manuscript/workspace-data/trash-list';
import { showToast } from '~/lib/toast-manager';

const TrashNode = () => {
  const [trashItems, setTrashItems] = useState<WorkspaceNode[]>([]);

  useEffect(() => {
    void loadTrashItems();
  }, []);

  const loadTrashItems = async () => {
    try {
      const nextTrashItems = await getTrashItems();
      setTrashItems(nextTrashItems);
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  const handleRestoreItem = async (item: WorkspaceNode) => {
    try {
      if (item.type === 'document') {
        await restoreDocument(item.path);
      } else {
        await restoreWorkspace(item.path);
      }

      await loadTrashItems();
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  const handleDeleteItem = async (item: WorkspaceNode) => {
    try {
      if (item.type === 'document') {
        await purgeDocument(item.path);
      } else {
        await purgeWorkspace(item.path);
      }

      await loadTrashItems();
    } catch (error) {
      showToast((error as Error).message, 'danger');
    }
  };

  return (
    <div>
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

export default TrashNode;
