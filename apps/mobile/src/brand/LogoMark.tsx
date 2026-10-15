import Svg, { Rect, Circle, Path } from 'react-native-svg';

import { useTokens } from '../theme';

export interface LogoMarkProps {
  /** Rendered square size in px. Default 32. */
  size?: number;
  /** Override the one-colour mark fill. Defaults to the current text colour. */
  color?: string;
  accessibilityLabel?: string;
}

/**
 * NOVA brand mark — a geometric lowercase "b" on a 24-unit grid: a rounded
 * stem + a circular bowl whose counter is cut as a check mark ("booked").
 * One colour, legible down to 16px, works in light and dark.
 */
export function LogoMark({ size = 32, color, accessibilityLabel = 'Bookit' }: LogoMarkProps) {
  const t = useTokens();
  const fill = color ?? t.text;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Stem */}
      <Rect x={4.5} y={2.5} width={3.5} height={19} rx={1.75} fill={fill} />
      {/* Bowl as a ring so the counter stays transparent */}
      <Circle cx={13} cy={15} r={6.2} stroke={fill} strokeWidth={3.5} fill="none" />
      {/* Check cut into the bowl's counter */}
      <Path
        d="M10.3 15.2 L12.3 17.2 L16 13"
        stroke={fill}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
