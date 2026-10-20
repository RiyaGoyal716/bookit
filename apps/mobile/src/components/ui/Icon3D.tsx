import { useEffect } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';

import { useColorSchemeName, useTokens, spring } from '../../theme';
import { Fluent3D, type Fluent3DKey } from '../../assets/3d';

export type Icon3DSize = 24 | 32 | 40 | 44 | 48 | 56 | 72 | 120;
export type Icon3DAnimate = 'none' | 'enter' | 'attention';

export interface Icon3DProps {
  name: Fluent3DKey;
  /** Chip square size. 24 / 32 / 40 / 56 / 72 / 120. Default 40. */
  size?: Icon3DSize;
  /** Squircle tint colour (a theme token). Defaults to the primary ink. */
  tint?: string;
  /** Entrance / attention behaviour. Default 'none'. */
  animate?: Icon3DAnimate;
  /** List position, for a 30ms staggered entrance. */
  index?: number;
  /** Drop the tinted squircle and render just the illustration. */
  bare?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedView = Animated.View;

/**
 * A Fluent 3D illustration sitting on a tinted squircle — the v2 replacement
 * for "line icon inside a tinted circle" everywhere (account rows, quick tiles,
 * notification types, settings, empty / status screens).
 *
 * - enter:     scale 0.6->1 + rotate -8->0 bouncy, first render only, 30ms stagger
 * - attention: a gentle wiggle/bounce that stops after 3 cycles (new items only)
 * - press:     handled by the parent <PressableScale> (scale + tilt)
 * - Reduce Motion: entrance / attention collapse to a fade.
 */
export function Icon3D({
  name,
  size = 40,
  tint,
  animate = 'none',
  index = 0,
  bare = false,
  style,
}: Icon3DProps) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const reduced = useReducedMotion();
  const enter = useSharedValue(animate === 'none' ? 1 : 0);
  const attention = useSharedValue(0);

  const tintColor = tint ?? t.primary;
  const inner = Math.round(size * 0.64);
  const radius = Math.round(size * 0.32);
  const bgOpacity = scheme === 'dark' ? 0.2 : 0.14;

  useEffect(() => {
    if (animate === 'none') {
      enter.value = 1;
      return;
    }
    const delay = Math.min(index, 8) * 30;
    if (reduced) {
      enter.value = withDelay(delay, withTiming(1, { duration: 200 }));
      return;
    }
    enter.value = withDelay(delay, withSpring(1, spring.bouncy));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, reduced, index]);

  useEffect(() => {
    if (animate !== 'attention' || reduced) return;
    // Three wiggle cycles, then rest.
    attention.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 140 }),
        withTiming(-1, { duration: 140 }),
        withTiming(0, { duration: 140 }),
      ),
      3,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, reduced]);

  const animStyle = useAnimatedStyle(() => {
    if (reduced) return { opacity: enter.value };
    return {
      opacity: enter.value,
      transform: [
        { scale: interpolate(enter.value, [0, 1], [0.6, 1]) },
        { rotate: `${interpolate(enter.value, [0, 1], [-8, 0]) + attention.value * 8}deg` },
        { translateY: -Math.abs(attention.value) * 2 },
      ],
    };
  });

  if (bare) {
    return (
      <AnimatedView style={[animStyle, style]}>
        <Fluent3D name={name} size={inner} />
      </AnimatedView>
    );
  }

  return (
    <AnimatedView
      style={[styles.chip, { width: size, height: size, borderRadius: radius }, animStyle, style]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tintColor, opacity: bgOpacity, borderRadius: radius },
        ]}
      />
      <Fluent3D name={name} size={inner} />
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  chip: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
