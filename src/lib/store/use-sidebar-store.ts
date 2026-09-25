import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  /** Separate from isOpen: the phone drawer must start closed while the desktop rail stays open. */
  mobileNavOpen: boolean;
  width: number;
  treeVersion: number;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setWidth: (width: number) => void;
  bumpTree: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  mobileNavOpen: false,
  // 288px is what the logged-in craft.do rail measures (`elementInfo` bounds), not a guess.
  width: 288,
  treeVersion: 0,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  setWidth: (width) => set({ width: Math.max(200, Math.min(400, width)) }),
  bumpTree: () => set((s) => ({ treeVersion: s.treeVersion + 1 })),
}));
