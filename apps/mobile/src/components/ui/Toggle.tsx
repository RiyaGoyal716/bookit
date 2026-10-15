import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
  interpolateColor,
} from 'react-native-reanimated';

import { useTokens, spring } from '../../theme';
import { haptics } from '../../lib/haptics';

export interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/** Spring toggle. Selection haptic. */
export function Toggle({ value, onChange, disabled, accessibilityLabel }: ToggleProps) {
  const t = useTokens();
  const reduced = useReducedMotion();

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(value ? 1 : 0, [0, 1], [t.bgSubtle, t.accent]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [
      { translateX: reduced ? (value ? 20 : 0) : withSpring(value ? 20 : 0, spring.snappy) },
    ],
    opacity: withTiming(disabled ? 0.5 : 1),
  }));

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        haptics.selection();
        onChange(!value);
      }}
    >
      <Animated.View style={[styles.track, { borderColor: t.border }, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
});
