import { useEffect } from 'react';
import { type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';

import { useTokens, radius, getEasing } from '../../theme';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shimmer placeholder. Static when Reduce Motion is on. */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const t = useTokens();
  const reduced = useReducedMotion();
  const shimmer = useSharedValue(0.5);

  useEffect(() => {
    if (reduced) return;
    shimmer.value = withRepeat(withTiming(1, { duration: 900, easing: getEasing() }), -1, true);
  }, [reduced, shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: 0.5 + shimmer.value * 0.5 }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: t.bgSubtle }, animatedStyle, style]}
    />
  );
}
