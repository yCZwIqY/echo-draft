import { Tooltip } from 'jy-headless';

import { useWorkspacePath } from '~/hooks';

const WorkspacePath = () => {
  const { changeWorkspacePath, updateWorkspaceRoot, statusText, workspacePath } =
    useWorkspacePath();

  return (
    <label className={''}>
      <div className={'text-xs pb-1'}>현재경로</div>
      <Tooltip
        popover={
          <div className={'shadow text-xs bg-white p-2 translate-x-5 rounded-sm mt-1'}>
            {workspacePath}
          </div>
        }
        direction={'bottom'}
      >
        <div
          onClick={() => {
            changeWorkspacePath().then(updateWorkspaceRoot);
          }}
          className={'bg-gray-200 text-xs p-2 truncate rounded-md text-gray-500 cursor-default'}
        >
          {workspacePath || statusText}
        </div>
      </Tooltip>
    </label>
  );
};

export default WorkspacePath;
