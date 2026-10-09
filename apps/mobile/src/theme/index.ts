import { colors } from './colors';
import { spacing, radius, shadow } from './spacing';
import { typography } from './typography';

export { colors } from './colors';
export type { Colors } from './colors';
export { spacing, radius, shadow } from './spacing';
export type { Spacing, Radius, Shadow } from './spacing';
export { typography } from './typography';
export type { Typography } from './typography';

/** Composed theme object for convenient single-import access. */
export const theme = {
  colors,
  spacing,
  radius,
  shadow,
  typography,
} as const;

export type Theme = typeof theme;
