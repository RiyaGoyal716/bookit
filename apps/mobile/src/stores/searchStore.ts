import { create } from 'zustand';

const MAX_RECENT = 6;

interface SearchState {
  recent: string[];
  addRecent: (term: string) => void;
  removeRecent: (term: string) => void;
  clearRecent: () => void;
}

/**
 * Recent-searches store (session-only). Keeps the most recent unique terms,
 * newest first, capped at a small number.
 */
export const useSearchStore = create<SearchState>((set) => ({
  recent: [],
  addRecent: (term: string) =>
    set((state) => {
      const trimmed = term.trim();
      if (trimmed.length < 2) return state;
      const next = [
        trimmed,
        ...state.recent.filter((t) => t.toLowerCase() !== trimmed.toLowerCase()),
      ];
      return { recent: next.slice(0, MAX_RECENT) };
    }),
  removeRecent: (term: string) =>
    set((state) => ({ recent: state.recent.filter((t) => t !== term) })),
  clearRecent: () => set({ recent: [] }),
}));
