import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarChart, type BarDatum } from '../src/components';
import { Button, Text, Icon, IconButton } from '../src/components/ui';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useWalletStore, type WalletTransaction } from '../src/stores/walletStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';
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
        <IconButton
          name="chevron-left"
          size={24}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          Wallet
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text variant="caption" tone="inverse" style={styles.balanceLabel}>
            Available balance
          </Text>
          <Text variant="display" tone="inverse">
            {money(balance)}
          </Text>
          <View style={styles.balanceActions}>
            <Button
              label="Top up"
              icon="plus"
              variant="secondary"
              style={styles.balanceBtn}
              onPress={() => {
                credit('Top up', 20);
                showToast(`${money(20)} added to your wallet`);
              }}
            />
            <Button
              label="Redeem code"
              icon="gift"
              variant="secondary"
              style={styles.balanceBtn}
              onPress={() => router.push(route('/referrals'))}
            />
          </View>
        </View>

        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Activity
        </Text>
        <View style={styles.card}>
          <BarChart
            data={chartData}
            height={150}
            formatValue={(v) => money(v)}
            highlightIndex={4}
          />
        </View>

        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Transactions
        </Text>
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
                <Icon
                  name={t.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={t.type === 'credit' ? c.status.success : c.text.muted}
                />
              </View>
              <View style={styles.txnInfo}>
                <Text variant="headline">{t.label}</Text>
                <Text variant="caption" tone="muted">
                  {t.date}
                </Text>
              </View>
              <Text variant="headline" tone={t.type === 'credit' ? 'success' : 'default'}>
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
    title: { flex: 1 },
    balanceCard: {
      padding: spacing.xl,
      borderRadius: radius.xl,
      backgroundColor: c.brand.primary,
      gap: spacing.xs,
    },
    balanceLabel: { opacity: 0.85 },
    balanceActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    balanceBtn: { flex: 1 },
    sectionLabel: {
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
  });
