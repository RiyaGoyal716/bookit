import { Pressable, Text, StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/** Selectable pill used for category filters, dates and time slots. */
export function Chip({ label, active = false, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  chipInactive: {
    backgroundColor: colors.background.base,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.text.inverse,
  },
  labelInactive: {
    color: colors.text.secondary,
  },
});
