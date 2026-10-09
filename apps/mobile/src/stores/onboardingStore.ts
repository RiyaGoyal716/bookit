import { create } from 'zustand';

interface OnboardingState {
  /** Whether the onboarding carousel has been seen this session. */
  seen: boolean;
  markSeen: () => void;
}

/**
 * Onboarding gate (session-only). The entry route shows the carousel before
 * Welcome until this flag is set. It resets each session, which is acceptable
 * for the demo.
 */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  seen: false,
  markSeen: () => set({ seen: true }),
}));
