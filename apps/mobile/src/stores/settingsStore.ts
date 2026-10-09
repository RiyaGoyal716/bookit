import { create } from 'zustand';

interface SettingsState {
  notificationsEnabled: boolean;
  /** Placeholder language label; a real app would localise from this. */
  language: string;
  setNotificationsEnabled: (value: boolean) => void;
  setLanguage: (language: string) => void;
}

/** App settings store (session-only). Theme preference lives in themeStore. */
export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: true,
  language: 'English (UK)',
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setLanguage: (language) => set({ language }),
}));
