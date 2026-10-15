import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';

import { useTokens, radius, spacing, shadow, spring } from '../../theme';
import { Text } from './Text';
import { haptics } from '../../lib/haptics';

export interface SegmentedControlProps {
  options: string[];
  value: number;
  onChange: (index: number) => void;
}

/** Segmented control with a sliding indicator. Selection haptic. */
export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const t = useTokens();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const x = useSharedValue(0);
  const seg = w > 0 ? w / options.length : 0;

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width - 4);

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: seg,
  }));

  // keep indicator in sync with value
  useEffect(() => {
    if (seg <= 0) return;
    const target = seg * value;
    // reanimated shared values are mutable refs; the compiler rule is a false positive here.
    // eslint-disable-next-line react-hooks/immutability
    x.value = reduced ? target : withSpring(target, spring.snappy);
  }, [seg, value, reduced, x]);

  return (
    <View style={[styles.track, { backgroundColor: t.bgSubtle }]} onLayout={onLayout}>
      {seg > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: t.surface, borderColor: t.border },
            shadow.hairline,
            indicator,
          ]}
        />
      )}
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          style={styles.option}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === value }}
          accessibilityLabel={opt}
          onPress={() => {
            haptics.selection();
            onChange(i);
          }}
        >
          <Text
            variant="callout"
            maxFontSizeMultiplier={1.3}
            style={{ color: i === value ? t.text : t.textMuted, fontWeight: '600' }}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 2,
    height: 40,
  },
  indicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
});
