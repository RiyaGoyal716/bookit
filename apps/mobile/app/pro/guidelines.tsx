import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Accordion, InlineBanner } from '../../src/components';
import { useProviderStore } from '../../src/stores/providerStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

const METRICS = [
  {
    key: 'acceptance',
    label: 'Acceptance rate',
    target: '≥ 85%',
    icon: 'checkmark-done-outline' as const,
  },
  { key: 'response', label: 'Response time', target: '≤ 10 min', icon: 'time-outline' as const },
  { key: 'rating', label: 'Average rating', target: '≥ 4.5★', icon: 'star-outline' as const },
  {
    key: 'cancellation',
    label: 'Cancellation rate',
    target: '≤ 5%',
    icon: 'close-circle-outline' as const,
  },
];

const GUIDELINES = [
  {
    question: 'Be on time, every time',
    answer:
      'Arrive within the agreed window. If you’re running late, message the customer as early as you can from the job screen.',
  },
  {
    question: 'Communicate clearly',
    answer:
      'Reply to messages promptly and confirm details before the job. Good communication is the top driver of 5-star reviews.',
  },
  {
    question: 'Deliver quality work',
    answer:
      'Bring the right equipment, follow the service scope, and leave the space better than you found it.',
  },
  {
    question: 'Keep it professional & safe',
    answer:
      'Treat every customer and home with respect. Never ask to take payment off-platform — it voids your cover and the satisfaction guarantee.',
  },
];

export default function ProGuidelines() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const acceptanceRate = useProviderStore((s) => s.acceptanceRate);
  const rating = useProviderStore((s) => s.rating);
  const warning = acceptanceRate < 85 || rating < 4.5;

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
        <Text style={styles.title}>Pro standards</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {warning ? (
          <InlineBanner
            tone="warning"
            title="Performance needs attention"
            message="One or more of your metrics is below target. Keep it up to stay eligible for priority jobs."
            style={{ marginBottom: spacing.lg }}
          />
        ) : (
          <InlineBanner
            tone="success"
            title="You’re in great standing"
            message="All your metrics meet Bookit’s pro standards. Thank you!"
            style={{ marginBottom: spacing.lg }}
          />
        )}

        <Text style={styles.sectionTitle}>Performance targets</Text>
        <View style={styles.metricGrid}>
          {METRICS.map((m) => (
            <View key={m.key} style={styles.metricTile}>
              <Ionicons name={m.icon} size={18} color={c.brand.tint} />
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text style={styles.metricTarget}>{m.target}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>The Bookit pro code</Text>
        <Accordion items={GUIDELINES} />
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
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    title: { flex: 1, ...typography.scale.h2, color: c.text.primary },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    metricTile: {
      width: '47%',
      flexGrow: 1,
      gap: 2,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    metricLabel: { ...typography.scale.smallMedium, color: c.text.primary, marginTop: spacing.xs },
    metricTarget: { ...typography.scale.caption, color: c.brand.tint },
  });
