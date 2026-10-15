import { View, StyleSheet } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

export type BannerTone = 'info' | 'warning' | 'violation' | 'maintenance' | 'offline';

export interface BannerProps {
  tone?: BannerTone;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const META: Record<BannerTone, { icon: IconName }> = {
  info: { icon: 'info' },
  warning: { icon: 'alert-triangle' },
  violation: { icon: 'alert-circle' },
  maintenance: { icon: 'settings' },
  offline: { icon: 'refresh' },
};

/** Unified inline notice banner (info / warning / violation / maintenance / offline). */
export function Banner({ tone = 'info', title, message, actionLabel, onAction }: BannerProps) {
  const t = useTokens();
  const color: Record<BannerTone, string> = {
    info: t.info,
    warning: t.warning,
    violation: t.danger,
    maintenance: t.textMuted,
    offline: t.textMuted,
  };
  const c = color[tone];

  return (
    <View style={[styles.base, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={[styles.iconTile, { backgroundColor: t.accentSoft }]}>
        <Icon name={META[tone].icon} size={20} color={c} />
      </View>
      <View style={styles.body}>
        <Text variant="callout" style={{ fontWeight: '600' }}>
          {title}
        </Text>
        {message && (
          <Text variant="footnote" tone="muted">
            {message}
          </Text>
        )}
      </View>
      {actionLabel && onAction && (
        <PressableScale
          onPress={onAction}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitArea
        >
          <Text variant="callout" tone="accent" style={{ fontWeight: '700' }}>
            {actionLabel}
          </Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 1 },
});
