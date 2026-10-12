import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../../src/components';
import { route } from '../../src/lib/nav';
import {
  useNotificationsStore,
  type AppNotification,
  type NotificationType,
} from '../../src/stores/notificationsStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  accepted: 'checkmark-circle',
  reminder: 'alarm',
  review: 'star',
  promo: 'pricetag',
};

export default function InboxScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const unread = items.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Inbox</Text>
          <Text style={styles.subtitle}>
            {unread > 0
              ? `${unread} unread message${unread === 1 ? '' : 's'}`
              : 'You’re all caught up'}
          </Text>
        </View>
        {unread > 0 ? (
          <Pressable
            onPress={markAllRead}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>

      <FlashList
        data={items}
        keyExtractor={(n: AppNotification) => n.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="No messages yet"
            message="Updates about your bookings will show up here."
            actionLabel="Find a provider"
            onAction={() => router.push('/(tabs)')}
          />
        }
        renderItem={({ item }: { item: AppNotification }) => (
          <Pressable
            onPress={() => {
              markRead(item.id);
              router.push(route('/notifications'));
            }}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.body}`}
            style={({ pressed }) => [
              styles.row,
              !item.read && styles.rowUnread,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={[styles.iconWrap, !item.read && styles.iconWrapUnread]}>
              <Ionicons
                name={ICONS[item.type]}
                size={20}
                color={item.read ? c.text.muted : c.brand.tint}
              />
            </View>
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
            {!item.read ? <View style={styles.dot} /> : null}
          </Pressable>
        )}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    heading: { ...typography.scale.h1, color: c.text.primary },
    subtitle: { ...typography.scale.body, color: c.text.secondary, marginTop: 2 },
    markAll: { ...typography.scale.smallMedium, color: c.brand.tint, marginTop: spacing.xs },
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
    separator: { height: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    rowUnread: { backgroundColor: c.brand.primarySoft, borderColor: c.brand.primarySoft },
    rowPressed: { opacity: 0.85 },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: c.background.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapUnread: { backgroundColor: c.background.surface },
    body: { flex: 1, gap: 2 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    title: { flex: 1, ...typography.scale.bodyMedium, color: c.text.primary },
    time: { ...typography.scale.caption, color: c.text.muted },
    message: { ...typography.scale.small, color: c.text.secondary },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.brand.primary },
  });
