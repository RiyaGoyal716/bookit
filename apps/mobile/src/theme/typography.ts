import { type TextStyle } from 'react-native';

/**
 * Typography tokens for the Bookit app.
 *
 * Inter is loaded via @expo-google-fonts/inter in the root layout. Text styles
 * reference these font families (which encode weight) so the type system is the
 * single source of truth — screens never hard-code font sizes.
 */
export const font = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

type Scale = Record<
  'display' | 'h1' | 'h2' | 'body' | 'bodyMedium' | 'small' | 'smallMedium' | 'caption',
  TextStyle
>;

/** Named type scale — spread into styles (e.g. `...typography.scale.h1`). */
const scale: Scale = {
  display: { fontFamily: font.bold, fontSize: 32, lineHeight: 38, fontWeight: '700' },
  h1: { fontFamily: font.bold, fontSize: 24, lineHeight: 30, fontWeight: '700' },
  h2: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26, fontWeight: '600' },
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
