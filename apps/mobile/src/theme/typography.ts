import { type TextStyle } from 'react-native';

/**
 * NOVA typography tokens.
 *
 * Titles: Inter Tight 600/700 with negative tracking (-0.5 to -1).
 * UI text: Inter 400/500/600. Sora is removed.
 * Prices / times / counts use tabular figures via {@link tabular}.
 *
 * Both the NOVA scale (display/title1/title2/headline/body/callout/footnote/
 * caption/micro) and the legacy names (hero/display/h1/h2/body/…) are exported
 * so pre-NOVA screens keep compiling while new screens use the NOVA names.
 */
export const font = {
  // Inter — UI text
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  // Inter Tight — titles (legacy alias names kept)
  titleSemibold: 'InterTight_600SemiBold',
  titleBold: 'InterTight_700Bold',
  displaySemibold: 'InterTight_600SemiBold',
  displayBold: 'InterTight_700Bold',
} as const;

/** Tabular-figure style for prices, times and counts. */
export const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

type NovaName =
  | 'display'
  | 'title1'
  | 'title2'
  | 'headline'
  | 'body'
  | 'callout'
  | 'footnote'
  | 'caption'
  | 'micro';

type LegacyName = 'hero' | 'h1' | 'h2' | 'bodyMedium' | 'small' | 'smallMedium';

type Scale = Record<NovaName | LegacyName, TextStyle>;

const scale: Scale = {
  // NOVA compact scale
  display: {
    fontFamily: font.titleBold,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  title1: {
    fontFamily: font.titleBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  title2: {
    fontFamily: font.titleSemibold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  headline: {
    fontFamily: font.semibold,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  callout: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  footnote: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  micro: { fontFamily: font.medium, fontSize: 11, lineHeight: 14, fontWeight: '500' },

  // Legacy aliases → mapped onto the NOVA scale
  hero: {
    fontFamily: font.titleBold,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1,
  },
  h1: {
    fontFamily: font.titleBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  h2: {
    fontFamily: font.titleSemibold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  bodyMedium: { fontFamily: font.semibold, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  small: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  smallMedium: { fontFamily: font.semibold, fontSize: 14, lineHeight: 20, fontWeight: '600' },
};

export const typography = {
  font,
  tabular,
  scale,
} as const;

export type Typography = typeof typography;
