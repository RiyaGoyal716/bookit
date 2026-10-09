import { useColorScheme } from 'react-native';

import { lightColors, darkColors, colors, type Palette } from './colors';
import { spacing, radius, shadow } from './spacing';
import { typography, font } from './typography';

export { lightColors, darkColors, colors } from './colors';
export type { Colors, Palette } from './colors';
export { spacing, radius, shadow } from './spacing';
export type { Spacing, Radius, Shadow } from './spacing';
export { typography, font } from './typography';
export type { Typography } from './typography';

export type ColorScheme = 'light' | 'dark';

/** The active colour palette, following the system light/dark setting. */
export function useColors(): Palette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}

/** The active colour scheme name. */
export function useColorSchemeName(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

/** Full active theme: themeable colours + static spacing/radius/typography. */
export function useTheme() {
  const scheme = useColorSchemeName();
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    shadow,
    typography,
    font,
  } as const;
}

/** Composed static theme (light) for non-React consumers. */
export const theme = {
  colors,
  spacing,
  radius,
  shadow,
  typography,
} as const;

export type Theme = typeof theme;
