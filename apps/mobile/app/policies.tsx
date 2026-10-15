import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Icon, ScreenHeader, type IconName } from '../src/components/ui';
import { useColors, radius, spacing, type Palette } from '../src/theme';

interface Policy {
  icon: IconName;
  title: string;
  points: string[];
}

const POLICIES: Policy[] = [
  {
    icon: 'clock',
    title: 'Cancellation',
    points: [
      'Free cancellation up to 24 hours before your appointment.',
      'Cancel within 24 hours and a 50% charge may apply.',
      'No-shows are charged in full to compensate the provider.',
    ],
  },
  {
    icon: 'repeat',
    title: 'Rescheduling',
    points: [
      'Reschedule any booking up to 12 hours before, free of charge.',
      'Providers may propose a new time if they’re unavailable.',
    ],
  },
  {
    icon: 'card',
    title: 'Payments & fees',
    points: [
      'A 12% platform fee is added to every booking.',
      'You’re only charged once the provider accepts your request.',
      '“Pay after service” lets you settle on the day.',
    ],
  },
  {
    icon: 'shield-check',
    title: 'Satisfaction guarantee',
    points: [
      'Not happy? Report an issue within 48 hours of the job.',
      'We’ll work with you and the provider to make it right.',
    ],
  },
];

export default function PoliciesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader title="Booking policies" />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="caption" tone="muted">
          These policies keep bookings fair for you and our providers. They apply to every booking
          made on Bookit.
        </Text>
        {POLICIES.map((p) => (
          <View key={p.title} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Icon name={p.icon} size={20} color={c.brand.tint} />
              </View>
              <Text variant="title2">{p.title}</Text>
            </View>
            {p.points.map((point) => (
              <View key={point} style={styles.point}>
                <Icon name="check-circle" size={16} color={c.status.success} />
                <Text variant="caption" tone="muted" style={styles.pointText}>
                  {point}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.xs,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    point: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    pointText: { flex: 1 },
  });
