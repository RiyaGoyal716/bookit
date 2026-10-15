/**
 * NOVA spacing, radius and elevation.
 *
 * Spacing: 4pt grid (2,4,8,12,16,20,24,32,40). Screen gutter 16, section gap 24.
 * Radius: xs6 / sm10 / md14 / lg20 / pill — nothing above 20 except pills.
 * Elevation: depth comes from hairline borders + layered surfaces; exactly one
 * soft shadow level is kept, for floating elements only.
 *
 * Legacy named keys are preserved (and repointed to NOVA values) so pre-NOVA
 * screens keep compiling.
 */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  /** Default screen horizontal gutter. */
  gutter: 16,
  /** Default gap between page sections. */
  section: 24,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 20,
  pill: 999,
} as const;

/**
 * The single soft shadow level, for floating elements (FAB, floating tab bar,
 * sheets). Everything else uses borders + layered surfaces.
 */
const floatingShadow = {
  shadowColor: '#0A0A0F',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 20,
  elevation: 8,
} as const;

const hairlineShadow = {
  shadowColor: '#0A0A0F',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 1,
} as const;

/** Elevation presets. Legacy keys kept; all collapse to the one soft level. */
export const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  hairline: hairlineShadow,
  soft: hairlineShadow,
  card: hairlineShadow,
  floating: floatingShadow,
  // Aurora coloured glow removed — collapses to the neutral floating shadow.
  glow: floatingShadow,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadow = typeof shadow;
