import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { useLocationStore } from '../../stores/locationStore';
import { route } from '../../lib/nav';

/**
 * Foreground location guard. Mounted inside the tab shell. On every return to
 * the foreground it re-checks the GPS permission: if location was revoked and
 * the session has no manually-entered address, it sends the user back to the
 * gate — "revoking brings the gate back on next foreground". A manual postcode
 * address keeps the app usable regardless of GPS permission.
 */
export function useLocationGuard(): void {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const current = useLocationStore.getState().current;
      // A manually-confirmed address is always sufficient.
      if (current?.source === 'manual') return;
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          useLocationStore.getState().clear();
          router.replace(route('/location-gate'));
        }
      } catch {
        // Best-effort; never block the UI on a permission read.
      }
    };
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void check();
    });
    return () => sub.remove();
  }, [router]);
}
