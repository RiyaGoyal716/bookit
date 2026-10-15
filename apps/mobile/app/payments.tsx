import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Icon,
  PressableScale,
  ScreenHeader,
  StatusPill,
  Text,
  type IconName,
} from '../src/components/ui';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

interface Card {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  icon: IconName;
}

const CARDS: Card[] = [
  { id: 'visa', brand: 'Visa', last4: '4242', expiry: '08/27', icon: 'card' },
  { id: 'mc', brand: 'Mastercard', last4: '5307', expiry: '11/26', icon: 'card' },
];

const WALLETS = [
  { id: 'applepay', label: 'Apple Pay', icon: 'wallet' as const },
  { id: 'googlepay', label: 'Google Pay', icon: 'wallet' as const },
];

export default function PaymentsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [defaultId, setDefaultId] = useState('visa');

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader title="Payment methods" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Cards
        </Text>
        <View style={styles.card}>
          {CARDS.map((cardItem, i) => {
            const selected = defaultId === cardItem.id;
            return (
              <PressableScale
                key={cardItem.id}
                style={[styles.row, i < CARDS.length - 1 && styles.rowDivider]}
                onPress={() => setDefaultId(cardItem.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${cardItem.brand} ending ${cardItem.last4}`}
              >
                <View style={styles.cardIcon}>
                  <Icon name={cardItem.icon} size={20} color={c.brand.tint} />
                </View>
                <View style={styles.rowInfo}>
                  <Text variant="headline">
                    {cardItem.brand} •••• {cardItem.last4}
                  </Text>
                  <Text variant="caption" tone="muted">
                    Expires {cardItem.expiry}
                  </Text>
                </View>
                {selected ? (
                  <StatusPill label="Default" tone="accent" />
                ) : (
                  <Icon name="circle" size={20} color={c.text.muted} />
                )}
              </PressableScale>
            );
          })}
        </View>

        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Wallets
        </Text>
        <View style={styles.card}>
          {WALLETS.map((w, i) => (
            <PressableScale
              key={w.id}
              style={[styles.row, i < WALLETS.length - 1 && styles.rowDivider]}
              onPress={() => showToast(`${w.label} will be available at checkout`)}
              accessibilityRole="button"
              accessibilityLabel={w.label}
            >
              <View style={styles.cardIcon}>
                <Icon name={w.icon} size={20} color={c.text.primary} />
              </View>
              <Text variant="headline" style={styles.rowTitle}>
                {w.label}
              </Text>
              <Icon name="chevron-right" size={20} color={c.text.muted} />
            </PressableScale>
          ))}
        </View>

        <Button
          label="Add a new card"
          variant="secondary"
          icon="plus"
          style={styles.addBtn}
          onPress={() => showToast('Add card is not available in the demo')}
        />

        <View style={styles.secureNote}>
          <Icon name="lock" size={16} color={c.text.muted} />
          <Text variant="caption" tone="muted" style={styles.secureText}>
            Your payment details are encrypted and never shared with providers.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    sectionLabel: {
      marginBottom: spacing.sm,
      marginTop: spacing.lg,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: c.border },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowInfo: { flex: 1, gap: 2 },
    rowTitle: { flex: 1 },
    addBtn: { marginTop: spacing.xl },
    secureNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    secureText: { flex: 1 },
  });
