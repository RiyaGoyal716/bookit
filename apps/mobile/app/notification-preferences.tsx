import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  useNotificationPrefsStore,
  type NotificationPrefs,
} from '../src/stores/notificationPrefsStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

interface PrefRow {
  key: keyof NotificationPrefs;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  locked?: boolean;
}

const CHANNELS: PrefRow[] = [
  {
    key: 'push',
    label: 'Push notifications',
    sub: 'On this device',
    icon: 'phone-portrait-outline',
  },
  { key: 'email', label: 'Email', sub: 'Receipts and summaries', icon: 'mail-outline' },
];

const TOPICS: PrefRow[] = [
  {
    key: 'bookingUpdates',
    label: 'Booking updates',
    sub: 'Accepted, on the way, completed',
    icon: 'calendar-outline',
  },
  {
    key: 'chatMessages',
    label: 'Chat messages',
    sub: 'New messages from pros & support',
    icon: 'chatbubble-ellipses-outline',
  },
  {
    key: 'promotions',
    label: 'Offers & promotions',
    sub: 'Deals and seasonal discounts',
    icon: 'pricetag-outline',
  },
  {
    key: 'safetyAlerts',
    label: 'Safety alerts',
    sub: 'Account and security notices',
    icon: 'shield-checkmark-outline',
    locked: true,
  },
];

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const prefs = useNotificationPrefsStore();

  const renderRow = (row: PrefRow) => (
    <View key={row.key} style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={row.icon} size={18} color={c.brand.tint} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={styles.rowSub}>{row.locked ? `${row.sub} · always on` : row.sub}</Text>
      </View>
      <Switch
        value={prefs[row.key]}
        disabled={row.locked}
        onValueChange={() => prefs.toggle(row.key)}
        trackColor={{ false: c.border, true: c.brand.primary }}
        thumbColor={c.background.surface}
        accessibilityLabel={row.label}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Notification preferences</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Channels</Text>
        <View style={styles.card}>{CHANNELS.map(renderRow)}</View>

        <Text style={styles.sectionLabel}>What you hear about</Text>
        <View style={styles.card}>{TOPICS.map(renderRow)}</View>

        <Text style={styles.note}>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    title: { flex: 1, ...typography.scale.h2, color: c.text.primary },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
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
    rowLabel: { ...typography.scale.bodyMedium, color: c.text.primary },
    rowSub: { ...typography.scale.caption, color: c.text.muted },
    note: { ...typography.scale.caption, color: c.text.muted, marginTop: spacing.lg },
  });
