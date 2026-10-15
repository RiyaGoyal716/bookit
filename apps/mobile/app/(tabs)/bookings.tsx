import { useMemo, useState } from 'react';
import { View, StyleSheet, Share } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Card,
  ContextMenu,
  EmptyState,
  Icon,
  LogoRefresh,
  PressableScale,
  StatusPill,
  Text,
  type StatusTone,
  type ContextMenuAction,
} from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { useBookingsStore, type Booking, type BookingStatus } from '../../src/stores/bookingsStore';
import { useCartStore } from '../../src/stores/cartStore';
import { showToast } from '../../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';
import { useMoney } from '../../src/i18n';

type Segment = 'upcoming' | 'completed' | 'cancelled';

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_TONE: Record<BookingStatus, StatusTone> = {
  Requested: 'info',
  Accepted: 'accent',
  'On the way': 'warning',
  Completed: 'success',
  Cancelled: 'danger',
};

export default function BookingsScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const bookings = useBookingsStore((s) => s.bookings);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clear);
  const [segment, setSegment] = useState<Segment>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  // Smart rebook: same pro + service (+ address via the default), straight to checkout.
  const rebook = (b: Booking) => {
    clearCart();
    addItem({
      key: b.serviceName,
      providerId: b.providerId,
      providerName: b.providerName,
      name: b.serviceName,
      price: b.price,
      durationMin: 60,
    });
    showToast(`Rebooking ${b.serviceName}`);
    router.push(route('/checkout'));
  };

  const actionsFor = (b: Booking): ContextMenuAction[] => {
    const list: ContextMenuAction[] = [
      {
        icon: 'calendar',
        label: 'View details',
        onPress: () => router.push(route(`/booking-detail/${b.id}`)),
      },
      {
        icon: 'share',
        label: 'Share',
        onPress: () => {
          Share.share({
            message: `My Bookit booking with ${b.providerName}: ${b.serviceName}`,
          }).catch(() => {});
        },
      },
    ];
    if (b.status === 'Completed') {
      list.unshift({ icon: 'repeat', label: 'Rebook (same pro)', onPress: () => rebook(b) });
    }
    return list;
  };

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
      <LogoRefresh refreshing={refreshing} topInset={insets.top} />
      <View style={styles.headerBlock}>
        <Text variant="title1">Your bookings</Text>
        <Text variant="body" tone="muted" style={styles.subtitle}>
          Track every job in one place
        </Text>

        <View style={styles.segment}>
          {SEGMENTS.map((s) => {
            const active = segment === s.key;
            return (
              <PressableScale
                key={s.key}
                onPress={() => setSegment(s.key)}
                haptic="selection"
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${s.label} bookings`}
              >
                <Text
                  variant="footnote"
                  tone={active ? 'default' : 'subtle'}
                  style={styles.semibold}
                >
                  {s.label}
                </Text>
              </PressableScale>
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
        renderItem={({ item }: { item: Booking }) => (
          <ContextMenu
            onPress={() => router.push(route(`/booking-detail/${item.id}`))}
            actions={actionsFor(item)}
            accessibilityLabel={`${item.providerName}, ${item.serviceName}, ${item.status}`}
          >
            <Card style={styles.card}>
              <View style={styles.rowTop}>
                <Text variant="headline" style={styles.provider} numberOfLines={1}>
                  {item.providerName}
                </Text>
                <StatusPill label={item.status} tone={STATUS_TONE[item.status]} />
              </View>
              <Text variant="caption" tone="muted">
                {item.serviceName}
              </Text>
              <View style={styles.metaRow}>
                <Icon name="calendar" size={16} color={c.text.muted} />
                <Text variant="caption" tone="muted">
                  {item.date} · {item.time}
                </Text>
                <Text variant="caption" tone="subtle" style={styles.dot}>
                  ·
                </Text>
                <Text variant="footnote" tone="accent" tabular style={styles.semibold}>
                  {money(item.total)}
                </Text>
                <View style={styles.chevronWrap}>
                  <Icon name="chevron-right" size={16} color={c.text.muted} />
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text variant="caption" tone="subtle" style={styles.bookingId}>
                  {item.id}
                </Text>
                {item.status === 'Accepted' || item.status === 'On the way' ? (
                  <PressableScale
                    style={styles.trackPill}
                    onPress={() => router.push(route(`/tracking/${item.id}`))}
                    accessibilityRole="button"
                    accessibilityLabel={`Track ${item.providerName} live`}
                  >
                    <Icon name="navigation" size={16} color={c.text.inverse} />
                    <Text variant="caption" tone="onPrimary" style={styles.trackPillText}>
                      Track live
                    </Text>
                  </PressableScale>
                ) : null}
                {item.status === 'Completed' ? (
                  <PressableScale
                    style={[styles.trackPill, { backgroundColor: c.brand.primarySoft }]}
                    onPress={() => rebook(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Rebook ${item.serviceName} with ${item.providerName}`}
                  >
                    <Icon name="repeat" size={16} color={c.brand.tint} />
                    <Text variant="caption" tone="accent" style={styles.trackPillText}>
                      Rebook
                    </Text>
                  </PressableScale>
                ) : null}
              </View>
            </Card>
          </ContextMenu>
        )}
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
    semibold: { fontWeight: '600' },
    subtitle: {
      marginTop: 2,
      marginBottom: spacing.lg,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: c.background.muted,
      borderRadius: radius.pill,
      padding: 4,
      gap: 4,
    },
    segmentBtn: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
    },
    segmentBtnActive: {
      backgroundColor: c.background.surface,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    separator: { height: spacing.md },
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
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.xs,
    },
    dot: {
      marginHorizontal: 2,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
    },
    bookingId: {
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
      fontWeight: '700',
    },
  });
