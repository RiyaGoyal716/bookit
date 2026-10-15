/**
 * NOVA motion tokens. Every animation uses these and respects
 * `useReducedMotion()` (fall back to a fade / instant).
 *
 * Note: this module stays free of a top-level `react-native-reanimated` import
 * so the theme barrel can be used in plain unit tests. The signature easing is
 * exposed both as its bezier control points and via a lazy `getEasing()` /
 * `timingConfig()` that build the reanimated easing on demand.
 */
export const duration = {
  /** Micro feedback: taps, toggles. */
  fast: 120,
  /** Standard transitions. */
  base: 200,
  /** Larger surfaces, sheets, hero moves. */
  slow: 320,
} as const;

/** Spring presets for reanimated `withSpring`. */
export const spring = {
  snappy: { damping: 20, stiffness: 300, mass: 1 },
  smooth: { damping: 26, stiffness: 180, mass: 1 },
  bouncy: { damping: 12, stiffness: 180, mass: 1 },
} as const;

/** Signature easing curve control points: cubic-bezier(0.2, 0, 0, 1). */
export const easingPoints = [0.2, 0, 0, 1] as const;

/** Lazily build the reanimated Easing function (avoids importing it at module load). */
export function getEasing() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Easing } = require('react-native-reanimated');
  return Easing.bezier(easingPoints[0], easingPoints[1], easingPoints[2], easingPoints[3]);
}

/** Timing config helper for `withTiming`. */
export function timingConfig(d: number = duration.base) {
  return { duration: d, easing: getEasing() };
}

/** Standard staggered list entrance (first load only). */
export const listStagger = {
  /** Per-item delay in ms. */
  step: 40,
  /** Cap on how many items are staggered. */
  max: 8,
} as const;

export const motion = {
  duration,
  spring,
  easingPoints,
  getEasing,
  timingConfig,
  listStagger,
} as const;

export type Motion = typeof motion;
