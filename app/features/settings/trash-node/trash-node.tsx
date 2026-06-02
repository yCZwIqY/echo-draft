import { useState } from 'react';
import {
  getTrashItems,
  purgeDocument,
  purgeWorkspace,
  restoreDocument,
  restoreWorkspace,
} from '~/lib/electron';
import TrashList from '~/features/manuscript/workspace-data/trash-list';

const TrashNode = () => {
  const [trashItems, setTrashItems] = useState<WorkspaceNode[]>([]);

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

    await loadTrashItems();
  };

  const handleDeleteItem = async (item: WorkspaceNode) => {
    if (item.type === 'document') {
      await purgeDocument(item.path);
    } else {
      await purgeWorkspace(item.path);
    }

    await loadTrashItems();
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
