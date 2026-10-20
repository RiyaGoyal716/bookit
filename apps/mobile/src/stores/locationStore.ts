import { create } from 'zustand';

import { distanceKm, type ResolvedLocation } from '../features/location/gateMachine';

/**
 * Session-only resolved-location store. The location gate writes the confirmed
 * address (GPS or manual postcode) here; Home's address row, provider
 * distances and ETAs read from it. Cleared on cold start — the gate re-runs on
 * every launch, so there is never a stale location across sessions.
 */
interface LocationState {
  /** The confirmed location for this session, or null until the gate resolves. */
  current: ResolvedLocation | null;
  setLocation: (loc: ResolvedLocation) => void;
  clear: () => void;
  /** Straight-line distance (km) from the confirmed location to a point. */
  distanceTo: (point: { latitude: number; longitude: number }) => number | null;
  /** Rough door-to-door ETA in minutes for a point (mock: 4 min/km + 6 base). */
  etaMinutesTo: (point: { latitude: number; longitude: number }) => number | null;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  current: null,
  setLocation: (loc) => set({ current: loc }),
  clear: () => set({ current: null }),
  distanceTo: (point) => {
    const { current } = get();
    if (!current) return null;
    return distanceKm(current, point);
  },
  etaMinutesTo: (point) => {
    const { current } = get();
    if (!current) return null;
    return Math.max(6, Math.round(6 + distanceKm(current, point) * 4));
  },
}));
