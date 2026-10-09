import { useMemo } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

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
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;
  const fg = isPrimary ? c.text.inverse : c.brand.tint;

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && !isDisabled && styles.pressed,
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
    </Pressable>
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
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
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
