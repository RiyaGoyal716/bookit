import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

import { Logo } from './Logo';
import { useReducedMotion } from './motion';
import { spacing } from '../theme';

export interface BookitRefreshProps {
  /** Whether the refresh is active (spins the logo). */
  active: boolean;
  size?: number;
  style?: ViewStyle;
}

/**
 * Custom pull-to-refresh indicator — the Bookit mark gently spins and pulses
 * while a refresh is in flight. Overlay this near the top of a scroll view and
 * drive `active` from the RefreshControl's refreshing state. UI-thread driven;
 * static under reduce-motion.
 */
export function BookitRefresh({ active, size = 34, style }: BookitRefreshProps) {
  const reduced = useReducedMotion();
  const spin = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active && !reduced) {
      spin.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
      pulse.value = withRepeat(
        withTiming(1.12, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      cancelAnimation(spin);
      cancelAnimation(pulse);
      spin.value = withTiming(0, { duration: 200 });
      pulse.value = withTiming(1, { duration: 200 });
    }
    return () => {
      cancelAnimation(spin);
      cancelAnimation(pulse);
    };
  }, [active, reduced, spin, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }, { scale: pulse.value }],
    opacity: active ? 1 : 0,
  }));

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Animated.View style={animStyle}>
        <Logo size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
});
