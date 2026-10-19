import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  useReducedMotion,
} from 'react-native-reanimated';

import { useTokens, radius, spacing } from '../../theme';
import { useIsRTL } from '../../i18n';
import { Text } from './Text';

export interface LiveChipProps {
  label: string;
}

/** Small chip with a pulsing green dot, e.g. "42 pros free near you now". */
export function LiveChip({ label }: LiveChipProps) {
  const t = useTokens();
  const rtl = useIsRTL();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      false,
    );
  }, [reduced, pulse]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: t.successSoft, flexDirection: rtl ? 'row-reverse' : 'row' },
      ]}
      accessible
      accessibilityLabel={label}
    >
      <View style={styles.dotWrap}>
        <Animated.View style={[styles.dot, { backgroundColor: t.brandGreen }, dotStyle]} />
      </View>
      <Text variant="caption" tone="success" style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  dotWrap: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontWeight: '700' },
});
