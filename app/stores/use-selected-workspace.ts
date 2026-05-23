import { create } from 'zustand';

interface SelectedWorkspace {
  selectedWorkspace?: WorkspaceNode;
  selectedWorkspaceId?: string;
  setSelectedWorkspace: (selectedWorkspace?: WorkspaceNode) => void;
}

export const useSelectedWorkspace = create<SelectedWorkspace>((set) => ({
  setSelectedWorkspace: (selectedWorkspace) =>
    set({
      selectedWorkspace,
      selectedWorkspaceId: selectedWorkspace?.id,
    }),
}));
