import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../src/components';
import { route } from '../src/lib/nav';
import {
  useNotificationsStore,
  type AppNotification,
  type NotificationDay,
  type NotificationType,
} from '../src/stores/notificationsStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  accepted: 'checkmark-circle',
  reminder: 'alarm',
  review: 'star',
  promo: 'pricetag',
  safety: 'shield-checkmark',
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
        <Text style={styles.title}>Notifications</Text>
        <Pressable
          onPress={markAllRead}
          disabled={!hasUnread}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
        >
          <Text style={[styles.markAll, !hasUnread && styles.markAllDisabled]}>Mark all</Text>
        </Pressable>
      </View>

      <FlashList
        data={rows}
        keyExtractor={(r: Row, i) => (r.kind === 'header' ? `h-${r.day}` : `i-${r.item.id}-${i}`)}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Pressable
            style={styles.prefsRow}
            onPress={() => router.push(route('/notification-preferences'))}
            accessibilityRole="button"
            accessibilityLabel="Notification preferences"
          >
            <Ionicons name="options-outline" size={18} color={c.brand.tint} />
            <Text style={styles.prefsText}>Notification preferences</Text>
            <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
          </Pressable>
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="You're all caught up"
            message="New updates about your bookings will appear here."
          />
        }
        renderItem={({ item: row }: { item: Row }) =>
          row.kind === 'header' ? (
            <Text style={styles.dayHeader}>{row.day}</Text>
          ) : (
            <Pressable
              style={[styles.row, !row.item.read && styles.rowUnread]}
              onPress={() => markRead(row.item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${row.item.title}. ${row.item.read ? 'Read' : 'Unread'}`}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={ICON[row.item.type]} size={18} color={c.brand.tint} />
              </View>
              <View style={styles.body}>
                <Text style={styles.rowTitle}>{row.item.title}</Text>
                <Text style={styles.rowBody}>{row.item.body}</Text>
                <Text style={styles.time}>{row.item.time}</Text>
              </View>
              {!row.item.read ? <View style={styles.dot} /> : null}
            </Pressable>
          )
        }
      />
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
    markAll: { ...typography.scale.smallMedium, color: c.brand.tint },
    markAllDisabled: { color: c.text.muted },
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
    prefsText: { flex: 1, ...typography.scale.smallMedium, color: c.text.primary },
    dayHeader: {
      ...typography.scale.smallMedium,
      color: c.text.muted,
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
    rowTitle: { ...typography.scale.bodyMedium, color: c.text.primary },
    rowBody: { ...typography.scale.small, color: c.text.secondary },
    time: { ...typography.scale.caption, color: c.text.muted, marginTop: 2 },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.status.danger,
      marginTop: spacing.xs,
    },
  });
