import { categoryStyle } from '../../../theme';
import { Fluent3D, type Fluent3DKey } from '../../3d';

export type CategorySlug =
  | 'cleaning'
  | 'beauty'
  | 'barber'
  | 'tutoring'
  | 'handyman'
  | 'plumbing'
  | 'electrician'
  | 'moving'
  | 'pet-care'
  | 'gardening';

export interface CategoryIconProps {
  slug: string;
  /** Rendered square size in px. Default 44. */
  size?: number;
}

/**
 * Category illustration — a Microsoft Fluent Emoji 3D PNG (MIT) chosen per
 * category in src/theme/categories.ts and rendered through expo-image. There
 * are no hand-drawn SVG glyphs in v3; colour comes from the category tint the
 * tile sits on. UI glyphs use <Icon> (Phosphor) instead.
 */
export function CategoryIcon({ slug, size = 44 }: CategoryIconProps) {
  const art = categoryStyle(slug).art as Fluent3DKey;
  return <Fluent3D name={art} size={size} />;
}
