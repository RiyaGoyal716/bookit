import { create } from 'zustand';

interface SettingsState {
  notificationsEnabled: boolean;
  /** Global haptics switch (NOVA). When false, all haptic feedback is silenced. */
  hapticsEnabled: boolean;
  /** Placeholder language label; a real app would localise from this. */
  language: string;
  setNotificationsEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setLanguage: (language: string) => void;
}

/** App settings store (session-only). Theme preference lives in themeStore. */
export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: true,
  hapticsEnabled: true,
  language: 'English (UK)',
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setLanguage: (language) => set({ language }),
}));
