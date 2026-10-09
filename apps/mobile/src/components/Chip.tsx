import { useMemo } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/** Selectable pill used for category filters, dates and time slots. */
export function Chip({ label, active = false, onPress }: ChipProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    chip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1.5,
    },
    chipActive: {
      backgroundColor: c.brand.primary,
      borderColor: c.brand.primary,
    },
    chipInactive: {
      backgroundColor: c.background.surface,
      borderColor: c.border,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.97 }],
    },
    label: {
      ...typography.scale.smallMedium,
    },
    labelActive: {
      color: c.text.inverse,
    },
    labelInactive: {
      color: c.text.secondary,
    },
  });
