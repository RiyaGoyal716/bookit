import Svg, { Rect, Path, Circle, Line, G } from 'react-native-svg';

import { useTokens } from '../../../theme';

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

const SW = 1.75;

/**
 * NOVA category icon — custom duotone line glyph on a soft-accent rounded tile.
 * Stroke 1.75. Reads tokens so it works in light and dark.
 */
export function CategoryIcon({ slug, size = 44 }: CategoryIconProps) {
  const t = useTokens();
  const ink = t.text;
  const accent = t.accent;

  const glyph = (() => {
    const line = {
      stroke: ink,
      strokeWidth: SW,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
      fill: 'none' as const,
    };
    switch (slug) {
      case 'cleaning':
        return (
          <G {...line}>
            <Path d="M10 8 h3 v3 h-3 z" />
            <Path d="M10 11 h3 l1 3 h-5 z" />
            <Rect x={9} y={14} width={6} height={4} rx={1} />
            <Path d="M13 8 l3 -2 M13 10 l3 0" stroke={accent} />
          </G>
        );
      case 'beauty':
      case 'barber':
        return (
          <G {...line}>
            <Circle cx={8} cy={15} r={2.4} />
            <Circle cx={8} cy={9} r={2.4} />
            <Path d="M10 14 L17 7 M10 10 L17 17" stroke={accent} />
          </G>
        );
      case 'tutoring':
        return (
          <G {...line}>
            <Path d="M12 7 L19 10 L12 13 L5 10 Z" />
            <Path d="M8 11.5 V15 c0 1 2 2 4 2 s4 -1 4 -2 v-3.5" stroke={accent} />
          </G>
        );
      case 'handyman':
        return (
          <G {...line}>
            <Path d="M14 6 l4 4 l-2 2 l-4 -4 z" />
            <Path d="M12 10 L6 16 a1.5 1.5 0 0 0 2 2 l6 -6" stroke={accent} />
          </G>
        );
      case 'plumbing':
        return (
          <G {...line}>
            <Path d="M12 6 c3 4 5 6 5 9 a5 5 0 0 1 -10 0 c0 -3 2 -5 5 -9 z" />
            <Path d="M10 15 a2 2 0 0 0 2 2" stroke={accent} />
          </G>
        );
      case 'electrician':
        return (
          <G {...line}>
            <Path d="M13 5 L7 13 h4 l-1 6 l6 -8 h-4 z" fill={accent} stroke={accent} />
          </G>
        );
      case 'moving':
        return (
          <G {...line}>
            <Path d="M6 9 L12 6 L18 9 L12 12 Z" />
            <Path d="M6 9 V16 L12 19 V12" />
            <Path d="M18 9 V16 L12 19" stroke={accent} />
          </G>
        );
      case 'pet-care':
        return (
          <G {...line}>
            <Circle cx={8} cy={9} r={1.6} fill={ink} />
            <Circle cx={12} cy={7.5} r={1.6} fill={ink} />
            <Circle cx={16} cy={9} r={1.6} fill={ink} />
            <Path d="M9 14 c0 -2 2 -3 3 -3 s3 1 3 3 s-1 4 -3 4 s-3 -2 -3 -4 z" stroke={accent} />
          </G>
        );
      case 'gardening':
        return (
          <G {...line}>
            <Path d="M12 18 V10" />
            <Path d="M12 12 c-3 0 -5 -2 -5 -5 c3 0 5 2 5 5 z" stroke={accent} />
            <Path d="M12 11 c3 0 5 -2 5 -5 c-3 0 -5 2 -5 5 z" stroke={accent} />
          </G>
        );
      default:
        return (
          <G {...line}>
            <Circle cx={12} cy={12} r={5} />
            <Line x1={12} y1={9} x2={12} y2={15} stroke={accent} />
            <Line x1={9} y1={12} x2={15} y2={12} stroke={accent} />
          </G>
        );
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityRole="image">
      <Rect x={1} y={1} width={22} height={22} rx={7} fill={t.accentSoft} />
      {glyph}
    </Svg>
  );
}
