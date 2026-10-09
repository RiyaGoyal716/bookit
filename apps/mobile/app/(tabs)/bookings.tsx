import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge, Card, EmptyState } from '../../src/components';
import { useBookingsStore } from '../../src/stores/bookingsStore';
import { colors, spacing, typography } from '../../src/theme';

export default function BookingsScreen() {
  const bookings = useBookingsStore((s) => s.bookings);

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Your bookings</Text>
            <Text style={styles.subtitle}>Track every job in one place</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="No bookings yet"
            message="Book a provider and it'll show up here."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.rowTop}>
              <Text style={styles.provider} numberOfLines={1}>
                {item.providerName}
              </Text>
              <Badge status={item.status} />
            </View>
            <Text style={styles.service}>{item.serviceName}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
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
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
  },
  service: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  dot: {
    color: colors.text.muted,
    marginHorizontal: 2,
  },
  price: {
    fontSize: typography.fontSize.sm,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  bookingId: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
});
