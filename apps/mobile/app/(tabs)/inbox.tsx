import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Icon, PressableScale, Text } from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { useChatStore, type Conversation } from '../../src/stores/chatStore';
import { useNotificationsStore } from '../../src/stores/notificationsStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';

export default function InboxScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const conversations = useChatStore((s) => s.conversations);
  const notifUnread = useNotificationsStore((s) => s.items.filter((n) => !n.read).length);

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.order - a.order),
    [conversations],
  );

  const lastOf = (conv: Conversation): string => {
    const m = conv.messages[conv.messages.length - 1];
    if (!m) return 'Start the conversation';
    if (m.image && !m.text) return 'Photo';
    return `${m.from === 'me' ? 'You: ' : ''}${m.text ?? ''}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <View style={styles.flex1}>
          <Text variant="title1">Inbox</Text>
          <Text variant="body" tone="muted" style={styles.subtitle}>
            Chats with your pros and support
          </Text>
        </View>
        <PressableScale
          style={styles.bell}
          onPress={() => router.push(route('/notifications'))}
          accessibilityRole="button"
          accessibilityLabel={`Notifications${notifUnread > 0 ? `, ${notifUnread} unread` : ''}`}
        >
          <Icon name="bell" size={24} color={c.text.primary} />
          {notifUnread > 0 ? (
            <View style={styles.bellBadge}>
              <Text variant="micro" tone="onPrimary" style={styles.badgeText}>
                {notifUnread}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </View>

      <FlashList
        data={sorted}
        keyExtractor={(conv: Conversation) => conv.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            art="empty"
            title="No conversations yet"
            message="Message a pro from a booking to start chatting."
            actionLabel="Find a provider"
            onAction={() => router.push('/(tabs)')}
          />
        }
        renderItem={({ item }: { item: Conversation }) => (
          <PressableScale
            onPress={() => router.push(route(`/chat/${item.id}`))}
            accessibilityRole="button"
            accessibilityLabel={`Chat with ${item.name}`}
            style={styles.row}
          >
            {item.kind === 'support' ? (
              <View style={styles.supportAvatar}>
                <Icon name="sparkles" size={20} color={c.text.inverse} />
              </View>
            ) : item.avatar ? (
              <Image
                source={{ uri: item.avatar }}
                style={styles.avatar}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Icon name="user" size={20} color={c.text.muted} />
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text variant="headline" style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.messages.length > 0 ? (
                  <Text variant="caption" tone="subtle">
                    {item.messages[item.messages.length - 1].time}
                  </Text>
                ) : null}
              </View>
              <Text
                variant="caption"
                tone={item.unread > 0 ? 'default' : 'muted'}
                style={item.unread > 0 ? styles.semibold : undefined}
                numberOfLines={1}
              >
                {lastOf(item)}
              </Text>
            </View>
            {item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text variant="micro" tone="onPrimary" style={styles.badgeText}>
                  {item.unread}
                </Text>
              </View>
            ) : null}
          </PressableScale>
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
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    flex1: { flex: 1 },
    subtitle: { marginTop: 2 },
    semibold: { fontWeight: '600' },
    badgeText: { fontWeight: '700' },
    bell: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    bellBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor: c.status.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    avatar: { width: 52, height: 52, borderRadius: radius.pill, backgroundColor: c.skeleton },
    avatarFallback: {
      width: 52,
      height: 52,
      borderRadius: radius.pill,
      backgroundColor: c.background.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    supportAvatar: {
      width: 52,
      height: 52,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: 2 },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    name: { flex: 1 },
    unreadBadge: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: 10,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
