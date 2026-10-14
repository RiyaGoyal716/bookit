import { useMemo } from 'react';
import { Text, StyleSheet, ActivityIndicator, View, type ViewStyle } from 'react-native';
import { MotiPressable } from 'moti/interactions';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useColors, radius, spacing, typography, type Palette } from '../theme';
import { useReducedMotion } from './motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  /** Fire a light haptic on press. Default: true. */
  haptic?: boolean;
  accessibilityLabel?: string;
}

/** Primary / secondary / ghost button with press feedback, loading + haptics. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  haptic = true,
  accessibilityLabel,
}: ButtonProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const reduced = useReducedMotion();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;
  const fg = isPrimary ? c.text.inverse : c.brand.tint;

  const animate = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        'worklet';
        return { scale: pressed && !reduced && !isDisabled ? 0.97 : 1 };
      },
    [reduced, isDisabled],
  );

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  return (
    <MotiPressable
      onPress={handlePress}
      disabled={isDisabled}
      animate={animate}
      transition={{ type: 'spring', damping: 15, stiffness: 280, mass: 0.5 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </View>
      )}
    </MotiPressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    base: {
      minHeight: 54,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    primary: {
      backgroundColor: c.brand.primary,
    },
    secondary: {
      backgroundColor: c.background.surface,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    disabled: {
      opacity: 0.5,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: {
      ...typography.scale.bodyMedium,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
  });
