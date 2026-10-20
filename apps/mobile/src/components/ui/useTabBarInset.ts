import { useCallback, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { makeMutable, withSpring } from 'react-native-reanimated';
import { create } from 'zustand';

import { spring } from '../../theme';
import { haptics } from '../../lib/haptics';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_BOTTOM_GAP,
  TAB_BAR_CONTENT_GAP,
  tabBarInset,
} from './tabBarMetrics';

export { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM_GAP, TAB_BAR_CONTENT_GAP, tabBarInset };

/** Hook form — reads the live safe-area bottom inset. */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return tabBarInset(insets.bottom);
}

/**
 * Shared visibility offset for the floating bar. 0 = shown, TAB_BAR_HEIGHT +
 * gap = fully hidden below the edge. A module singleton so any screen's scroll
 * handler can drive it and the single tab bar can read it.
 */
export const tabBarOffset = makeMutable(0);

/** Show / hide the floating bar (spring). Called from scroll handlers. */
export function setTabBarHidden(hidden: boolean): void {
  tabBarOffset.value = withSpring(
    hidden ? TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_GAP + 24 : 0,
    spring.smooth,
  );
}

/**
 * JS scroll handler that hides the bar on downward scroll and shows it on
 * upward scroll. Returned as a plain `onScroll` prop (scrollEventThrottle 16).
 * Kept off the UI thread intentionally so it also works with FlashList.
 */
export function useTabBarScroll(): {
  onScroll: (e: { nativeEvent: { contentOffset: { y: number } } }) => void;
  onScrollBeginDrag?: () => void;
} {
  const last = useRef(0);
  const onScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    const y = e.nativeEvent.contentOffset.y;
    const dy = y - last.current;
    if (y <= 0) {
      setTabBarHidden(false);
    } else if (dy > 6) {
      setTabBarHidden(true);
    } else if (dy < -6) {
      setTabBarHidden(false);
    }
    last.current = y;
  }, []);
  // Always reveal the bar when a screen mounts/unmounts.
  useEffect(() => {
    setTabBarHidden(false);
    return () => setTabBarHidden(false);
  }, []);
  return { onScroll };
}

/** Registry of per-route "scroll to top" callbacks, keyed by route name. */
interface ScrollTopState {
  callbacks: Record<string, () => void>;
  register: (route: string, fn: () => void) => void;
  unregister: (route: string) => void;
  scrollToTop: (route: string) => void;
}

const useScrollTopStore = create<ScrollTopState>((set, get) => ({
  callbacks: {},
  register: (route, fn) => set((s) => ({ callbacks: { ...s.callbacks, [route]: fn } })),
  unregister: (route) =>
    set((s) => {
      const next = { ...s.callbacks };
      delete next[route];
      return { callbacks: next };
    }),
  scrollToTop: (route) => {
    const fn = get().callbacks[route];
    if (fn) {
      haptics.light();
      fn();
    }
  },
}));

/**
 * Register a screen's "scroll to top" action so re-tapping its active tab
 * scrolls it to the top. Pass the route name (e.g. "index") and a callback.
 */
export function useRegisterScrollTop(route: string, fn: () => void): void {
  const register = useScrollTopStore((s) => s.register);
  const unregister = useScrollTopStore((s) => s.unregister);
  useEffect(() => {
    register(route, fn);
    return () => unregister(route);
  }, [route, fn, register, unregister]);
}

/** Trigger the registered scroll-to-top for a route (used by the tab bar). */
export function scrollTabToTop(route: string): void {
  useScrollTopStore.getState().scrollToTop(route);
}
