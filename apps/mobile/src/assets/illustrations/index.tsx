import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Ellipse } from 'react-native-svg';

import { useColors } from '../../theme';

export interface IllustrationProps {
  /** Rendered square size in px. Default 220. */
  size?: number;
}

/**
 * Bookit Aurora illustrations — themed react-native-svg compositions sharing
 * the signature indigo→cyan gradient. Each reads the active palette so it
 * works in light and dark.
 */

function useArt() {
  const c = useColors();
  return {
    g1: c.brand.gradient[0],
    g2: c.brand.gradient[1],
    ink: c.text.primary,
    paper: c.background.surface,
    accent: c.brand.accent,
    soft: c.brand.primarySoft,
    star: c.brand.star,
    muted: c.background.muted,
    success: c.status.success,
  };
}

/** "Find trusted pros" — a search lens over a verified pro card. */
export function IllustrationFindPros({ size = 220 }: IllustrationProps) {
  const a = useArt();
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" accessibilityRole="image">
      <Defs>
        <LinearGradient id="fp" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a.g1} />
          <Stop offset="1" stopColor={a.g2} />
        </LinearGradient>
      </Defs>
      <Circle cx={120} cy={120} r={96} fill={a.soft} />
      <Rect x={58} y={66} width={108} height={120} rx={20} fill={a.paper} />
      <Circle cx={112} cy={104} r={22} fill="url(#fp)" />
      <Rect x={84} y={138} width={80} height={10} rx={5} fill={a.muted} />
      <Rect x={84} y={156} width={56} height={10} rx={5} fill={a.muted} />
      <G>
        <Circle cx={158} cy={158} r={34} fill="none" stroke="url(#fp)" strokeWidth={10} />
        <Path d="M182 182 L206 206" stroke="url(#fp)" strokeWidth={12} strokeLinecap="round" />
      </G>
      <Path
        d="M150 150 l6 6 l12 -14"
        fill="none"
        stroke={a.success}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** "Book in seconds" — a calendar with a lightning check. */
export function IllustrationBook({ size = 220 }: IllustrationProps) {
  const a = useArt();
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" accessibilityRole="image">
      <Defs>
        <LinearGradient id="bk" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a.g1} />
          <Stop offset="1" stopColor={a.g2} />
        </LinearGradient>
      </Defs>
      <Circle cx={120} cy={120} r={96} fill={a.soft} />
      <Rect x={62} y={70} width={116} height={104} rx={18} fill={a.paper} />
      <Rect x={62} y={70} width={116} height={28} rx={14} fill="url(#bk)" />
      <Rect x={84} y={60} width={10} height={24} rx={5} fill={a.ink} opacity={0.7} />
      <Rect x={146} y={60} width={10} height={24} rx={5} fill={a.ink} opacity={0.7} />
      <Path
        d="M104 134 l12 12 l26 -30"
        fill="none"
        stroke="url(#bk)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M150 112 l-16 22 h12 l-10 20"
        fill="none"
        stroke={a.accent}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** "Pay securely, relax" — a shield with a card and lock. */
export function IllustrationPaySecure({ size = 220 }: IllustrationProps) {
  const a = useArt();
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" accessibilityRole="image">
      <Defs>
        <LinearGradient id="ps" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a.g1} />
          <Stop offset="1" stopColor={a.g2} />
        </LinearGradient>
      </Defs>
      <Circle cx={120} cy={120} r={96} fill={a.soft} />
      <Path
        d="M120 58 l50 20 v44 c0 36 -26 58 -50 70 c-24 -12 -50 -34 -50 -70 V78 Z"
        fill="url(#ps)"
      />
      <Rect x={92} y={108} width={56} height={40} rx={8} fill={a.paper} />
      <Rect x={92} y={118} width={56} height={8} fill={a.ink} opacity={0.25} />
      <Rect x={100} y={134} width={20} height={6} rx={3} fill={a.ink} opacity={0.35} />
      <Path d="M112 108 v-8 a8 8 0 0 1 16 0 v8" fill="none" stroke={a.paper} strokeWidth={5} />
    </Svg>
  );
}

/** Location primer — a map pin with pulse rings. */
export function IllustrationLocation({ size = 200 }: IllustrationProps) {
  const a = useArt();
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" accessibilityRole="image">
      <Defs>
        <LinearGradient id="loc" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a.g1} />
          <Stop offset="1" stopColor={a.g2} />
        </LinearGradient>
      </Defs>
      <Ellipse cx={120} cy={196} rx={70} ry={16} fill={a.soft} />
      <Circle cx={120} cy={120} r={92} fill={a.soft} opacity={0.5} />
      <Circle cx={120} cy={120} r={62} fill={a.soft} />
      <Path
        d="M120 54 c-28 0 -50 22 -50 50 c0 36 50 82 50 82 s50 -46 50 -82 c0 -28 -22 -50 -50 -50 Z"
        fill="url(#loc)"
      />
      <Circle cx={120} cy={104} r={20} fill={a.paper} />
    </Svg>
  );
}

/** Notifications primer — a bell with a coral badge. */
export function IllustrationNotify({ size = 200 }: IllustrationProps) {
  const a = useArt();
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240" accessibilityRole="image">
      <Defs>
        <LinearGradient id="nt" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a.g1} />
          <Stop offset="1" stopColor={a.g2} />
        </LinearGradient>
      </Defs>
      <Circle cx={120} cy={120} r={92} fill={a.soft} />
      <Path
        d="M120 66 c-22 0 -38 16 -38 40 c0 30 -10 38 -16 46 c-3 4 0 10 6 10 h96 c6 0 9 -6 6 -10 c-6 -8 -16 -16 -16 -46 c0 -24 -16 -40 -38 -40 Z"
        fill="url(#nt)"
      />
      <Path d="M108 172 a12 12 0 0 0 24 0" fill={a.g2} />
      <Circle cx={120} cy={60} r={8} fill={a.ink} opacity={0.6} />
      <Circle cx={160} cy={78} r={16} fill={a.accent} />
    </Svg>
  );
}

/** Generic empty / success spot — concentric ring with a check. */
export function IllustrationSpot({ size = 160 }: IllustrationProps) {
  const a = useArt();
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" accessibilityRole="image">
      <Defs>
        <LinearGradient id="sp" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={a.g1} />
          <Stop offset="1" stopColor={a.g2} />
        </LinearGradient>
      </Defs>
      <Circle cx={80} cy={80} r={64} fill={a.soft} />
      <Circle cx={80} cy={80} r={44} fill="url(#sp)" />
      <Path
        d="M62 82 l12 12 l26 -30"
        fill="none"
        stroke={a.paper}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
