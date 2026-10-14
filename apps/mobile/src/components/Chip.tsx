import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';

import { useColors, radius, spacing, typography, type Palette } from '../theme';
import { useReducedMotion } from './motion';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

/** Selectable pill used for category filters, dates and time slots. */
export function Chip({ label, active = false, onPress }: ChipProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const reduced = useReducedMotion();

  const animate = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        'worklet';
        return { scale: pressed && !reduced ? 0.95 : 1 };
      },
    [reduced],
  );

  return (
    <MotiPressable
      onPress={onPress}
      animate={animate}
      transition={{ type: 'spring', damping: 15, stiffness: 280, mass: 0.5 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
    >
      {/* Keyed remount gives a subtle pop when the chip becomes active. */}
      <MotiView
        key={active ? 'on' : 'off'}
        from={{ scale: active && !reduced ? 1.12 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 260 }}
      >
        <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
          {label}
        </Text>
      </MotiView>
    </MotiPressable>
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
