import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EmptyState,
  Icon,
  PressableScale,
  ScreenHeader,
  Text,
  type IconName,
} from '../src/components/ui';
import { route } from '../src/lib/nav';
import {
  useNotificationsStore,
  type AppNotification,
  type NotificationDay,
  type NotificationType,
} from '../src/stores/notificationsStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const ICON: Record<NotificationType, IconName> = {
  accepted: 'check-circle',
  reminder: 'clock',
  review: 'star',
  promo: 'tag',
  safety: 'shield-check',
};

const DAY_ORDER: NotificationDay[] = ['Today', 'Yesterday', 'Earlier'];

type Row = { kind: 'header'; day: NotificationDay } | { kind: 'item'; item: AppNotification };

export default function NotificationsScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const hasUnread = items.some((n) => !n.read);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const day of DAY_ORDER) {
      const group = items.filter((n) => n.day === day);
      if (group.length === 0) continue;
      out.push({ kind: 'header', day });
      for (const item of group) out.push({ kind: 'item', item });
    }
    return out;
  }, [items]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader
        title="Notifications"
        right={
          <PressableScale
            onPress={markAllRead}
            disabled={!hasUnread}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
            style={styles.markAll}
          >
            <Text variant="footnote" tone={hasUnread ? 'accent' : 'muted'}>
              Mark all
            </Text>
          </PressableScale>
        }
      />

      <FlashList
        data={rows}
        keyExtractor={(r: Row, i) => (r.kind === 'header' ? `h-${r.day}` : `i-${r.item.id}-${i}`)}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <PressableScale
            style={styles.prefsRow}
            onPress={() => router.push(route('/notification-preferences'))}
            accessibilityRole="button"
            accessibilityLabel="Notification preferences"
          >
            <Icon name="sliders" size={20} color={c.brand.tint} />
            <Text variant="footnote" style={styles.prefsText}>
              Notification preferences
            </Text>
            <Icon name="chevron-right" size={20} color={c.text.muted} />
          </PressableScale>
        }
        ListEmptyComponent={
          <EmptyState
            art="empty"
            title="You're all caught up"
            message="New updates about your bookings will appear here."
          />
        }
        renderItem={({ item: row }: { item: Row }) =>
          row.kind === 'header' ? (
            <Text variant="footnote" tone="muted" style={styles.dayHeader}>
              {row.day}
            </Text>
          ) : (
            <PressableScale
              style={[styles.row, !row.item.read && styles.rowUnread]}
              onPress={() => markRead(row.item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${row.item.title}. ${row.item.read ? 'Read' : 'Unread'}`}
            >
              <View style={styles.iconWrap}>
                <Icon name={ICON[row.item.type]} size={20} color={c.brand.tint} />
              </View>
              <View style={styles.body}>
                <Text variant="headline">{row.item.title}</Text>
                <Text variant="callout" tone="muted">
                  {row.item.body}
                </Text>
                <Text variant="caption" tone="muted" style={styles.time}>
                  {row.item.time}
                </Text>
              </View>
              {!row.item.read ? <View style={styles.dot} /> : null}
            </PressableScale>
          )
        }
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    markAll: { paddingHorizontal: spacing.sm, minWidth: 44, alignItems: 'flex-end' },
    content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    prefsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    prefsText: { flex: 1 },
    dayHeader: {
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      padding: spacing.lg,
      marginBottom: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    rowUnread: { backgroundColor: c.brand.primarySoft, borderColor: c.brand.primarySoft },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.background.base,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    time: { marginTop: 2 },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.status.danger,
      marginTop: spacing.xs,
    },
  });
