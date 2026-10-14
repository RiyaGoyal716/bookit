import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, type LayoutChangeEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Swipeable } from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Card, EmptyState, PressableScale, Reveal } from '../../src/components';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import { useBookingsStore, type Booking } from '../../src/stores/bookingsStore';
import { useColors, radius, shadow, spacing, typography, type Palette } from '../../src/theme';
import { useMoney } from '../../src/i18n';

type Segment = 'upcoming' | 'completed' | 'cancelled';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const bookings = useBookingsStore((s) => s.bookings);
  const cancelBooking = useBookingsStore((s) => s.cancelBooking);
  const [segment, setSegment] = useState<Segment>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [segW, setSegW] = useState(0);

  const activeIndex = SEGMENTS.findIndex((s) => s.key === segment);
  const slotW = segW > 0 ? (segW - 8) / SEGMENTS.length : 0;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const onSegLayout = (e: LayoutChangeEvent) => setSegW(e.nativeEvent.layout.width);

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        if (segment === 'completed') return b.status === 'Completed';
        if (segment === 'cancelled') return b.status === 'Cancelled';
        return b.status !== 'Completed' && b.status !== 'Cancelled';
      }),
    [bookings, segment],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.headerBlock}>
        <Text style={styles.heading}>Your bookings</Text>
        <Text style={styles.subtitle}>Track every job in one place</Text>

        <View style={styles.segment} onLayout={onSegLayout}>
          {slotW > 0 ? (
            <MotiView
              style={[styles.segmentIndicator, { width: slotW }]}
              animate={{ translateX: activeIndex * slotW }}
              transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            />
          ) : null}
          {SEGMENTS.map((s) => {
            const active = segment === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSegment(s.key)}
                style={styles.segmentBtn}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${s.label} bookings`}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlashList
        data={filtered}
        keyExtractor={(b: Booking) => b.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title={
              segment === 'upcoming'
                ? 'No upcoming bookings'
                : segment === 'completed'
                  ? 'No completed bookings'
                  : 'No cancelled bookings'
            }
            message={
              segment === 'upcoming'
                ? 'Book a provider and it’ll show up here.'
                : segment === 'completed'
                  ? 'Completed jobs will appear here.'
                  : 'Cancelled bookings will appear here.'
            }
            actionLabel={segment === 'upcoming' ? 'Find a provider' : undefined}
            onAction={segment === 'upcoming' ? () => router.push('/(tabs)') : undefined}
          />
        }
        renderItem={({ item, index }: { item: Booking; index: number }) => {
          const canManage = item.status !== 'Completed' && item.status !== 'Cancelled';
          const onCancel = () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            cancelBooking(item.id);
            showToast('Booking cancelled');
          };
          const card = (
            <PressableScale
              haptic="none"
              onPress={() => router.push(route(`/booking-detail/${item.id}`))}
              accessibilityRole="button"
              accessibilityLabel={`${item.providerName}, ${item.serviceName}, ${item.status}`}
            >
              <Card style={styles.card}>
                <View style={styles.rowTop}>
                  <Text style={styles.provider} numberOfLines={1}>
                    {item.providerName}
                  </Text>
                  <Badge status={item.status} />
                </View>
                <Text style={styles.service}>{item.serviceName}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={c.text.muted} />
                  <Text style={styles.meta}>
                    {item.date} · {item.time}
                  </Text>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.price}>{money(item.total)}</Text>
                  <View style={styles.chevronWrap}>
                    <Ionicons name="chevron-forward" size={16} color={c.text.muted} />
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.bookingId}>{item.id}</Text>
                  {item.status === 'Accepted' || item.status === 'On the way' ? (
                    <PressableScale
                      style={styles.trackPill}
                      onPress={() => router.push(route(`/tracking/${item.id}`))}
                      accessibilityRole="button"
                      accessibilityLabel={`Track ${item.providerName} live`}
                    >
                      <Ionicons name="navigate" size={13} color={c.text.inverse} />
                      <Text style={styles.trackPillText}>Track live</Text>
                    </PressableScale>
                  ) : null}
                </View>
              </Card>
            </PressableScale>
          );
          return (
            <Reveal index={Math.min(index, 8)}>
              {canManage ? (
                <Swipeable
                  friction={1.6}
                  rightThreshold={40}
                  overshootRight={false}
                  renderRightActions={() => (
                    <View style={styles.swipeActions}>
                      <Pressable
                        style={[styles.swipeAction, styles.swipeReschedule]}
                        onPress={() => router.push(route(`/booking-detail/${item.id}`))}
                        accessibilityRole="button"
                        accessibilityLabel={`Reschedule ${item.providerName}`}
                      >
                        <Ionicons name="calendar" size={18} color={c.text.inverse} />
                        <Text style={styles.swipeActionText}>Reschedule</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.swipeAction, styles.swipeCancel]}
                        onPress={onCancel}
                        accessibilityRole="button"
                        accessibilityLabel={`Cancel ${item.providerName}`}
                      >
                        <Ionicons name="close-circle" size={18} color={c.text.inverse} />
                        <Text style={styles.swipeActionText}>Cancel</Text>
                      </Pressable>
                    </View>
                  )}
                >
                  {card}
                </Swipeable>
              ) : (
                card
              )}
            </Reveal>
          );
        }}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background.base,
    },
    headerBlock: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    heading: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      marginTop: 2,
      marginBottom: spacing.lg,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: c.background.muted,
      borderRadius: radius.pill,
      padding: 4,
    },
    segmentIndicator: {
      position: 'absolute',
      top: 4,
      bottom: 4,
      left: 4,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      ...shadow.soft,
    },
    segmentBtn: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
    },
    segmentText: {
      ...typography.scale.smallMedium,
      color: c.text.muted,
    },
    segmentTextActive: {
      color: c.text.primary,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    separator: { height: spacing.md },
    swipeActions: {
      flexDirection: 'row',
      alignItems: 'stretch',
      marginLeft: spacing.sm,
      gap: spacing.sm,
    },
    swipeAction: {
      width: 92,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    swipeReschedule: { backgroundColor: c.brand.primary },
    swipeCancel: { backgroundColor: c.status.danger },
    swipeActionText: {
      ...typography.scale.caption,
      color: c.text.inverse,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    card: {
      gap: spacing.xs,
    },
    chevronWrap: {
      flex: 1,
      alignItems: 'flex-end',
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    provider: {
      flex: 1,
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    service: {
      ...typography.scale.small,
      color: c.text.secondary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.xs,
    },
    meta: {
      ...typography.scale.small,
      color: c.text.secondary,
    },
    dot: {
      color: c.text.muted,
      marginHorizontal: 2,
    },
    price: {
      ...typography.scale.smallMedium,
      color: c.brand.tint,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    bookingId: {
      ...typography.scale.caption,
      color: c.text.muted,
      letterSpacing: 0.5,
    },
    trackPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
    },
    trackPillText: {
      ...typography.scale.caption,
      color: c.text.inverse,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
  });
