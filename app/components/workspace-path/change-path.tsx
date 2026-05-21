import { Tooltip } from 'jy-headless';
import { selectWorkspacePath } from '~/lib/electron-api';

interface Props {
  label?: string;
  path: string;
  setWorkspace: (path: WorkspaceInfo) => void;
}
const ChangePath = ({ label = '현재경로', path, setWorkspace }: Props) => {
  return (
    <label className={''}>
      <div className={'text-xs pb-1'}>{label}</div>
      <Tooltip
        popover={
          <div className={'shadow text-xs bg-white p-2 translate-x-5 rounded-sm mt-1'}>{path}</div>
        }
        direction={'bottom'}
      >
        <div
          onClick={async () => {
            const result = await selectWorkspacePath();

            if (!result) {
              return null;
            }

            setWorkspace(result);
          }}
          className={'bg-gray-200 text-xs p-2 truncate rounded-md text-gray-500 cursor-default'}
        >
          {path}
        </div>
      </Tooltip>
    </label>
  );
};

export default ChangePath;
