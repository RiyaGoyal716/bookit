/**
 * Bookit Aurora colour palettes.
 *
 * Two palettes with an identical shape — `light` and `dark`. Screens and
 * components never import a palette directly; they read the active one through
 * the `useColors()` / `useTheme()` hooks so dark mode switches at runtime with
 * the system setting. Dark mode is a *bespoke* ink palette, not an inversion.
 *
 * Aurora language: electric indigo (#4F46E5) with a gradient to cyan (#06B6D4),
 * dark ink (#0B0F19), paper (#F7F7FB), coral accent (#FF6B6B), green success
 * (#22C55E). All text contrasts target WCAG AA (>= 4.5:1).
 */

export interface Palette {
  brand: {
    /** Solid fill (buttons, active chips). White text sits on this. */
    primary: string;
    primaryDark: string;
    /** Soft tinted surface (icon chips, selected rows). */
    primarySoft: string;
    /** Accent used for text/icons on the app background. */
    tint: string;
    /** Cyan end of the signature gradient. */
    cyan: string;
    /** Signature Aurora gradient [indigo, cyan]. */
    gradient: readonly [string, string];
    /** Coral accent (deals, highlights). */
    accent: string;
    accentSoft: string;
    star: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
    /** Legible text sitting on the gradient / primary fill. */
    onBrand: string;
  };
  background: {
    /** App background (paper / ink). */
    base: string;
    /** Raised surfaces: cards, sheets, bars. */
    surface: string;
    /** Subtle fills: inputs, skeletons backing. */
    muted: string;
    elevated: string;
  };
  border: string;
  skeleton: string;
  /** Tint for glass / blur surfaces over the gradient. */
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
}

export const lightColors: Palette = {
  brand: {
    primary: '#4F46E5',
    primaryDark: '#4338CA',
    primarySoft: '#EEF0FF',
    tint: '#4F46E5',
    cyan: '#06B6D4',
    gradient: ['#4F46E5', '#06B6D4'],
    accent: '#FF6B6B',
    accentSoft: '#FFE8E8',
    star: '#F59E0B',
  },
  text: {
    primary: '#0B0F19',
    secondary: '#475569',
    muted: '#64748B',
    inverse: '#FFFFFF',
    onBrand: '#FFFFFF',
  },
  background: {
    base: '#F7F7FB',
    surface: '#FFFFFF',
    muted: '#EEF0F6',
    elevated: '#FFFFFF',
  },
  border: '#E6E8F0',
  skeleton: '#E6E8F0',
  glass: 'rgba(255,255,255,0.14)',
  status: {
    success: '#16A34A',
    successSoft: '#DCFCE7',
    info: '#2563EB',
    infoSoft: '#E0E7FF',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
  },
  overlay: 'rgba(11,15,25,0.5)',
};

export const darkColors: Palette = {
  brand: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primarySoft: '#1E1B4B',
    tint: '#818CF8',
    cyan: '#22D3EE',
    gradient: ['#6366F1', '#22D3EE'],
    accent: '#FF8787',
    accentSoft: '#3A1D1D',
    star: '#FBBF24',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#CBD5E1',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
    onBrand: '#FFFFFF',
  },
  background: {
    base: '#0B0F19',
    surface: '#141A29',
    muted: '#1E2435',
    elevated: '#1A2133',
  },
  border: '#272E42',
  skeleton: '#1E2435',
  glass: 'rgba(20,26,41,0.4)',
  status: {
    success: '#4ADE80',
    successSoft: '#0F3D27',
    info: '#818CF8',
    infoSoft: '#1E2550',
    warning: '#FBBF24',
    warningSoft: '#3A2E0A',
    danger: '#F87171',
    dangerSoft: '#3B1414',
  },
  overlay: 'rgba(0,0,0,0.65)',
};

/**
 * Static light palette for module-level / non-React consumers (e.g. defaults
 * and tests). Components should prefer the `useColors()` hook.
 */
export const colors: Palette = lightColors;

export type Colors = Palette;
