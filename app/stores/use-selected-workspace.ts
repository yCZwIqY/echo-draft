import { create } from 'zustand';

interface SelectedWorkspace {
  selectedWorkspace?: FileTreeNode;
  setSelectedWorkspace: (selectedWorkspace: FileTreeNode) => void;
}

export const useSelectedWorkspace = create<SelectedWorkspace>((set) => ({
  setSelectedWorkspace: (selectedWorkspace) => set({ selectedWorkspace }),
}));
