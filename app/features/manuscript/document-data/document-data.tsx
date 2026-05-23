import { useSelectedWorkspace } from '~/stores/use-selected-workspace';

export const DocumentData = () => {
  const selectedWorkspace = useSelectedWorkspace((state) => state.selectedWorkspace);

  return <div></div>;
};
