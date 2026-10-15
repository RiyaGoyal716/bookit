import Svg, { Circle, G, Path, Rect, Line } from 'react-native-svg';

import { useTokens } from '../../theme';

export interface IllustrationProps {
  /** Rendered square size in px. Default 200. */
  size?: number;
}

/**
 * NOVA illustrations — minimal single-weight line art. Neutral ink lines, a
 * soft accent wash and one accent highlight. No gradients. Each reads the
 * active tokens so it works in light and dark.
 */
function useArt() {
  const t = useTokens();
  return {
    ink: t.text,
    line: t.textSubtle,
    accent: t.accent,
    accentSoft: t.accentSoft,
    success: t.success,
    danger: t.danger,
  };
}

const SW = 4;

function Frame({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" accessibilityRole="image">
      {children}
    </Svg>
  );
}

/** "Find trusted pros" — card with a search lens. */
export function IllustrationFindPros({ size = 200 }: IllustrationProps) {
  const a = useArt();
  return (
    <Frame size={size}>
      <Circle cx={120} cy={120} r={96} fill={a.accentSoft} />
      <Rect
        x={64}
        y={70}
        width={100}
        height={116}
        rx={18}
        fill="none"
        stroke={a.ink}
        strokeWidth={SW}
      />
      <Circle cx={100} cy={104} r={16} fill="none" stroke={a.line} strokeWidth={SW} />
      <Line
        x1={84}
        y1={140}
        x2={144}
        y2={140}
        stroke={a.line}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <Line
        x1={84}
        y1={158}
        x2={124}
        y2={158}
        stroke={a.line}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <G stroke={a.accent} strokeWidth={SW + 1} fill="none" strokeLinecap="round">
        <Circle cx={158} cy={158} r={26} />
        <Line x1={178} y1={178} x2={198} y2={198} />
      </G>
    </Frame>
  );
}

/** "Book in seconds" — calendar with a check. */
export function IllustrationBook({ size = 200 }: IllustrationProps) {
  const a = useArt();
  return (
    <Frame size={size}>
      <Circle cx={120} cy={120} r={96} fill={a.accentSoft} />
      <Rect
        x={62}
        y={74}
        width={116}
        height={100}
        rx={16}
        fill="none"
        stroke={a.ink}
        strokeWidth={SW}
      />
      <Line x1={62} y1={100} x2={178} y2={100} stroke={a.ink} strokeWidth={SW} />
      <Line
        x1={88}
        y1={64}
        x2={88}
        y2={84}
        stroke={a.line}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <Line
        x1={152}
        y1={64}
        x2={152}
        y2={84}
        stroke={a.line}
        strokeWidth={SW}
        strokeLinecap="round"
      />
      <Path
        d="M100 136 l14 14 l28 -30"
        fill="none"
        stroke={a.accent}
        strokeWidth={SW + 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** "Pay securely" — shield with a tick. */
export function IllustrationPaySecure({ size = 200 }: IllustrationProps) {
  const a = useArt();
  return (
    <Frame size={size}>
      <Circle cx={120} cy={120} r={96} fill={a.accentSoft} />
      <Path
        d="M120 62 l46 18 v42 c0 34 -24 54 -46 66 c-22 -12 -46 -32 -46 -66 V80 Z"
        fill="none"
        stroke={a.ink}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Path
        d="M100 122 l14 14 l28 -30"
        fill="none"
        stroke={a.accent}
        strokeWidth={SW + 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** Location primer — pin with pulse. */
export function IllustrationLocation({ size = 200 }: IllustrationProps) {
  const a = useArt();
  return (
    <Frame size={size}>
      <Circle cx={120} cy={116} r={92} fill={a.accentSoft} />
      <Path
        d="M120 60 c-26 0 -46 20 -46 46 c0 34 46 78 46 78 s46 -44 46 -78 c0 -26 -20 -46 -46 -46 Z"
        fill="none"
        stroke={a.ink}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Circle cx={120} cy={104} r={16} fill="none" stroke={a.accent} strokeWidth={SW} />
    </Frame>
  );
}

/** Notifications primer — bell with an accent badge. */
export function IllustrationNotify({ size = 200 }: IllustrationProps) {
  const a = useArt();
  return (
    <Frame size={size}>
      <Circle cx={120} cy={120} r={92} fill={a.accentSoft} />
      <Path
        d="M120 70 c-20 0 -34 14 -34 36 c0 28 -10 34 -16 42 c-3 4 0 10 6 10 h88 c6 0 9 -6 6 -10 c-6 -8 -16 -14 -16 -42 c0 -22 -14 -36 -34 -36 Z"
        fill="none"
        stroke={a.ink}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Path d="M108 168 a12 12 0 0 0 24 0" fill="none" stroke={a.ink} strokeWidth={SW} />
      <Circle cx={158} cy={78} r={14} fill={a.accent} />
    </Frame>
  );
}

/** Generic empty / success spot — ring with a check. */
export function IllustrationSpot({ size = 160 }: IllustrationProps) {
  const a = useArt();
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" accessibilityRole="image">
      <Circle cx={80} cy={80} r={60} fill={a.accentSoft} />
      <Circle cx={80} cy={80} r={40} fill="none" stroke={a.ink} strokeWidth={SW} />
      <Path
        d="M64 82 l12 12 l24 -28"
        fill="none"
        stroke={a.accent}
        strokeWidth={SW + 1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Empty inbox / list — open box with lines. */
export function IllustrationEmpty({ size = 180 }: IllustrationProps) {
  const a = useArt();
  return (
    <Frame size={size}>
      <Circle cx={120} cy={120} r={92} fill={a.accentSoft} />
      <Path
        d="M72 120 l12 -40 h72 l12 40 v44 a6 6 0 0 1 -6 6 H78 a6 6 0 0 1 -6 -6 Z"
        fill="none"
        stroke={a.ink}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Path d="M72 120 h32 a16 16 0 0 0 32 0 h32" fill="none" stroke={a.ink} strokeWidth={SW} />
    </Frame>
  );
}

/** Error / something went wrong — triangle with a bang. */
export function IllustrationError({ size = 180 }: IllustrationProps) {
  const a = useArt();
  return (
    <Frame size={size}>
      <Circle cx={120} cy={120} r={92} fill={a.accentSoft} />
      <Path
        d="M120 66 l56 96 a8 8 0 0 1 -7 12 H71 a8 8 0 0 1 -7 -12 Z"
        fill="none"
        stroke={a.ink}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Line
        x1={120}
        y1={110}
        x2={120}
        y2={140}
        stroke={a.danger}
        strokeWidth={SW + 1}
        strokeLinecap="round"
      />
      <Circle cx={120} cy={158} r={3.5} fill={a.danger} />
    </Frame>
  );
}
