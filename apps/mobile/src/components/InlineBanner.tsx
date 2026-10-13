import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, spacing, typography, type Palette } from '../theme';
import { useDirectionalStyles } from '../i18n';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface InlineBannerProps {
  tone?: BannerTone;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional action label + handler rendered on the right. */
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
}

const TONE_ICON: Record<BannerTone, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle',
  success: 'checkmark-circle',
  warning: 'warning',
  danger: 'alert-circle',
};

/**
 * In-app banner used for violation notices, account status, safety alerts and
 * inline announcements. Animates in with moti; direction-aware; themed per tone.
 */
export function InlineBanner({
  tone = 'info',
  title,
  message,
  icon,
  actionLabel,
  onAction,
  onDismiss,
  style,
}: InlineBannerProps) {
  const c = useColors();
  const dir = useDirectionalStyles();
  const styles = useMemo(() => makeStyles(c), [c]);

  const toneColors: Record<BannerTone, { bg: string; fg: string }> = {
    info: { bg: c.status.infoSoft, fg: c.status.info },
    success: { bg: c.status.successSoft, fg: c.status.success },
    warning: { bg: c.status.warningSoft, fg: c.status.warning },
    danger: { bg: c.status.dangerSoft, fg: c.status.danger },
  };
  const tc = toneColors[tone];

  return (
    <MotiView
      from={{ opacity: 0, translateY: -6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={[styles.wrap, { backgroundColor: tc.bg }, dir.row, style]}
      accessibilityRole="alert"
    >
      <Ionicons name={icon ?? TONE_ICON[tone]} size={20} color={tc.fg} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: tc.fg }, dir.textAlign]}>{title}</Text>
        {message ? (
          <Text style={[styles.message, dir.textAlign]} numberOfLines={3}>
            {message}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={[styles.action, { color: tc.fg }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <Ionicons name="close" size={18} color={tc.fg} />
        </Pressable>
      ) : null}
    </MotiView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
    },
    body: { flex: 1, gap: 2 },
    title: { ...typography.scale.smallMedium, fontFamily: typography.font.bold, fontWeight: '700' },
    message: { ...typography.scale.caption, color: c.text.secondary },
    action: { ...typography.scale.smallMedium, marginTop: spacing.xs },
  });
