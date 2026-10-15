import { useColorScheme } from 'react-native';

import { useThemeStore } from '../stores/themeStore';
import {
  lightColors,
  darkColors,
  colors,
  lightTokens,
  darkTokens,
  type Palette,
  type NovaTokens,
} from './colors';
import { spacing, radius, shadow } from './spacing';
import { typography, font } from './typography';
import { motion } from './motion';

export { lightColors, darkColors, colors, lightTokens, darkTokens } from './colors';
export type { Colors, Palette, NovaTokens } from './colors';
export { spacing, radius, shadow } from './spacing';
export type { Spacing, Radius, Shadow } from './spacing';
export { typography, font, tabular } from './typography';
export type { Typography } from './typography';
export {
  motion,
  duration,
  spring,
  easingPoints,
  getEasing,
  timingConfig,
  listStagger,
} from './motion';
export type { Motion } from './motion';

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

/** The active (legacy, NOVA-repointed) colour palette. */
export function useColors(): Palette {
  return useColorSchemeName() === 'dark' ? darkColors : lightColors;
}

/** The active flat NOVA semantic tokens — preferred for new code. */
export function useTokens(): NovaTokens {
  return useColorSchemeName() === 'dark' ? darkTokens : lightTokens;
}

/** Full active theme: themeable colours + static spacing/radius/typography/motion. */
export function useTheme() {
  const scheme = useColorSchemeName();
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    tokens: scheme === 'dark' ? darkTokens : lightTokens,
    spacing,
    radius,
    shadow,
    typography,
    font,
    motion,
  } as const;
}

/** Composed static theme (light) for non-React consumers. */
export const theme = {
  colors,
  tokens: lightTokens,
  spacing,
  radius,
  shadow,
  typography,
  motion,
} as const;

export type Theme = typeof theme;
