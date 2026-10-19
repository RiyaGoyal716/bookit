import { Fluent3D, type Fluent3DKey } from '../3d';

export interface IllustrationProps {
  /** Rendered square size in px. Default 200. */
  size?: number;
}

/**
 * v3 illustrations — Microsoft Fluent Emoji 3D PNGs (MIT), rendered through
 * expo-image. These replace the earlier hand-drawn SVG line art: every empty /
 * status / onboarding / permission screen uses a 3D illustration. The named
 * exports are kept so existing call-sites don't change; each maps to a Fluent
 * 3D key. Credit: see docs/credits.md and Settings › About › Licences.
 */
function make(name: Fluent3DKey) {
  return function Illustration({ size = 200 }: IllustrationProps) {
    return <Fluent3D name={name} size={size} />;
  };
}

/** "Find trusted pros" — magnifying glass. */
export const IllustrationFindPros = make('magnifying_glass_tilted_left');
/** "Book in seconds" — calendar. */
export const IllustrationBook = make('spiral_calendar');
/** "Pay securely" — lock. */
export const IllustrationPaySecure = make('locked');
/** Location primer — pin. */
export const IllustrationLocation = make('round_pushpin');
/** Notifications primer — bell. */
export const IllustrationNotify = make('bell');
/** Spotlight / celebration — party popper. */
export const IllustrationSpot = make('party_popper');
/** Generic empty state — package. */
export const IllustrationEmpty = make('package');
/** Error state — warning. */
export const IllustrationError = make('warning');
