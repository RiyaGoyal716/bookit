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

function run(fn: () => Promise<void> | void) {
  if (!enabled()) return;
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
