import { useSelectedWorkspace } from '~/stores/use-selected-workspace';
import WorkspaceData from '~/features/manuscript/workspace-data/workspace-data';
import { DocumentData } from '~/features/manuscript/document-data/document-data';

const Manuscript = () => {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);

  if (selectedWorkspace?.type === 'workspace') return <WorkspaceData />;
  return <DocumentData />;
};

export default Manuscript;