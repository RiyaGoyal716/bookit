import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Icon, IconButton, Button, EmptyState } from '../../src/components/ui';
import { Logo } from '../../src/brand';
import { useBookingsStore, RECURRENCE_LABEL } from '../../src/stores/bookingsStore';
import { showToast } from '../../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';
import { useMoney } from '../../src/i18n';

export default function InvoiceScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === id));

  if (!booking) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          variant="subtle"
          size={24}
          style={styles.back}
        />
        <EmptyState art="error" title="Invoice not found" />
      </View>
    );
  }

  const shareInvoice = () => {
    Share.share({
      message: [
        `Bookit invoice ${booking.id}`,
        `${booking.providerName} — ${booking.serviceName}`,
        `${booking.date} at ${booking.time}`,
        `Subtotal ${money(booking.price)}`,
        `Platform fee ${money(booking.fee)}`,
        `Total ${money(booking.total)}`,
      ].join('\n'),
    }).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          variant="subtle"
          size={24}
        />
        <Text variant="title2">Invoice</Text>
        <IconButton
          name="share"
          onPress={shareInvoice}
          accessibilityLabel="Share invoice"
          variant="subtle"
          size={20}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.paper}>
          <View style={styles.paperTop}>
            <Logo size={28} />
            <View style={styles.paidTag}>
              <Icon name="check-circle" size={16} color={c.status.success} />
              <Text variant="caption" tone="success" style={styles.paidText}>
                {booking.status === 'Completed' ? 'Paid' : 'Issued'}
              </Text>
            </View>
          </View>

          <Text variant="title2" style={styles.invoiceNo}>
            Invoice {booking.id}
          </Text>
          <Text variant="footnote" tone="muted">
            {booking.date}
          </Text>

          <View style={styles.divider} />

          <Row label="Provider" value={booking.providerName} styles={styles} />
          <Row label="Service" value={booking.serviceName} styles={styles} />
          <Row label="When" value={`${booking.date} · ${booking.time}`} styles={styles} />
          {booking.address ? <Row label="Address" value={booking.address} styles={styles} /> : null}
          {booking.recurrence && booking.recurrence !== 'none' ? (
            <Row label="Repeats" value={RECURRENCE_LABEL[booking.recurrence]} styles={styles} />
          ) : null}
          {booking.paymentLabel ? (
            <Row label="Payment" value={booking.paymentLabel} styles={styles} />
          ) : null}

          <View style={styles.divider} />

          <Row label="Subtotal" value={money(booking.price)} styles={styles} />
          <Row label="Platform fee (12%)" value={money(booking.fee)} styles={styles} />

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text variant="headline">Total</Text>
            <Text variant="title1" tone="accent">
              {money(booking.total)}
            </Text>
          </View>

          <Text variant="caption" tone="muted" style={styles.footerNote}>
            This is a demo invoice generated in-app. Bookit Ltd · VAT GB000000000
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Download PDF (demo)"
          icon="arrow-down"
          variant="secondary"
          style={styles.flex1}
          onPress={() => showToast('Invoice saved to your device (demo)')}
        />
        <Button label="Share" icon="share" style={styles.flex1} onPress={shareInvoice} />
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text variant="footnote" tone="muted" style={styles.rowLabel}>
        {label}
      </Text>
      <Text variant="footnote" style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: spacing.xs },
    paper: {
      padding: spacing.xl,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.sm,
    },
    paperTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    paidTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 3,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.status.successSoft,
    },
    paidText: {
      fontWeight: '700',
    },
    invoiceNo: { marginTop: spacing.md },
    divider: { height: 1, backgroundColor: c.border, marginVertical: spacing.sm },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.lg,
      paddingVertical: 2,
    },
    rowLabel: { flexShrink: 1 },
    rowValue: {
      flex: 1,
      textAlign: 'right',
      fontWeight: '600',
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerNote: { marginTop: spacing.lg },
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
    flex1: { flex: 1 },
  });
