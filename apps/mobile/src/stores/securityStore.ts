import { create } from 'zustand';

interface SecurityState {
  /** 4-digit PIN (mock, in-memory only). */
  pin: string | null;
  biometricEnabled: boolean;
  setPin: (pin: string) => void;
  clearPin: () => void;
  setBiometric: (enabled: boolean) => void;
  hasPin: () => boolean;
}

/** Mock app-lock security settings (session-only, never persisted). */
export const useSecurityStore = create<SecurityState>((set, get) => ({
  pin: null,
  biometricEnabled: false,
  setPin: (pin) => set({ pin }),
  clearPin: () => set({ pin: null, biometricEnabled: false }),
  setBiometric: (biometricEnabled) => set({ biometricEnabled }),
  hasPin: () => get().pin !== null,
}));
