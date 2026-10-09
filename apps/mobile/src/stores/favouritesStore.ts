import { create } from 'zustand';

import { track } from '../lib/analytics';

interface FavouritesState {
  ids: string[];
  isFavourite: (id: string) => boolean;
  toggle: (id: string) => void;
}

/**
 * Favourites store (session-only). Holds the set of favourited provider ids.
 */
export const useFavouritesStore = create<FavouritesState>((set, get) => ({
  ids: [],
  isFavourite: (id: string) => get().ids.includes(id),
  toggle: (id: string) =>
    set((state) => {
      const has = state.ids.includes(id);
      track('favourite_toggle', { providerId: id, favourited: !has });
      return { ids: has ? state.ids.filter((x) => x !== id) : [...state.ids, id] };
    }),
}));
