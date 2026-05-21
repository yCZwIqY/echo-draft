import { useEffect, useState } from 'react';
import { getWorkspaceInfo, updateWorkspaceInfo } from '~/lib/electron-api';
import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import { formatDate } from '../../../../utils/date-utils';

const WorkspaceData = () => {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);

  const [workspaceData, setWorkspaceData] = useState<WorkSpaceData | null>(null);
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    (async () => {
      if (selectedWorkspace?.path) {
        const data = await getWorkspaceInfo(selectedWorkspace?.path);
        if (data) {
          setWorkspaceData(data);
          setDescription(data?.description || '');
        }
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
      <div>
        <div className={'font-bold text-xl text-gray-700'}>{workspaceData?.name}</div>
        <div className={'text-xs text-gray-500 pt-2'}>
          {formatDate(new Date(workspaceData?.createdAt || ''), 'YYYY-MM-DD HH:mm:SS')} 에 생성됨
        </div>
      </div>
      <div className={'my-10 mx-4'}>
        <textarea
          className={'bg-gray-300 w-full rounded-md min-h-20 p-4 resize-none'}
          value={description}
          onBlur={handleUpdateDescription}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );
};

export default WorkspaceData;
