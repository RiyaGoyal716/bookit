import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BarChart, Button, type BarDatum } from '../../src/components';
import { showToast } from '../../src/stores/toastStore';
import { useProviderStore, WEEKLY_EARNINGS, type Payout } from '../../src/stores/providerStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';
import { useMoney } from '../../src/i18n';

export default function ProEarnings() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const payouts = useProviderStore((s) => s.payouts);
  const weekTotal = useMemo(() => WEEKLY_EARNINGS.reduce((n, w) => n + w.amount, 0), []);
  const chartData = useMemo<BarDatum[]>(
    () => WEEKLY_EARNINGS.map((w) => ({ label: w.label, value: w.amount })),
    [],
  );
  const pending = 148;

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
        <Text style={styles.title}>Earnings & payouts</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This week</Text>
          <Text style={styles.summaryValue}>{money(weekTotal)}</Text>
          <View style={styles.pendingRow}>
            <Ionicons name="time-outline" size={14} color={c.text.inverse} />
            <Text style={styles.pendingText}>{money(pending)} pending payout</Text>
          </View>
        </View>

        <View style={styles.card}>
          <BarChart
            data={chartData}
            height={160}
            formatValue={(v) => money(v)}
            highlightIndex={5}
          />
        </View>

        <Button
          label="Cash out now"
          icon="cash"
          style={styles.cashBtn}
          onPress={() => showToast('Payout requested (demo)')}
        />

        <Text style={styles.sectionTitle}>Recent payouts</Text>
        <View style={styles.card}>
          {payouts.map((p: Payout, i) => (
            <View key={p.id} style={[styles.payoutRow, i < payouts.length - 1 && styles.divider]}>
              <View style={styles.payoutIcon}>
                <Ionicons name="checkmark-circle" size={18} color={c.status.success} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.payoutAmount}>{money(p.amount)}</Text>
                <Text style={styles.payoutDate}>
                  {p.date} · {p.id}
                </Text>
              </View>
              <View style={styles.paidTag}>
                <Text style={styles.paidText}>{p.status === 'paid' ? 'Paid' : 'Pending'}</Text>
              </View>
            </View>
          ))}
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
    title: { flex: 1, ...typography.scale.h2, color: c.text.primary },
    summaryCard: {
      padding: spacing.xl,
      borderRadius: radius.xl,
      backgroundColor: c.brand.primary,
      gap: spacing.xs,
    },
    summaryLabel: { ...typography.scale.small, color: c.text.inverse, opacity: 0.85 },
    summaryValue: { ...typography.scale.hero, color: c.text.inverse },
    pendingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    pendingText: { ...typography.scale.small, color: c.text.inverse, opacity: 0.9 },
    card: {
      marginTop: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
    },
    cashBtn: { marginTop: spacing.lg },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    payoutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    payoutIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      backgroundColor: c.status.successSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flex1: { flex: 1 },
    payoutAmount: { ...typography.scale.bodyMedium, color: c.text.primary },
    payoutDate: { ...typography.scale.caption, color: c.text.muted },
    paidTag: {
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.status.successSoft,
    },
    paidText: {
      ...typography.scale.caption,
      color: c.status.success,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
  });
