import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';

import { spring } from '../../theme';
import { haptics } from '../../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale on press-in. Default 0.97. */
  scaleTo?: number;
  /** Haptic on press. Default 'light'. Pass null to disable. */
  haptic?: 'light' | 'medium' | 'selection' | null;
  /** Minimum 44pt hit slop is applied by default. */
  hitArea?: boolean;
}

/**
 * Pressable with a snappy scale + opacity press state and a haptic from the
 * map. Honours Reduce Motion (opacity only). 44pt hit area by default.
 */
export function PressableScale({
  children,
  style,
  scaleTo = 0.97,
  haptic = 'light',
  hitArea = true,
  onPressIn,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduced = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduced ? 1 : 1 - pressed.value * (1 - scaleTo) }],
    opacity: 1 - pressed.value * 0.12,
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      hitSlop={hitArea ? 8 : undefined}
      onPressIn={(e) => {
        pressed.value = withSpring(1, spring.snappy);
        if (haptic && !disabled) haptics[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, spring.snappy);
      }}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
