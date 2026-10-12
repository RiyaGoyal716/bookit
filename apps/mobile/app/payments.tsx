import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

interface Card {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CARDS: Card[] = [
  { id: 'visa', brand: 'Visa', last4: '4242', expiry: '08/27', icon: 'card' },
  { id: 'mc', brand: 'Mastercard', last4: '5307', expiry: '11/26', icon: 'card' },
];

const WALLETS = [
  { id: 'applepay', label: 'Apple Pay', icon: 'logo-apple' as const },
  { id: 'googlepay', label: 'Google Pay', icon: 'logo-google' as const },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [defaultId, setDefaultId] = useState('visa');

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
        <Text style={styles.title}>Payment methods</Text>
        <View style={styles.back} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Cards</Text>
        <View style={styles.card}>
          {CARDS.map((cardItem, i) => {
            const selected = defaultId === cardItem.id;
            return (
              <Pressable
                key={cardItem.id}
                style={[styles.row, i < CARDS.length - 1 && styles.rowDivider]}
                onPress={() => setDefaultId(cardItem.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${cardItem.brand} ending ${cardItem.last4}`}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name={cardItem.icon} size={20} color={c.brand.tint} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>
                    {cardItem.brand} •••• {cardItem.last4}
                  </Text>
                  <Text style={styles.rowSub}>Expires {cardItem.expiry}</Text>
                </View>
                {selected ? (
                  <View style={styles.defaultTag}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                ) : (
                  <Ionicons name="radio-button-off" size={20} color={c.text.muted} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Wallets</Text>
        <View style={styles.card}>
          {WALLETS.map((w, i) => (
            <Pressable
              key={w.id}
              style={[styles.row, i < WALLETS.length - 1 && styles.rowDivider]}
              onPress={() => showToast(`${w.label} will be available at checkout`)}
              accessibilityRole="button"
              accessibilityLabel={w.label}
            >
              <View style={styles.cardIcon}>
                <Ionicons name={w.icon} size={20} color={c.text.primary} />
              </View>
              <Text style={styles.rowTitle}>{w.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
            </Pressable>
          ))}
        </View>

        <Button
          label="Add a new card"
          variant="secondary"
          icon="add"
          style={styles.addBtn}
          onPress={() => showToast('Add card is not available in the demo')}
        />

        <View style={styles.secureNote}>
          <Ionicons name="lock-closed" size={14} color={c.text.muted} />
          <Text style={styles.secureText}>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.scale.h2, color: c.text.primary },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
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
    rowTitle: { flex: 1, ...typography.scale.bodyMedium, color: c.text.primary },
    rowSub: { ...typography.scale.caption, color: c.text.muted },
    defaultTag: {
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
    },
    defaultText: {
      ...typography.scale.caption,
      color: c.brand.tint,
      fontFamily: typography.font.semibold,
      fontWeight: '600',
    },
    addBtn: { marginTop: spacing.xl },
    secureNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    secureText: { flex: 1, ...typography.scale.caption, color: c.text.muted },
  });
