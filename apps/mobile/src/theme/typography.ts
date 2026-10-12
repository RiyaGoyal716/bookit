import { type TextStyle } from 'react-native';

/**
 * Bookit Aurora typography tokens.
 *
 * Sora (loaded via @expo-google-fonts/sora) powers display/headings; Inter
 * (via @expo-google-fonts/inter) powers body text. Both are loaded in the
 * splash gate. Styles reference these families (which encode weight) so the
 * type system is the single source of truth — screens never hard-code sizes.
 */
export const font = {
  // Inter — body
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Sora — display / headings
  displaySemibold: 'Sora_600SemiBold',
  displayBold: 'Sora_700Bold',
} as const;

type Scale = Record<
  'hero' | 'display' | 'h1' | 'h2' | 'body' | 'bodyMedium' | 'small' | 'smallMedium' | 'caption',
  TextStyle
>;

/** Named type scale — spread into styles (e.g. `...typography.scale.h1`). */
const scale: Scale = {
  hero: { fontFamily: font.displayBold, fontSize: 40, lineHeight: 46, fontWeight: '700' },
  display: { fontFamily: font.displayBold, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h1: { fontFamily: font.displayBold, fontSize: 26, lineHeight: 32, fontWeight: '700' },
  h2: { fontFamily: font.displaySemibold, fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontFamily: font.semibold, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  small: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  smallMedium: { fontFamily: font.semibold, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16, fontWeight: '500' },
};

export const typography = {
  font,
  scale,
} as const;

export type Typography = typeof typography;
