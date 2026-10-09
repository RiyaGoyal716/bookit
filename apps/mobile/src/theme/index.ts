import { useColorScheme } from 'react-native';

import { useThemeStore } from '../stores/themeStore';
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

/**
 * Resolve the active scheme from the user's preference and the OS scheme.
 * 'system' follows the OS; 'light'/'dark' force that scheme.
 */
export function useColorSchemeName(): ColorScheme {
  const system = useColorScheme();
  const preference = useThemeStore((s) => s.preference);
  const resolved = preference === 'system' ? system : preference;
  return resolved === 'dark' ? 'dark' : 'light';
}

/** The active colour palette, honouring the user's theme preference. */
export function useColors(): Palette {
  return useColorSchemeName() === 'dark' ? darkColors : lightColors;
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
