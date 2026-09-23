import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  width: number;
  treeVersion: number;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setWidth: (width: number) => void;
  bumpTree: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  width: 260,
  treeVersion: 0,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setWidth: (width) => set({ width: Math.max(200, Math.min(400, width)) }),
  bumpTree: () => set((s) => ({ treeVersion: s.treeVersion + 1 })),
}));
