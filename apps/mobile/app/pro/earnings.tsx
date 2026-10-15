import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Icon, IconButton, Button, Card, StatusPill, Divider } from '../../src/components/ui';
import { BarChart, type BarDatum } from '../../src/components';
import { showToast } from '../../src/stores/toastStore';
import { useProviderStore, WEEKLY_EARNINGS, type Payout } from '../../src/stores/providerStore';
import { useTokens, radius, spacing } from '../../src/theme';
import { useMoney } from '../../src/i18n';

export default function ProEarnings() {
  const router = useRouter();
  const t = useTokens();
  const money = useMoney();
  const insets = useSafeAreaInsets();

  const payouts = useProviderStore((s) => s.payouts);
  const weekTotal = useMemo(() => WEEKLY_EARNINGS.reduce((n, w) => n + w.amount, 0), []);
  const chartData = useMemo<BarDatum[]>(
    () => WEEKLY_EARNINGS.map((w) => ({ label: w.label, value: w.amount })),
    [],
  );
  const pending = 148;

  return (
    <View
      style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + spacing.sm }]}
    >
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <Text variant="title2" style={styles.flex1}>
          Earnings & payouts
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: t.primary }]}>
          <Text variant="footnote" tone="onPrimary" style={styles.dim}>
            This week
          </Text>
          <Text variant="display" tone="onPrimary" tabular>
            {money(weekTotal)}
          </Text>
          <View style={styles.pendingRow}>
            <Icon name="clock" size={16} color={t.onPrimary} />
            <Text variant="footnote" tone="onPrimary" style={styles.dim}>
              {money(pending)} pending payout
            </Text>
          </View>
        </View>

        <Card variant="outlined" style={styles.chartCard}>
          <BarChart
            data={chartData}
            height={160}
            formatValue={(v) => money(v)}
            highlightIndex={5}
          />
        </Card>

        <Button
          label="Cash out now"
          icon="banknote"
          style={styles.cashBtn}
          onPress={() => showToast('Payout requested (demo)')}
        />

        <Text variant="headline" style={styles.sectionTitle}>
          Recent payouts
        </Text>
        <Card variant="outlined" padding={spacing.md}>
          {payouts.map((p: Payout, i) => (
            <View key={p.id}>
              <View style={styles.payoutRow}>
                <View style={[styles.payoutIcon, { backgroundColor: t.accentSoft }]}>
                  <Icon name="check-circle" size={20} color={t.success} />
                </View>
                <View style={styles.flex1}>
                  <Text variant="headline" tabular>
                    {money(p.amount)}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {p.date} · {p.id}
                  </Text>
                </View>
                <StatusPill
                  label={p.status === 'paid' ? 'Paid' : 'Pending'}
                  tone={p.status === 'paid' ? 'success' : 'warning'}
                />
              </View>
              {i < payouts.length - 1 ? <Divider /> : null}
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  flex1: { flex: 1 },
  dim: { opacity: 0.9 },
  summaryCard: { padding: spacing.xl, borderRadius: radius.xl, gap: spacing.xs },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  chartCard: { marginTop: spacing.lg },
  cashBtn: { marginTop: spacing.lg },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  payoutIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
