import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  Button,
  EmptyState,
  TextField,
  Text,
  Icon,
  IconButton,
  PressableScale,
  Chip,
} from '../src/components/ui';
import { getProviderById } from '../src/mocks';
import { route } from '../src/lib/nav';
import { ADD_ONS, computeCart, useCartStore } from '../src/stores/cartStore';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

export default function CartScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const items = useCartStore((s) => s.items);
  const providerId = useCartStore((s) => s.providerId);
  const providerName = useCartStore((s) => s.providerName);
  const addOnIds = useCartStore((s) => s.addOnIds);
  const tip = useCartStore((s) => s.tip);
  const promoApplied = useCartStore((s) => s.promoApplied);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleAddOn = useCartStore((s) => s.toggleAddOn);
  const setTip = useCartStore((s) => s.setTip);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);
  const addItem = useCartStore((s) => s.addItem);
  const breakdown = useMemo(
    () => computeCart({ items, addOnIds, tip, promoApplied }),
    [items, addOnIds, tip, promoApplied],
  );

  const [promo, setPromo] = useState('');

  const provider = providerId ? getProviderById(providerId) : undefined;
  const suggestions = useMemo(() => {
    if (!provider) return [];
    const inCart = new Set(items.map((i) => i.key));
    return provider.services.filter((s) => !inCart.has(s.id ?? s.name)).slice(0, 3);
  }, [provider, items]);

  const tipOptions = useMemo(() => {
    const tenPct = Math.round(breakdown.subtotal * 0.1);
    return [
      { label: 'No tip', value: 0 },
      { label: money(2), value: 2 },
      { label: money(5), value: 5 },
      { label: `10% (${money(tenPct)})`, value: tenPct },
    ];
  }, [breakdown.subtotal, money]);

  const onApplyPromo = () => {
    if (applyPromo(promo)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showToast('Promo applied — 10% off');
    } else {
      showToast('Invalid promo code');
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Your cart" onClose={() => router.back()} styles={styles} insets={insets} />
        <EmptyState
          art="empty"
          title="Your cart is empty"
          message="Browse providers and add a service to get started."
          actionLabel="Explore services"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Your cart" onClose={() => router.back()} styles={styles} insets={insets} />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {provider ? (
          <View style={styles.providerRow}>
            <Icon name="store" size={16} color={c.brand.tint} />
            <Text variant="callout" tone="muted">
              {providerName}
            </Text>
          </View>
        ) : null}

        {/* Items */}
        <View style={styles.card}>
          {items.map((item, i) => (
            <View
              key={item.key}
              style={[styles.itemRow, i < items.length - 1 && styles.itemDivider]}
            >
              <View style={styles.itemInfo}>
                <Text variant="headline">{item.name}</Text>
                <Text variant="caption" tone="subtle">
                  {item.durationMin} min · {money(item.price)}
                </Text>
              </View>
              <View style={styles.stepper}>
                <PressableScale
                  style={styles.stepBtn}
                  onPress={() => decrement(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease ${item.name}`}
                >
                  <Icon
                    name={item.quantity === 1 ? 'trash' : 'minus'}
                    size={16}
                    color={c.brand.tint}
                  />
                </PressableScale>
                <Text variant="headline" style={styles.stepQty}>
                  {item.quantity}
                </Text>
                <PressableScale
                  style={styles.stepBtn}
                  onPress={() => increment(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase ${item.name}`}
                >
                  <Icon name="plus" size={16} color={c.brand.tint} />
                </PressableScale>
              </View>
              <PressableScale
                onPress={() => removeItem(item.key)}
                style={styles.removeBtn}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.name}`}
              >
                <Text variant="headline">{money(item.price * item.quantity)}</Text>
              </PressableScale>
            </View>
          ))}
        </View>

        {/* Frequently added together */}
        {suggestions.length > 0 ? (
          <>
            <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
              Frequently added together
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestRow}
            >
              {suggestions.map((s) => (
                <View key={s.name} style={styles.suggestCard}>
                  <Text variant="callout" numberOfLines={2} style={styles.suggestName}>
                    {s.name}
                  </Text>
                  <Text variant="callout" tone="accent">
                    {money(s.price)}
                  </Text>
                  <PressableScale
                    style={styles.suggestAdd}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      addItem({
                        key: s.id ?? s.name,
                        providerId: provider!.id,
                        providerName: provider!.name,
                        name: s.name,
                        price: s.price,
                        durationMin: s.durationMin,
                      });
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${s.name}`}
                  >
                    <Icon name="plus" size={16} color={c.brand.tint} />
                    <Text variant="callout" tone="accent">
                      Add
                    </Text>
                  </PressableScale>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Add-ons */}
        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Add-ons
        </Text>
        <View style={styles.card}>
          {ADD_ONS.map((a, i) => {
            const selected = addOnIds.includes(a.id);
            return (
              <PressableScale
                key={a.id}
                style={[styles.addOnRow, i < ADD_ONS.length - 1 && styles.itemDivider]}
                onPress={() => toggleAddOn(a.id)}
                haptic="selection"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${a.name}, ${money(a.price)}`}
              >
                <View style={[styles.checkbox, selected && styles.checkboxOn]}>
                  {selected ? <Icon name="check" size={16} color={c.text.inverse} /> : null}
                </View>
                <Text variant="body" style={styles.addOnName}>
                  {a.name}
                </Text>
                <Text variant="callout" tone="muted">
                  +{money(a.price)}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Tip */}
        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Add a tip
        </Text>
        <View style={styles.tipRow}>
          {tipOptions.map((opt) => (
            <Chip
              key={opt.label}
              label={opt.label}
              selected={tip === opt.value}
              onPress={() => setTip(opt.value)}
            />
          ))}
        </View>

        {/* Promo */}
        <View style={[styles.promoRow, styles.promoSpaced]}>
          <View style={styles.promoInput}>
            <TextField
              label="Promo code"
              value={promo}
              onChangeText={(text) => {
                setPromo(text);
                if (promoApplied) clearPromo();
              }}
              placeholder="Try BOOKIT10"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!promoApplied}
            />
          </View>
          <Button
            label={promoApplied ? 'Applied' : 'Apply'}
            variant="secondary"
            disabled={promoApplied || promo.trim().length === 0}
            onPress={onApplyPromo}
            fullWidth={false}
            style={styles.promoBtn}
          />
        </View>

        {/* Breakdown */}
        <View style={[styles.card, styles.breakdownCard]}>
          <Row label="Services & add-ons" value={money(breakdown.subtotal)} styles={styles} />
          <Row label="Platform fee (12%)" value={money(breakdown.fee)} styles={styles} />
          {breakdown.tip > 0 ? (
            <Row label="Tip" value={money(breakdown.tip)} styles={styles} />
          ) : null}
          {breakdown.discount > 0 ? (
            <Row
              label="Promo discount"
              value={`-${money(breakdown.discount)}`}
              styles={styles}
              discount
            />
          ) : null}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text variant="headline">Total</Text>
            <Text variant="title1" tone="accent">
              {money(breakdown.total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.footerPrice}>
          <Text variant="caption" tone="subtle">
            Total
          </Text>
          <Text variant="title2">{money(breakdown.total)}</Text>
        </View>
        <Button
          label="Proceed to checkout"
          icon="arrow-right"
          iconPosition="right"
          style={styles.checkoutBtn}
          onPress={() => router.push(route('/checkout'))}
        />
      </View>
    </View>
  );
}

function Header({
  title,
  onClose,
  styles,
  insets,
}: {
  title: string;
  onClose: () => void;
  styles: ReturnType<typeof makeStyles>;
  insets: { top: number };
}) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <IconButton
        name="close"
        size={24}
        variant="subtle"
        onPress={onClose}
        accessibilityLabel="Close cart"
      />
      <Text variant="title2">{title}</Text>
      <View style={styles.headerBtn} />
    </View>
  );
}

function Row({
  label,
  value,
  styles,
  discount,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  discount?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text variant="callout" tone={discount ? 'success' : 'muted'}>
        {label}
      </Text>
      <Text variant="callout" tone={discount ? 'success' : 'default'}>
        {value}
      </Text>
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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    providerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.lg,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    itemDivider: { borderBottomWidth: 1, borderBottomColor: c.border },
    itemInfo: { flex: 1, gap: 2 },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    stepBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepQty: {
      minWidth: 18,
      textAlign: 'center',
    },
    removeBtn: { minWidth: 44, alignItems: 'flex-end' },
    sectionLabel: {
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    suggestRow: { gap: spacing.sm, paddingBottom: spacing.xs },
    suggestCard: {
      width: 150,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.xs,
    },
    suggestName: { minHeight: 40 },
    suggestAdd: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.brand.primary,
    },
    addOnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxOn: { backgroundColor: c.brand.primary, borderColor: c.brand.primary },
    addOnName: { flex: 1 },
    tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    promoRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
    promoSpaced: { marginTop: spacing.xl },
    promoInput: { flex: 1 },
    promoBtn: { minWidth: 100, height: 48 },
    breakdownCard: { paddingVertical: spacing.lg, marginTop: spacing.xl, gap: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    divider: { height: 1, backgroundColor: c.border },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
    footerPrice: { justifyContent: 'center' },
    checkoutBtn: { flex: 1 },
  });
