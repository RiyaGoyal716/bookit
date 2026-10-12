import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

interface Policy {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  points: string[];
}

const POLICIES: Policy[] = [
  {
    icon: 'time-outline',
    title: 'Cancellation',
    points: [
      'Free cancellation up to 24 hours before your appointment.',
      'Cancel within 24 hours and a 50% charge may apply.',
      'No-shows are charged in full to compensate the provider.',
    ],
  },
  {
    icon: 'repeat-outline',
    title: 'Rescheduling',
    points: [
      'Reschedule any booking up to 12 hours before, free of charge.',
      'Providers may propose a new time if they’re unavailable.',
    ],
  },
  {
    icon: 'card-outline',
    title: 'Payments & fees',
    points: [
      'A 12% platform fee is added to every booking.',
      'You’re only charged once the provider accepts your request.',
      '“Pay after service” lets you settle on the day.',
    ],
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Satisfaction guarantee',
    points: [
      'Not happy? Report an issue within 48 hours of the job.',
      'We’ll work with you and the provider to make it right.',
    ],
  },
];

export default function PoliciesScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Booking policies</Text>
        <View style={styles.back} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          These policies keep bookings fair for you and our providers. They apply to every booking
          made on Bookit.
        </Text>
        {POLICIES.map((p) => (
          <View key={p.title} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Ionicons name={p.icon} size={20} color={c.brand.tint} />
              </View>
              <Text style={styles.cardTitle}>{p.title}</Text>
            </View>
            {p.points.map((point) => (
              <View key={point} style={styles.point}>
                <Ionicons name="checkmark-circle" size={16} color={c.status.success} />
                <Text style={styles.pointText}>{point}</Text>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.scale.h2, color: c.text.primary },
    intro: { ...typography.scale.small, color: c.text.secondary },
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
    cardTitle: { ...typography.scale.h2, color: c.text.primary },
    point: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    pointText: { flex: 1, ...typography.scale.small, color: c.text.secondary },
  });
