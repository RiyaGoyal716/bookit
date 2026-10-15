import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';

import { useTokens, getEasing } from '../theme';
import { haptics } from '../lib/haptics';

const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);
const ARect = Animated.createAnimatedComponent(Rect);

const RING_C = 2 * Math.PI * 6.2; // bowl ring circumference
const CHECK_LEN = 9; // approx check path length

export interface AnimatedSplashProps {
  /** Called when the splash finishes (or is tapped to skip). */
  onDone: () => void;
}

/**
 * In-app animated splash. The mark's stem and bowl draw on, the check pops, a
 * light haptic fires, then it cross-fades to the first screen. <= 1.2s, tap to
 * skip. Falls back to a plain fade when Reduce Motion is on.
 */
export function AnimatedSplash({ onDone }: AnimatedSplashProps) {
  const t = useTokens();
  const reduced = useReducedMotion();

  const overlay = useSharedValue(1);
  const stem = useSharedValue(reduced ? 1 : 0);
  const ring = useSharedValue(reduced ? 0 : RING_C);
  const check = useSharedValue(reduced ? 0 : CHECK_LEN);

  const finish = () => {
    overlay.value = withTiming(0, { duration: 220, easing: getEasing() }, (done) => {
      if (done) runOnJS(onDone)();
    });
  };

  useEffect(() => {
    if (reduced) {
      const id = setTimeout(finish, 500);
      return () => clearTimeout(id);
    }
    stem.value = withTiming(1, { duration: 220, easing: getEasing() });
    ring.value = withDelay(140, withTiming(0, { duration: 380, easing: getEasing() }));
    check.value = withDelay(
      520,
      withTiming(0, { duration: 200, easing: getEasing() }, (done) => {
        if (done) runOnJS(haptics.light)();
      }),
    );
    const id = setTimeout(finish, 1050);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const stemProps = useAnimatedProps(() => ({ opacity: stem.value }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: ring.value }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: check.value }));

  return (
    <Animated.View
      style={[styles.fill, { backgroundColor: t.bg }, overlayStyle]}
      pointerEvents="box-none"
    >
      <Pressable
        style={styles.fill}
        onPress={finish}
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
      >
        <Svg width={96} height={96} viewBox="0 0 24 24">
          <ARect
            x={4.5}
            y={2.5}
            width={3.5}
            height={19}
            rx={1.75}
            fill={t.text}
            animatedProps={stemProps}
          />
          <ACircle
            cx={13}
            cy={15}
            r={6.2}
            stroke={t.text}
            strokeWidth={3.5}
            fill="none"
            strokeDasharray={RING_C}
            animatedProps={ringProps}
          />
          <APath
            d="M10.3 15.2 L12.3 17.2 L16 13"
            stroke={t.accent}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={CHECK_LEN}
            animatedProps={checkProps}
          />
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
});
