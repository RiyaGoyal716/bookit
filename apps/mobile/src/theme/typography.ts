import { type TextStyle } from 'react-native';

/**
 * NOVA v2 typography tokens.
 *
 * Headings: Bricolage Grotesque 700 / 800.
 * Body / UI: Plus Jakarta Sans 400–800.
 * Prices / times / counts use tabular figures via {@link tabular}.
 *
 * Both the NOVA scale (display/title1/title2/headline/body/callout/footnote/
 * caption/micro) and the legacy names (hero/h1/h2/…) are exported so pre-NOVA
 * screens keep compiling while new screens use the NOVA names. Inter & Sora are
 * removed.
 */
export const font = {
  // Plus Jakarta Sans — body / UI
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  // Bricolage Grotesque — headings
  titleSemibold: 'BricolageGrotesque_700Bold',
  titleBold: 'BricolageGrotesque_800ExtraBold',
  displaySemibold: 'BricolageGrotesque_700Bold',
  displayBold: 'BricolageGrotesque_800ExtraBold',
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
  // NOVA v2 compact scale
  display: {
    fontFamily: font.titleBold,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title1: {
    fontFamily: font.titleBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  title2: {
    fontFamily: font.titleSemibold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headline: {
    fontFamily: font.bold,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  callout: { fontFamily: font.regular, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  footnote: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontFamily: font.medium, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  micro: {
    fontFamily: font.extrabold,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Legacy aliases mapped onto the NOVA v2 scale
  hero: {
    fontFamily: font.titleBold,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: font.titleBold,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  h2: {
    fontFamily: font.titleSemibold,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
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
