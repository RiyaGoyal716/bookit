import { create } from 'zustand';

/** Coachmark keys shown at most once per session. */
export type CoachmarkKey = 'home' | 'checkout' | 'pro';

interface CoachmarkState {
  seen: Record<string, boolean>;
  markSeen: (key: CoachmarkKey) => void;
  hasSeen: (key: CoachmarkKey) => boolean;
  reset: () => void;
}

/** First-run coachmarks (session-only, once per key). */
export const useCoachmarkStore = create<CoachmarkState>((set, get) => ({
  seen: {},
  markSeen: (key) => set((s) => ({ seen: { ...s.seen, [key]: true } })),
  hasSeen: (key) => get().seen[key] === true,
  reset: () => set({ seen: {} }),
}));
