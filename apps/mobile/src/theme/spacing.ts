/**
 * Spacing scale (8pt grid, base unit 4) for Bookit Aurora.
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Soft elevation presets (iOS shadow + Android elevation). */
export const shadow = {
  soft: {
    shadowColor: '#0B0F19',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: '#0B0F19',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  floating: {
    shadowColor: '#0B0F19',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Coloured glow for the signature indigo FABs / primary CTAs. */
  glow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadow = typeof shadow;
