import { View, StyleSheet } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { Text } from './Text';
import { IconButton } from './IconButton';

export interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  accessibilityLabel?: string;
}

/** Quantity stepper. Selection haptic on each step (via IconButton). */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  accessibilityLabel = 'Quantity',
}: StepperProps) {
  const t = useTokens();
  return (
    <View style={[styles.base, { borderColor: t.border, backgroundColor: t.surface }]}>
      <IconButton
        name="minus"
        accessibilityLabel={`Decrease ${accessibilityLabel}`}
        diameter={36}
        size={16}
        disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))}
      />
      <Text variant="headline" tabular style={styles.value} maxFontSizeMultiplier={1.3}>
        {value}
      </Text>
      <IconButton
        name="plus"
        accessibilityLabel={`Increase ${accessibilityLabel}`}
        diameter={36}
        size={16}
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.xs,
    alignSelf: 'flex-start',
  },
  value: { minWidth: 28, textAlign: 'center' },
});
