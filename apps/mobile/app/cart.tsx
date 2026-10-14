import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { AnimatedCounter, Button, EmptyState, Input, PressableScale } from '../src/components';
import { getProviderById } from '../src/mocks';
import { route } from '../src/lib/nav';
import { ADD_ONS, computeCart, useCartStore } from '../src/stores/cartStore';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';
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
        <Header
          title="Your cart"
          onClose={() => router.back()}
          styles={styles}
          c={c}
          insets={insets}
        />
        <EmptyState
          icon="cart-outline"
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
      <Header
        title="Your cart"
        onClose={() => router.back()}
        styles={styles}
        c={c}
        insets={insets}
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {provider ? (
          <View style={styles.providerRow}>
            <Ionicons name="storefront-outline" size={16} color={c.brand.tint} />
            <Text style={styles.providerName}>{providerName}</Text>
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
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>
                  {item.durationMin} min · {money(item.price)}
                </Text>
              </View>
              <View style={styles.stepper}>
                <PressableScale
                  style={styles.stepBtn}
                  onPress={() => decrement(item.key)}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease ${item.name}`}
                >
                  <Ionicons
                    name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                    size={16}
                    color={c.brand.tint}
                  />
                </PressableScale>
                <AnimatedCounter value={item.quantity} style={styles.stepQty} />
                <PressableScale
                  style={styles.stepBtn}
                  onPress={() => increment(item.key)}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase ${item.name}`}
                >
                  <Ionicons name="add" size={16} color={c.brand.tint} />
                </PressableScale>
              </View>
              <Pressable
                onPress={() => removeItem(item.key)}
                hitSlop={8}
                style={styles.removeBtn}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.name}`}
              >
                <Text style={styles.itemLineTotal}>{money(item.price * item.quantity)}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Frequently added together */}
        {suggestions.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Frequently added together</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestRow}
            >
              {suggestions.map((s) => (
                <View key={s.name} style={styles.suggestCard}>
                  <Text style={styles.suggestName} numberOfLines={2}>
                    {s.name}
                  </Text>
                  <Text style={styles.suggestPrice}>{money(s.price)}</Text>
                  <PressableScale
                    style={styles.suggestAdd}
                    onPress={() => {
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
                    <Ionicons name="add" size={16} color={c.brand.tint} />
                    <Text style={styles.suggestAddText}>Add</Text>
                  </PressableScale>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Add-ons */}
        <Text style={styles.sectionLabel}>Add-ons</Text>
        <View style={styles.card}>
          {ADD_ONS.map((a, i) => {
            const selected = addOnIds.includes(a.id);
            return (
              <PressableScale
                key={a.id}
                haptic="selection"
                scaleTo={0.99}
                style={[styles.addOnRow, i < ADD_ONS.length - 1 && styles.itemDivider]}
                onPress={() => toggleAddOn(a.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${a.name}, ${money(a.price)}`}
              >
                <View style={[styles.checkbox, selected && styles.checkboxOn]}>
                  {selected ? <Ionicons name="checkmark" size={14} color={c.text.inverse} /> : null}
                </View>
                <Text style={styles.addOnName}>{a.name}</Text>
                <Text style={styles.addOnPrice}>+{money(a.price)}</Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Tip */}
        <Text style={styles.sectionLabel}>Add a tip</Text>
        <View style={styles.tipRow}>
          {tipOptions.map((t) => {
            const active = tip === t.value;
            return (
              <PressableScale
                key={t.label}
                haptic="selection"
                style={[styles.tipChip, active && styles.tipChipActive]}
                onPress={() => setTip(t.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Tip ${t.label}`}
              >
                <Text style={[styles.tipText, active && styles.tipTextActive]}>{t.label}</Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Promo */}
        <Text style={styles.sectionLabel}>Promo code</Text>
        <View style={styles.promoRow}>
          <Input
            containerStyle={styles.promoInput}
            value={promo}
            onChangeText={(t) => {
              setPromo(t);
              if (promoApplied) clearPromo();
            }}
            placeholder="Try BOOKIT10"
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!promoApplied}
          />
          <Button
            label={promoApplied ? 'Applied' : 'Apply'}
            variant="secondary"
            disabled={promoApplied || promo.trim().length === 0}
            onPress={onApplyPromo}
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
            <MotiView
              from={{ opacity: 0, translateY: -6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 16, stiffness: 220 }}
              style={styles.row}
            >
              <Text style={[styles.rowLabel, styles.rowDiscount]}>Promo discount</Text>
              <Text style={[styles.rowValue, styles.rowDiscount]}>
                -{money(breakdown.discount)}
              </Text>
            </MotiView>
          ) : null}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <AnimatedCounter
              value={breakdown.total}
              format={(v) => money(v)}
              style={styles.totalValue}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>Total</Text>
          <AnimatedCounter
            value={breakdown.total}
            format={(v) => money(v)}
            style={styles.footerTotal}
          />
        </View>
        <Button
          label="Proceed to checkout"
          icon="arrow-forward"
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
  c,
  insets,
}: {
  title: string;
  onClose: () => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  insets: { top: number };
}) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Pressable
        onPress={onClose}
        hitSlop={8}
        style={styles.headerBtn}
        accessibilityRole="button"
        accessibilityLabel="Close cart"
      >
        <Ionicons name="close" size={26} color={c.text.primary} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
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
      <Text style={[styles.rowLabel, discount && styles.rowDiscount]}>{label}</Text>
      <Text style={[styles.rowValue, discount && styles.rowDiscount]}>{value}</Text>
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
    headerBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.scale.h2, color: c.text.primary },
    providerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    providerName: { ...typography.scale.smallMedium, color: c.text.secondary },
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
    itemName: { ...typography.scale.bodyMedium, color: c.text.primary },
    itemMeta: { ...typography.scale.caption, color: c.text.muted },
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
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    removeBtn: { minWidth: 44, alignItems: 'flex-end' },
    itemLineTotal: { ...typography.scale.bodyMedium, color: c.text.primary },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
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
    suggestName: { ...typography.scale.smallMedium, color: c.text.primary, minHeight: 40 },
    suggestPrice: { ...typography.scale.smallMedium, color: c.brand.tint },
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
    suggestAddText: { ...typography.scale.smallMedium, color: c.brand.tint },
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
    addOnName: { flex: 1, ...typography.scale.body, color: c.text.primary },
    addOnPrice: { ...typography.scale.smallMedium, color: c.text.secondary },
    tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    tipChip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    tipChipActive: { backgroundColor: c.brand.primary, borderColor: c.brand.primary },
    tipText: { ...typography.scale.smallMedium, color: c.text.secondary },
    tipTextActive: { color: c.text.inverse },
    promoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    promoInput: { flex: 1 },
    promoBtn: { minWidth: 100 },
    breakdownCard: { paddingVertical: spacing.lg, marginTop: spacing.xl, gap: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    rowLabel: { ...typography.scale.small, color: c.text.secondary },
    rowValue: { ...typography.scale.smallMedium, color: c.text.primary },
    rowDiscount: { color: c.status.success },
    divider: { height: 1, backgroundColor: c.border },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { ...typography.scale.bodyMedium, color: c.text.primary },
    totalValue: { ...typography.scale.h1, color: c.brand.tint },
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
    footerLabel: { ...typography.scale.caption, color: c.text.muted },
    footerTotal: { ...typography.scale.h2, color: c.text.primary },
    checkoutBtn: { flex: 1 },
  });
