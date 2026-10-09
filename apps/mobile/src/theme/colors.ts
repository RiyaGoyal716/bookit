/**
 * Colour palettes for the Bookit app.
 *
 * Two palettes with an identical shape — `light` and `dark`. Screens and
 * components never import a palette directly; they read the active one through
 * the `useColors()` / `useTheme()` hooks so dark mode switches at runtime with
 * the system setting. All contrasts target WCAG AA (>= 4.5:1) for text.
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
    accent: string;
    accentSoft: string;
    star: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  background: {
    /** App background. */
    base: string;
    /** Raised surfaces: cards, sheets, bars. */
    surface: string;
    /** Subtle fills: inputs, skeletons backing. */
    muted: string;
    elevated: string;
  };
  border: string;
  skeleton: string;
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
    primary: '#0F766E',
    primaryDark: '#115E59',
    primarySoft: '#CCFBF1',
    tint: '#0F766E',
    accent: '#F59E0B',
    accentSoft: '#FEF3C7',
    star: '#F59E0B',
  },
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    muted: '#6B7280',
    inverse: '#FFFFFF',
  },
  background: {
    base: '#FAFAF9',
    surface: '#FFFFFF',
    muted: '#F3F4F6',
    elevated: '#FFFFFF',
  },
  border: '#E5E7EB',
  skeleton: '#E5E7EB',
  status: {
    success: '#16A34A',
    successSoft: '#DCFCE7',
    info: '#2563EB',
    infoSoft: '#DBEAFE',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
  },
  overlay: 'rgba(17,24,39,0.45)',
};

export const darkColors: Palette = {
  brand: {
    primary: '#0F766E',
    primaryDark: '#115E59',
    primarySoft: '#134E4A',
    tint: '#2DD4BF',
    accent: '#FBBF24',
    accentSoft: '#422006',
    star: '#FBBF24',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#CBD5E1',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },
  background: {
    base: '#0B1120',
    surface: '#1A2233',
    muted: '#232B3B',
    elevated: '#1A2233',
  },
  border: '#2B3547',
  skeleton: '#232B3B',
  status: {
    success: '#4ADE80',
    successSoft: '#064E3B',
    info: '#60A5FA',
    infoSoft: '#1E3A5F',
    warning: '#FBBF24',
    warningSoft: '#422006',
    danger: '#F87171',
    dangerSoft: '#450A0A',
  },
  overlay: 'rgba(0,0,0,0.6)',
};

/**
 * Static light palette for module-level / non-React consumers (e.g. defaults
 * and tests). Components should prefer the `useColors()` hook.
 */
export const colors: Palette = lightColors;

export type Colors = Palette;
