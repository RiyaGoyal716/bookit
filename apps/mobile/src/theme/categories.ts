/**
 * NOVA v2 category colour + illustration map.
 *
 * Each category owns a soft tint (light / dark) and a Fluent 3D emoji key
 * (resolved by src/assets/3d). These colours appear ONLY inside that category's
 * tiles, service-card image backgrounds and the Home header band — never as a
 * general UI accent. This is the one place purple is allowed (Wellness).
 *
 * Keys cover the live category slugs plus the common sub-category slugs used by
 * the Category page's left rail. `categoryStyle(slug)` always returns a value.
 */

export interface CategoryStyle {
  /** Soft background tint in light mode. */
  tint: string;
  /** Soft background tint in dark mode. */
  tintDark: string;
  /** Fluent 3D emoji key (see src/assets/3d). */
  art: string;
}

const MAP: Record<string, CategoryStyle> = {
  cleaning: { tint: '#E3F7EC', tintDark: '#13281D', art: 'sponge' },
  'deep-clean': { tint: '#E5F0FF', tintDark: '#132238', art: 'bucket' },
  beauty: { tint: '#FFE8F1', tintDark: '#2D1720', art: 'lipstick' },
  salon: { tint: '#FFF1DC', tintDark: '#2D2112', art: 'barber_pole' },
  barber: { tint: '#FFF1DC', tintDark: '#2D2112', art: 'barber_pole' },
  tutoring: { tint: '#E5F0FF', tintDark: '#132238', art: 'books' },
  handyman: { tint: '#FFEAE3', tintDark: '#2E1914', art: 'hammer_and_wrench' },
  plumbing: { tint: '#DFF6F4', tintDark: '#102826', art: 'plunger' },
  electrician: { tint: '#FFF6D1', tintDark: '#2B2610', art: 'high_voltage' },
  moving: { tint: '#EEF8DA', tintDark: '#1E2812', art: 'delivery_truck' },
  'pet-care': { tint: '#FFEFE4', tintDark: '#2C1E15', art: 'dog_face' },
  gardening: { tint: '#E6F6E0', tintDark: '#16261A', art: 'potted_plant' },
  wellness: { tint: '#F0EBFF', tintDark: '#211B33', art: 'lotion_bottle' },
};

/** The neutral "All" band tint (used by the Home header when no tab is active). */
export const ALL_TINT = { tint: '#E3F7EC', tintDark: '#13281D' } as const;

const FALLBACK: CategoryStyle = { tint: '#E3F7EC', tintDark: '#13281D', art: 'house' };

/** Resolve a category's colour + art. Always returns a value. */
export function categoryStyle(slug: string): CategoryStyle {
  return MAP[slug] ?? FALLBACK;
}

/** Resolve just the tint for the active scheme. */
export function categoryTint(slug: string, scheme: 'light' | 'dark'): string {
  const s = categoryStyle(slug);
  return scheme === 'dark' ? s.tintDark : s.tint;
}

export type CategoryKey = keyof typeof MAP;
