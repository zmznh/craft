import { create } from 'zustand';

export type SettingsSection =
  | 'published'
  | 'tags'
  | 'space'
  | 'appearance'
  | 'language'
  | 'advanced'
  | 'account'
  | 'subscription'
  | 'team'
  | 'integrations'
  | 'assistant'
  | 'notifications'
  | 'about';

interface SettingsState {
  open: boolean;
  section: SettingsSection;
  openSettings: (section?: SettingsSection) => void;
  close: () => void;
  setSection: (section: SettingsSection) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  open: false,
  section: 'space',
  openSettings: (section) => set((s) => ({ open: true, section: section ?? s.section })),
  close: () => set({ open: false }),
  setSection: (section) => set({ section }),
}));
