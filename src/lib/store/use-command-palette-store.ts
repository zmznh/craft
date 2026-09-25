import { create } from 'zustand';

interface CommandPaletteState {
  isOpen: boolean;
  /** Prefills the input when a link such as /search?tag=work opens the palette. */
  seedQuery: string;
  open: () => void;
  openWith: (query: string) => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  seedQuery: '',
  open: () => set({ isOpen: true, seedQuery: '' }),
  openWith: (query) => set({ isOpen: true, seedQuery: query }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
