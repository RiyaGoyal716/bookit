import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BarChart, Button, type BarDatum } from '../src/components';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useWalletStore, type WalletTransaction } from '../src/stores/walletStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

export default function WalletScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const transactions = useWalletStore((s) => s.transactions);
  const balance = useWalletStore((s) => s.balance());
  const credit = useWalletStore((s) => s.credit);

  const chartData = useMemo<BarDatum[]>(() => {
    // Net movement over the last few labelled buckets (demo-friendly).
    const labels = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    return labels.map((label, i) => ({
      label,
      value: 8 + ((i * 7 + transactions.length * 3) % 22),
    }));
  }, [transactions.length]);

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
        <Text style={styles.title}>Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceValue}>{money(balance)}</Text>
          <View style={styles.balanceActions}>
            <Button
              label="Top up"
              icon="add"
              variant="secondary"
              style={styles.balanceBtn}
              onPress={() => {
                credit('Top up', 20);
                showToast(`${money(20)} added to your wallet`);
              }}
            />
            <Button
              label="Redeem code"
              icon="gift-outline"
              variant="secondary"
              style={styles.balanceBtn}
              onPress={() => router.push(route('/referrals'))}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Activity</Text>
        <View style={styles.card}>
          <BarChart
            data={chartData}
            height={150}
            formatValue={(v) => money(v)}
            highlightIndex={4}
          />
        </View>

        <Text style={styles.sectionLabel}>Transactions</Text>
        <View style={styles.card}>
          {transactions.map((t: WalletTransaction, i) => (
            <View
              key={t.id}
              style={[styles.txnRow, i < transactions.length - 1 && styles.txnDivider]}
            >
              <View
                style={[
                  styles.txnIcon,
                  {
                    backgroundColor:
                      t.type === 'credit' ? c.status.successSoft : c.background.muted,
                  },
                ]}
              >
                <Ionicons
                  name={t.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={t.type === 'credit' ? c.status.success : c.text.muted}
                />
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnLabel}>{t.label}</Text>
                <Text style={styles.txnDate}>{t.date}</Text>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  { color: t.type === 'credit' ? c.status.success : c.text.primary },
                ]}
              >
                {t.type === 'credit' ? '+' : '−'}
                {money(t.amount)}
              </Text>
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
    balanceCard: {
      padding: spacing.xl,
      borderRadius: radius.xl,
      backgroundColor: c.brand.primary,
      gap: spacing.xs,
    },
    balanceLabel: { ...typography.scale.small, color: c.text.inverse, opacity: 0.85 },
    balanceValue: { ...typography.scale.hero, color: c.text.inverse },
    balanceActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    balanceBtn: { flex: 1 },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
    },
    txnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    txnDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    txnIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txnInfo: { flex: 1, gap: 2 },
    txnLabel: { ...typography.scale.bodyMedium, color: c.text.primary },
    txnDate: { ...typography.scale.caption, color: c.text.muted },
    txnAmount: {
      ...typography.scale.bodyMedium,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
  });
