import { create } from 'zustand';

export interface ConsentPrefs {
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
  crashReports: boolean;
}

interface ConsentState extends ConsentPrefs {
  toggle: (key: keyof ConsentPrefs) => void;
}

/** Data-usage consent preferences (session-only). Marketing off by default. */
export const useConsentStore = create<ConsentState>((set) => ({
  analytics: true,
  personalization: true,
  marketing: false,
  crashReports: true,
  toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<ConsentState>),
}));
