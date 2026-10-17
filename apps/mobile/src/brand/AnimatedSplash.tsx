import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';

import { useTokens, getEasing, spring as springs } from '../theme';
import { haptics } from '../lib/haptics';

const ARect = Animated.createAnimatedComponent(Rect);
const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);

const CHECK_LEN = 22; // approx check path length on the 48 grid

export interface AnimatedSplashProps {
  /** Called when the splash finishes (or is tapped to skip). */
  onDone: () => void;
}

/**
 * In-app animated splash matching the Bookit mark: the stem slides up, the
 * green bowl scales in (bouncy), the white check draws on, and the coral dot
 * pops with a light haptic, then it cross-fades out. <= 1.2s, tap to skip.
 * Falls back to a plain fade under Reduce Motion.
 */
export function AnimatedSplash({ onDone }: AnimatedSplashProps) {
  const t = useTokens();
  const reduced = useReducedMotion();

  const overlay = useSharedValue(1);
  const stemY = useSharedValue(reduced ? 0 : 18);
  const stemO = useSharedValue(reduced ? 1 : 0);
  const bowl = useSharedValue(reduced ? 1 : 0);
  const check = useSharedValue(reduced ? 0 : CHECK_LEN);
  const dot = useSharedValue(reduced ? 1 : 0);

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
    stemO.value = withTiming(1, { duration: 180, easing: getEasing() });
    stemY.value = withTiming(0, { duration: 260, easing: getEasing() });
    bowl.value = withDelay(180, withSpring(1, springs.bouncy));
    check.value = withDelay(480, withTiming(0, { duration: 220, easing: getEasing() }));
    dot.value = withDelay(
      700,
      withSpring(1, springs.bouncy, (done) => {
        if (done) runOnJS(haptics.light)();
      }),
    );
    const id = setTimeout(finish, 1120);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
  const stemProps = useAnimatedProps(() => ({ opacity: stemO.value, y: 4 + stemY.value }));
  const bowlProps = useAnimatedProps(() => ({ opacity: bowl.value, r: 15 * bowl.value }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: check.value }));
  const dotProps = useAnimatedProps(() => ({ opacity: dot.value, r: 4.5 * dot.value }));

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
        <Svg width={120} height={120} viewBox="0 0 48 48">
          <ARect x={7} width={11} height={40} rx={5.5} fill={t.inverse} animatedProps={stemProps} />
          <ACircle cx={28.5} cy={29} fill={t.brandGreen} animatedProps={bowlProps} />
          <APath
            d="M21.6 29.4l4.7 4.7 9.1-9.4"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={4.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={CHECK_LEN}
            animatedProps={checkProps}
          />
          <ACircle cx={39.5} cy={8.5} fill={t.coral} animatedProps={dotProps} />
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
