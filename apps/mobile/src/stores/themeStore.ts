import { create } from 'zustand';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
  /** User's theme preference. 'system' follows the OS setting. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * Theme-preference store (session-only). The theme hooks in `src/theme`
 * resolve this against the OS scheme so a user override wins over the system.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  preference: 'system',
  setPreference: (preference) => set({ preference }),
}));
