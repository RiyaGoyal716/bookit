/**
 * NOVA v2 colour system — bright, colourful, Blinkit-direction.
 *
 * Neutral surfaces (white / near-black). Colour comes from content: category
 * tiles, banners, 3D illustrations and status. Each colour has one job:
 *   ink     — primary actions (Book, ADD, cart bar, Confirm, Pay). In dark mode
 *             actions are white with ink text.
 *   green   — booked / success / live + the logo tick only (never a UI fill)
 *   coral   — offers / discounts / hearts / alerts / "Popular"
 *   sunshine— Bookit Plus / ratings / promo
 *   sky     — links / info / live tracking / verified
 * Category colours live only inside that category's tiles/cards/header
 * (see src/theme/categories.ts). No colour exceeds ~15% of a screen (promo
 * banners excepted). No gradients except the app icon + the Bookit Plus card.
 *
 * The flat semantic tokens (`NovaTokens`) are the single source of truth; the
 * legacy nested `Palette` is derived from them so every `useColors()` consumer
 * keeps compiling while new code reads `useTokens()`.
 *
 * Every essential text/background pair is >= 4.5:1 (see colors.test.ts).
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
  inverse: string;
  onInverse: string;
  primary: string;
  onPrimary: string;
  primaryPressed: string;
  primarySoft: string;
  /** Logo / illustration green only — never a UI fill. */
  brandGreen: string;
  coral: string;
  coralStrong: string;
  coralSoft: string;
  sunshine: string;
  sunshineSoft: string;
  sky: string;
  skySoft: string;
  star: string;
  success: string;
  successSoft: string;
  warning: string;
  danger: string;
  // --- Back-compat aliases (map onto the new palette; kept so legacy screens
  // and tests that read accent/info/overlay keep compiling). ---
  /** Alias of `primary` (green) — legacy accent consumers. */
  accent: string;
  /** Alias of `primarySoft` — legacy soft-accent consumers. */
  accentSoft: string;
  /** Alias of `sky` — legacy info consumers. */
  info: string;
  overlay: string;
}

export const lightTokens: NovaTokens = {
  bg: '#FFFFFF',
  bgSubtle: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  border: '#E8EAEE',
  text: '#111315',
  textMuted: '#4B5058',
  textSubtle: '#6B717A',
  inverse: '#111315',
  onInverse: '#FFFFFF',
  primary: '#111315',
  onPrimary: '#FFFFFF',
  primaryPressed: '#2A2D33',
  primarySoft: '#EBECEF',
  brandGreen: '#12B76A',
  coral: '#FF5A36',
  coralStrong: '#D9381E',
  coralSoft: '#FFEDE8',
  sunshine: '#FFC83D',
  sunshineSoft: '#FFF6D1',
  sky: '#1570EF',
  skySoft: '#E5F0FF',
  star: '#F5A800',
  success: '#0B7F48',
  successSoft: '#E3F7EC',
  warning: '#B54708',
  danger: '#D9381E',
  accent: '#111315',
  accentSoft: '#EBECEF',
  info: '#1570EF',
  overlay: 'rgba(17,19,21,0.45)',
};

export const darkTokens: NovaTokens = {
  bg: '#0E0F11',
  bgSubtle: '#141518',
  surface: '#17191C',
  surfaceRaised: '#202328',
  border: '#2A2D33',
  text: '#F4F5F7',
  textMuted: '#A4A9B1',
  textSubtle: '#8C929B',
  inverse: '#F4F5F7',
  onInverse: '#111315',
  primary: '#F4F5F7',
  onPrimary: '#111315',
  primaryPressed: '#D5D8DD',
  primarySoft: '#202328',
  brandGreen: '#12B76A',
  coral: '#FF7A59',
  coralStrong: '#FF7A59',
  coralSoft: '#2C1A14',
  sunshine: '#FFC83D',
  sunshineSoft: '#2B2610',
  sky: '#5AA9FF',
  skySoft: '#132238',
  star: '#FFC83D',
  success: '#2BD47F',
  successSoft: '#13281D',
  warning: '#F79009',
  danger: '#FF6B5A',
  accent: '#F4F5F7',
  accentSoft: '#202328',
  info: '#5AA9FF',
  overlay: 'rgba(0,0,0,0.62)',
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
      primaryDark: t.primaryPressed,
      primarySoft: t.primarySoft,
      tint: t.primary,
      cyan: t.sky,
      // The one allowed gradient (Bookit Plus hero).
      gradient: dark ? ['#2BD47F', '#12B76A'] : ['#12B76A', '#0B7F48'],
      accent: t.primary,
      accentSoft: t.primarySoft,
      star: t.star,
    },
    text: {
      primary: t.text,
      secondary: t.textMuted,
      muted: t.textSubtle,
      inverse: t.onInverse,
      onBrand: '#FFFFFF',
    },
    background: {
      base: t.bgSubtle,
      surface: t.surface,
      muted: t.bgSubtle,
      elevated: t.surfaceRaised,
    },
    border: t.border,
    skeleton: dark ? '#202328' : '#ECEEF1',
    glass: dark ? 'rgba(23,25,28,0.55)' : 'rgba(255,255,255,0.65)',
    status: {
      success: t.success,
      successSoft: t.successSoft,
      info: t.sky,
      infoSoft: t.skySoft,
      warning: t.warning,
      warningSoft: t.sunshineSoft,
      danger: t.danger,
      dangerSoft: t.coralSoft,
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
