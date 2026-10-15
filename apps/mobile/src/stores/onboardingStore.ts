import { create } from 'zustand';

interface OnboardingState {
  /** Whether the onboarding carousel has been seen this session. */
  seen: boolean;
  markSeen: () => void;
  /** Category slugs the user said they need help with (personalises Home). */
  needs: string[];
  setNeeds: (needs: string[]) => void;
}

/**
 * Onboarding gate (session-only). The entry route shows the carousel before
 * Welcome until this flag is set. It resets each session, which is acceptable
 * for the demo. Also stores the user's selected needs, used to reorder the
 * Home categories grid so the things they care about come first.
 */
export const useOnboardingStore = create<OnboardingState>((set) => ({
  seen: false,
  markSeen: () => set({ seen: true }),
  needs: [],
  setNeeds: (needs) => set({ needs }),
}));
