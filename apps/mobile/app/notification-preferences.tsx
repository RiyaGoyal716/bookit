import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, ScreenHeader, Text, Toggle, type IconName } from '../src/components/ui';
import {
  useNotificationPrefsStore,
  type NotificationPrefs,
} from '../src/stores/notificationPrefsStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

interface PrefRow {
  key: keyof NotificationPrefs;
  label: string;
  sub: string;
  icon: IconName;
  locked?: boolean;
}

const CHANNELS: PrefRow[] = [
  {
    key: 'push',
    label: 'Push notifications',
    sub: 'On this device',
    icon: 'smartphone',
  },
  { key: 'email', label: 'Email', sub: 'Receipts and summaries', icon: 'mail' },
];

const TOPICS: PrefRow[] = [
  {
    key: 'bookingUpdates',
    label: 'Booking updates',
    sub: 'Accepted, on the way, completed',
    icon: 'calendar',
  },
  {
    key: 'chatMessages',
    label: 'Chat messages',
    sub: 'New messages from pros & support',
    icon: 'message',
  },
  {
    key: 'promotions',
    label: 'Offers & promotions',
    sub: 'Deals and seasonal discounts',
    icon: 'tag',
  },
  {
    key: 'safetyAlerts',
    label: 'Safety alerts',
    sub: 'Account and security notices',
    icon: 'shield-check',
    locked: true,
  },
];

export default function NotificationPreferencesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const prefs = useNotificationPrefsStore();

  const renderRow = (row: PrefRow) => (
    <View key={row.key} style={styles.row}>
      <View style={styles.iconWrap}>
        <Icon name={row.icon} size={20} color={c.brand.tint} />
      </View>
      <View style={styles.rowBody}>
        <Text variant="headline">{row.label}</Text>
        <Text variant="caption" tone="muted">
          {row.locked ? `${row.sub} · always on` : row.sub}
        </Text>
      </View>
      <Toggle
        value={prefs[row.key]}
        disabled={row.locked}
        onChange={() => prefs.toggle(row.key)}
        accessibilityLabel={row.label}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader title="Notification preferences" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Channels
        </Text>
        <View style={styles.card}>{CHANNELS.map(renderRow)}</View>

        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          What you hear about
        </Text>
        <View style={styles.card}>{TOPICS.map(renderRow)}</View>

        <Text variant="caption" tone="muted" style={styles.note}>
          You can change these at any time. We&apos;ll always send essential safety and account
          notices.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    sectionLabel: {
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowBody: { flex: 1, gap: 2 },
    note: { marginTop: spacing.lg },
  });
