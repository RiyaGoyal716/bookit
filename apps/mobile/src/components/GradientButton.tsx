import { useMemo } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { type LucideIcon } from 'lucide-react-native';

import { useColors, radius, spacing, typography, shadow, type Palette } from '../theme';
import { useDirectionalStyles } from '../i18n';

export interface GradientButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Optional leading lucide icon. */
  Icon?: LucideIcon;
  /** Show a subtle coloured glow under the button. Default true. */
  glow?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

/**
 * Signature Aurora CTA — an indigo→cyan gradient pill with press feedback,
 * haptics and an optional lucide icon. Direction-aware (icon follows RTL).
 */
export function GradientButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  Icon,
  glow = true,
  haptic = true,
  style,
  accessibilityLabel,
}: GradientButtonProps) {
  const c = useColors();
  const dir = useDirectionalStyles();
  const styles = useMemo(() => makeStyles(c), [c]);
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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
        glow && !isDisabled ? shadow.glow : null,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      <LinearGradient
        colors={[c.brand.gradient[0], c.brand.gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fill}
      >
        {loading ? (
          <ActivityIndicator color={c.text.onBrand} />
        ) : (
          <View style={[styles.content, dir.row]}>
            {Icon ? <Icon size={20} color={c.text.onBrand} /> : null}
            <Text style={styles.label}>{label}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    fill: {
      minHeight: 56,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    content: { alignItems: 'center', gap: spacing.sm },
    label: {
      ...typography.scale.bodyMedium,
      fontFamily: typography.font.bold,
      fontWeight: '700',
      color: c.text.onBrand,
    },
    pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
    disabled: { opacity: 0.5 },
  });
