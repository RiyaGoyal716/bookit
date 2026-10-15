import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Text,
  Icon,
  IconButton,
  Banner,
  PressableScale,
  type IconName,
} from '../../src/components/ui';
import { useProviderStore } from '../../src/stores/providerStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';

const METRICS: { key: string; label: string; target: string; icon: IconName }[] = [
  {
    key: 'acceptance',
    label: 'Acceptance rate',
    target: '≥ 85%',
    icon: 'check-all',
  },
  { key: 'response', label: 'Response time', target: '≤ 10 min', icon: 'clock' },
  { key: 'rating', label: 'Average rating', target: '≥ 4.5', icon: 'star' },
  {
    key: 'cancellation',
    label: 'Cancellation rate',
    target: '≤ 5%',
    icon: 'close-circle',
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

  const [open, setOpen] = useState<number | null>(0);

  const acceptanceRate = useProviderStore((s) => s.acceptanceRate);
  const rating = useProviderStore((s) => s.rating);
  const warning = acceptanceRate < 85 || rating < 4.5;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          Pro standards
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerWrap}>
          {warning ? (
            <Banner
              tone="warning"
              title="Performance needs attention"
              message="One or more of your metrics is below target. Keep it up to stay eligible for priority jobs."
            />
          ) : (
            <Banner
              tone="info"
              title="You’re in great standing"
              message="All your metrics meet Bookit’s pro standards. Thank you!"
            />
          )}
        </View>

        <Text variant="title2" style={styles.sectionTitle}>
          Performance targets
        </Text>
        <View style={styles.metricGrid}>
          {METRICS.map((m) => (
            <View key={m.key} style={styles.metricTile}>
              <Icon name={m.icon} size={20} color={c.brand.tint} />
              <Text variant="footnote" style={styles.metricLabel}>
                {m.label}
              </Text>
              <Text variant="caption" tone="accent">
                {m.target}
              </Text>
            </View>
          ))}
        </View>

        <Text variant="title2" style={styles.sectionTitle}>
          The Bookit pro code
        </Text>
        <View style={styles.accordion}>
          {GUIDELINES.map((item, i) => {
            const expanded = open === i;
            return (
              <View key={item.question} style={styles.accordionItem}>
                <PressableScale
                  style={styles.accordionHeader}
                  haptic="selection"
                  onPress={() => setOpen(expanded ? null : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityLabel={item.question}
                >
                  <Text variant="headline" style={styles.flex1}>
                    {item.question}
                  </Text>
                  <Icon
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={c.text.muted}
                  />
                </PressableScale>
                {expanded ? (
                  <Text variant="body" tone="muted" style={styles.accordionBody}>
                    {item.answer}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
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
    title: { flex: 1 },
    bannerWrap: { marginBottom: spacing.lg },
    sectionTitle: {
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
    metricLabel: { marginTop: spacing.xs },
    accordion: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      overflow: 'hidden',
    },
    accordionItem: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    accordionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    flex1: { flex: 1 },
    accordionBody: { marginTop: spacing.sm },
  });
