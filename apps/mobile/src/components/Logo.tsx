import { Logo as BrandLogo } from '../brand';

export interface LogoProps {
  /** Pixel size of the mark. Default 48. */
  size?: number;
  /** Render the wordmark beside the mark. Default false. */
  withWordmark?: boolean;
  /** Override the mark colour (legacy `square`/`glyph` props map here). */
  square?: string;
  glyph?: string;
}

/**
 * Legacy Logo shim — renders the NOVA brand logo. Kept so existing screens
 * (app-update, invoice, maintenance) pick up the new mark without edits.
 */
export function Logo({ size = 48, withWordmark = false, glyph, square }: LogoProps) {
  return <BrandLogo size={size} withWordmark={withWordmark} color={glyph ?? square} />;
}
