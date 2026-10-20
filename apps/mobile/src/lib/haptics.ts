import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '../stores/settingsStore';

/**
 * NOVA haptics map. One semantic entry point per interaction class so haptics
 * stay consistent app-wide. Respects the global switch in Settings
 * (`settingsStore.hapticsEnabled`). Never fire haptics on scroll or keystrokes.
 *
 *   selection  -> chips, tabs, toggles, steppers, pickers, segmented control
 *   light      -> button press, card press
 *   medium     -> add to cart, swipe commit, sheet snap
 *   success    -> booking confirmed, action completed
 *   warning    -> validation / recoverable error
 *   error      -> destructive / blocking error
 */

function enabled(): boolean {
  try {
    return useSettingsStore.getState().hapticsEnabled;
  } catch {
    return true;
  }
}

/** Minimum gap between two haptics so rapid events never buzz-spam (ms). */
export const HAPTIC_MIN_GAP_MS = 60;

let lastFireAt = -Infinity;
/** Injectable clock so the throttle is unit-testable. */
let now = () => Date.now();

/** Test hook: override the clock used by the throttle. */
export function __setHapticClock(fn: () => number): void {
  now = fn;
}

/** Test hook: clear the throttle window. */
export function __resetHapticThrottle(): void {
  lastFireAt = -Infinity;
}

/** True when enough time has passed since the last haptic to fire again. */
export function canFireHaptic(at: number, last: number, gap: number = HAPTIC_MIN_GAP_MS): boolean {
  return at - last >= gap;
}

function run(fn: () => Promise<void> | void) {
  if (!enabled()) return;
  // Throttle: at most one haptic per HAPTIC_MIN_GAP_MS (never during scroll —
  // haptics are only ever fired from discrete handlers, not scroll events).
  const at = now();
  if (!canFireHaptic(at, lastFireAt)) return;
  lastFireAt = at;
  try {
    void fn();
  } catch {
    // Haptics are best-effort; never throw into the UI.
  }
}

export const haptics = {
  /** Discrete choice: chips, tabs, toggles, steppers, pickers, segmented. */
  selection: () => run(() => Haptics.selectionAsync()),
  /** Button / card press. */
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Add to cart, swipe commit, sheet snap. */
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Heavier commit (slide to confirm). */
  heavy: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  /** Confirmed / completed. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Validation / recoverable error. */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  /** Destructive / blocking error. */
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
} as const;

export type HapticsApi = typeof haptics;
