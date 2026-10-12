import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useColors } from '../theme';

export interface ConfettiProps {
  /** Replay key — change it to re-fire the burst. */
  run: boolean;
  /** Number of pieces. Default 80. */
  count?: number;
  /** Total fall duration in ms. Default 2200. */
  duration?: number;
}

interface Piece {
  left: number;
  size: number;
  color: string;
  delay: number;
  drift: number;
  rotations: number;
  fall: number;
}

/**
 * Lightweight celebratory confetti built with react-native-reanimated (an
 * already-installed dep — no new native modules). Pieces fall, drift and spin,
 * then fade. Purely decorative, so it's non-interactive.
 */
export function Confetti({ run, count = 80, duration = 2200 }: ConfettiProps) {
  const c = useColors();
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const palette = useMemo(
    () => [c.brand.primary, c.brand.accent, c.status.info, c.status.success, c.brand.tint],
    [c],
  );

  const pieces = useMemo<Piece[]>(() => {
    // Deterministic-ish random layout computed once per mount.
    return Array.from({ length: count }).map((_, i) => {
      const r = (n: number) => {
        const x = Math.sin((i + 1) * (n + 1) * 12.9898) * 43758.5453;
        return x - Math.floor(x);
      };
      return {
        left: r(1) * width,
        size: 6 + r(2) * 8,
        color: palette[Math.floor(r(3) * palette.length)],
        delay: r(4) * 400,
        drift: (r(5) - 0.5) * 120,
        rotations: 2 + r(6) * 4,
        fall: height * (0.7 + r(7) * 0.3),
      };
    });
  }, [count, width, height, palette]);

  useEffect(() => {
    if (run) {
      progress.value = 0;
      progress.value = withTiming(1, { duration, easing: Easing.out(Easing.quad) });
    }
  }, [run, duration, progress]);

  if (!run) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} piece={p} progress={progress} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  piece,
  progress,
}: {
  piece: Piece;
  progress: ReturnType<typeof useSharedValue<number>>;
}) {
  const style = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, progress.value * 1.2 - piece.delay / 2200));
    return {
      transform: [
        { translateX: piece.drift * t },
        { translateY: piece.fall * t - piece.size },
        { rotate: `${piece.rotations * 360 * t}deg` },
      ],
      opacity: t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -20,
          left: piece.left,
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}
