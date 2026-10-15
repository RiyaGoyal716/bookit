import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens, spacing, radius } from '../../theme';
import { Text } from './Text';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

export type StatusKind =
  | 'violation'
  | 'warning'
  | 'under-review'
  | 'restricted'
  | 'maintenance'
  | 'update'
  | 'offline'
  | 'payment-failed';

export interface StatusScreenProps {
  kind: StatusKind;
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

const META: Record<StatusKind, { icon: IconName; tone: 'danger' | 'warning' | 'info' | 'muted' }> =
  {
    violation: { icon: 'alert-circle', tone: 'danger' },
    warning: { icon: 'alert-triangle', tone: 'warning' },
    'under-review': { icon: 'clock', tone: 'info' },
    restricted: { icon: 'lock', tone: 'danger' },
    maintenance: { icon: 'settings', tone: 'muted' },
    update: { icon: 'arrow-up-right', tone: 'info' },
    offline: { icon: 'refresh', tone: 'muted' },
    'payment-failed': { icon: 'card', tone: 'danger' },
  };

/** Full-screen status template for unified notices (violations, maintenance, …). */
export function StatusScreen({
  kind,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: StatusScreenProps) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const meta = META[kind];
  const color =
    meta.tone === 'danger'
      ? t.danger
      : meta.tone === 'warning'
        ? t.warning
        : meta.tone === 'info'
          ? t.info
          : t.textMuted;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: t.bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <View style={styles.center}>
        <View style={[styles.icon, { backgroundColor: t.accentSoft }]}>
          <Icon name={meta.icon} size={24} color={color} />
        </View>
        <Text variant="title1" center>
          {title}
        </Text>
        <Text variant="body" tone="muted" center>
          {message}
        </Text>
      </View>
      <View style={styles.actions}>
        {primaryLabel && onPrimary && <Button label={primaryLabel} onPress={onPrimary} />}
        {secondaryLabel && onSecondary && (
          <Button label={secondaryLabel} variant="secondary" onPress={onSecondary} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actions: { gap: spacing.sm },
});
