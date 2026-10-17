import Svg, { Rect, Circle, Path } from 'react-native-svg';

import { useTokens } from '../theme';

export interface LogoMarkProps {
  /** Rendered square size in px. Default 32. */
  size?: number;
  /** Override the stem colour. Defaults to the themed ink (light) / #F4F5F7 (dark). */
  color?: string;
  accessibilityLabel?: string;
}

/**
 * Bookit brand mark — a lowercase "b" whose bowl is a green "booked" check,
 * with a coral notification dot. Stem is ink in light mode, #F4F5F7 in dark.
 * Geometry matches src/assets/brand/mark.svg exactly (48-unit grid).
 */
export function LogoMark({ size = 32, color, accessibilityLabel = 'Bookit' }: LogoMarkProps) {
  const t = useTokens();
  const stem = color ?? t.inverse;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <Rect x={7} y={4} width={11} height={40} rx={5.5} fill={stem} />
      <Circle cx={28.5} cy={29} r={15} fill={t.brandGreen} />
      <Path
        d="M21.6 29.4l4.7 4.7 9.1-9.4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={39.5} cy={8.5} r={4.5} fill={t.coral} />
    </Svg>
  );
}
