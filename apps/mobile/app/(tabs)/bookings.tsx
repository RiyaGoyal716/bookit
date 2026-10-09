import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Card, EmptyState } from '../../src/components';
import { useBookingsStore, type Booking } from '../../src/stores/bookingsStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

type Segment = 'upcoming' | 'past';

export default function BookingsScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const bookings = useBookingsStore((s) => s.bookings);
  const [segment, setSegment] = useState<Segment>('upcoming');

  const filtered = useMemo(
    () =>
      bookings.filter((b) =>
        segment === 'past' ? b.status === 'Completed' : b.status !== 'Completed',
      ),
    [bookings, segment],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.headerBlock}>
        <Text style={styles.heading}>Your bookings</Text>
        <Text style={styles.subtitle}>Track every job in one place</Text>

        <View style={styles.segment}>
          {(['upcoming', 'past'] as Segment[]).map((s) => {
            const active = segment === s;
            return (
              <Pressable
                key={s}
                onPress={() => setSegment(s)}
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={s === 'upcoming' ? 'Upcoming bookings' : 'Past bookings'}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {s === 'upcoming' ? 'Upcoming' : 'Past'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            title={segment === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            message={
              segment === 'upcoming'
                ? 'Book a provider and it’ll show up here.'
                : 'Completed jobs will appear here.'
            }
            actionLabel={segment === 'upcoming' ? 'Find a provider' : undefined}
            onAction={segment === 'upcoming' ? () => router.push('/(tabs)') : undefined}
          />
        }
        renderItem={({ item }: { item: Booking }) => (
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
              <Text style={styles.price}>£{item.total}</Text>
            </View>
            <Text style={styles.bookingId}>{item.id}</Text>
          </Card>
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
    card: {
      gap: spacing.xs,
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
    bookingId: {
      marginTop: spacing.xs,
      ...typography.scale.caption,
      color: c.text.muted,
      letterSpacing: 0.5,
    },
  });
