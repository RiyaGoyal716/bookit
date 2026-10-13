import { create } from 'zustand';

import { track } from '../lib/analytics';

/** Max providers that can be compared side-by-side. */
export const COMPARE_LIMIT = 3;

interface CompareState {
  ids: string[];
  /** Toggle a provider in/out of the comparison (respects the limit). */
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  isFull: () => boolean;
}

/** Session-only "compare providers" selection (up to COMPARE_LIMIT). */
export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],
  toggle: (id) => {
    const { ids } = get();
    if (ids.includes(id)) {
      set({ ids: ids.filter((x) => x !== id) });
      return true;
    }
    if (ids.length >= COMPARE_LIMIT) return false;
    track('compare_add', { providerId: id });
    set({ ids: [...ids, id] });
    return true;
  },
  remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
  clear: () => set({ ids: [] }),
  has: (id) => get().ids.includes(id),
  isFull: () => get().ids.length >= COMPARE_LIMIT,
}));
