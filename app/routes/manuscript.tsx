import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import WorkspaceData from '~/features/manuscript/workspace-data/workspace-data';

const Manuscript = () => {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);

  if (selectedWorkspace?.type === 'directory') return <WorkspaceData />;
  // readFile
  return <div>MainScript</div>;
};

export default Manuscript;