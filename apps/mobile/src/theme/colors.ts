/**
 * NOVA colour system.
 *
 * Content-first, neutral surfaces, ONE accent colour. Depth comes from layering
 * (hairline borders + raised surfaces), not shadows. Gradients are reserved for
 * two hero moments only (app icon, Bookit Plus).
 *
 * The flat semantic tokens below (`NovaTokens`) are the single source of truth.
 * New code reads them through `useTokens()`. The legacy nested `Palette` (used by
 * the pre-NOVA screens) is *derived* from the same tokens, so the whole app
 * re-skins to NOVA at once while existing `useColors()` consumers keep compiling.
 *
 * Every essential text/background pair is >= 4.5:1 (see colors.test.ts). Status
 * and `textSubtle` colours meet the 3:1 non-text / graphical threshold.
 */

/** Flat NOVA semantic tokens — the single source of truth. */
export interface NovaTokens {
  bg: string;
  bgSubtle: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  overlay: string;
}

export const lightTokens: NovaTokens = {
  bg: '#FFFFFF',
  bgSubtle: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  border: 'rgba(10,10,20,0.08)',
  text: '#0A0A0F',
  textMuted: '#5E5E6A',
  textSubtle: '#9898A3',
  primary: '#0A0A0F',
  onPrimary: '#FFFFFF',
  accent: '#6D5BFF',
  accentSoft: '#6D5BFF14',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#1D4ED8',
  overlay: 'rgba(10,10,20,0.40)',
};

export const darkTokens: NovaTokens = {
  bg: '#09090B',
  bgSubtle: '#111114',
  surface: '#141418',
  surfaceRaised: '#1C1C22',
  border: 'rgba(255,255,255,0.08)',
  text: '#F5F5F7',
  textMuted: '#A1A1AA',
  textSubtle: '#71717A',
  primary: '#FFFFFF',
  onPrimary: '#0A0A0F',
  accent: '#8B7DFF',
  accentSoft: '#8B7DFF1F',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#F87171',
  info: '#60A5FA',
  overlay: 'rgba(0,0,0,0.60)',
};

/**
 * Legacy nested palette shape consumed by pre-NOVA screens. Values are derived
 * from {@link NovaTokens} so there is one source of truth.
 */
export interface Palette {
  brand: {
    primary: string;
    primaryDark: string;
    primarySoft: string;
    tint: string;
    cyan: string;
    gradient: readonly [string, string];
    accent: string;
    accentSoft: string;
    star: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    onBrand: string;
  };
  background: {
    base: string;
    surface: string;
    muted: string;
    elevated: string;
  };
  border: string;
  skeleton: string;
  glass: string;
  status: {
    success: string;
    successSoft: string;
    info: string;
    infoSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
  };
  overlay: string;
  /** Flat NOVA tokens, also exposed here so `useColors()` consumers can migrate. */
  nova: NovaTokens;
}

function paletteFrom(t: NovaTokens, scheme: 'light' | 'dark'): Palette {
  const dark = scheme === 'dark';
  return {
    brand: {
      primary: t.primary,
      primaryDark: dark ? '#E5E5EA' : '#000000',
      primarySoft: t.accentSoft,
      tint: t.accent,
      cyan: t.accent,
      // Single soft accent gradient, used only for the Bookit Plus hero.
      gradient: dark ? ['#8B7DFF', '#A99DFF'] : ['#6D5BFF', '#8B7DFF'],
      accent: t.accent,
      accentSoft: t.accentSoft,
      star: t.warning,
    },
    text: {
      primary: t.text,
      secondary: t.textMuted,
      // readable secondary (>= 4.5:1); `textSubtle` is reserved for the flat token.
      muted: dark ? '#9A9AA3' : '#6B6B76',
      inverse: t.onPrimary,
      onBrand: '#FFFFFF',
    },
    background: {
      base: t.bgSubtle,
      surface: t.surface,
      muted: dark ? '#1C1C22' : '#EFEFF2',
      elevated: t.surfaceRaised,
    },
    border: t.border,
    skeleton: dark ? '#1C1C22' : '#ECECEF',
    glass: dark ? 'rgba(20,20,24,0.55)' : 'rgba(255,255,255,0.65)',
    status: {
      success: t.success,
      successSoft: dark ? '#13311F' : '#E7F6EC',
      info: t.info,
      infoSoft: dark ? '#152339' : '#E7EEFC',
      warning: t.warning,
      warningSoft: dark ? '#3A2A0B' : '#FBEFD9',
      danger: t.danger,
      dangerSoft: dark ? '#3A1618' : '#FBE7E7',
    },
    overlay: t.overlay,
    nova: t,
  };
}

export const lightColors: Palette = paletteFrom(lightTokens, 'light');
export const darkColors: Palette = paletteFrom(darkTokens, 'dark');

/** Static light palette for module-level / non-React consumers. */
export const colors: Palette = lightColors;

export type Colors = Palette;
