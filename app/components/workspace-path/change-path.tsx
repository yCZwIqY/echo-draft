import { Tooltip } from 'jy-headless';
import { selectWorkspacePath } from '~/lib/electron/workspace-api';

interface Props {
  label?: string;
  path: string;
  setWorkspace: (path: WorkspaceInfo) => void;
}
const ChangePath = ({ label = '현재경로', path, setWorkspace }: Props) => {
  return (
    <label className={'m-2'}>
      <div className={'pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400'}>
        {label}
      </div>
      <Tooltip
        popover={
          <div className={'mt-2 rounded-xl bg-stone-950 px-3 py-2 text-xs text-white shadow-xl'}>{path}</div>
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
          className={
            'surface-field cursor-default truncate px-3 py-3 text-sm text-stone-500 transition-colors hover:border-primary-200 hover:bg-primary-50/70'
          }
        >
          {path}
        </div>
      </Tooltip>
    </label>
  );
};

export default ChangePath;
