import { create } from 'zustand';

interface SelectedWorkspace {
  selectedWorkspace?: WorkspaceNode;
  setSelectedWorkspace: (selectedWorkspace: WorkspaceNode) => void;
}

export const useSelectedWorkspace = create<SelectedWorkspace>((set) => ({
  setSelectedWorkspace: (selectedWorkspace) => set({ selectedWorkspace }),
}));
