import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, Chip, EmptyState, Input } from '../src/components';
import { route } from '../src/lib/nav';
import { track } from '../src/lib/analytics';
import { getSlotsForDay } from '../src/mocks/availability';
import { generateBookingId, useBookingsStore } from '../src/stores/bookingsStore';
import { useAddressStore, type Address } from '../src/stores/addressStore';
import { computeCart, useCartStore } from '../src/stores/cartStore';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STEPS = ['Slot', 'Address', 'Payment', 'Review'];
const PIN_AREAS = [
  'Headingley, LS6',
  'Hyde Park, LS6',
  'City Centre, LS1',
  'Chapel Allerton, LS7',
  'Roundhay, LS8',
  'Horsforth, LS18',
];

interface PaymentMethod {
  id: string;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}
const PAYMENTS: PaymentMethod[] = [
  { id: 'visa', label: 'Visa', sub: '•••• 4242', icon: 'card' },
  { id: 'mc', label: 'Mastercard', sub: '•••• 5307', icon: 'card' },
  { id: 'applepay', label: 'Apple Pay', sub: 'Pay with Face ID', icon: 'logo-apple' },
  { id: 'googlepay', label: 'Google Pay', sub: 'Pay with Google', icon: 'logo-google' },
  { id: 'after', label: 'Pay after service', sub: 'Cash or card on the day', icon: 'cash-outline' },
];

function dayFullLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function CheckoutScreen() {
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
  const clearCart = useCartStore((s) => s.clear);
  const breakdown = useMemo(
    () => computeCart({ items, addOnIds, tip, promoApplied }),
    [items, addOnIds, tip, promoApplied],
  );

  const addresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.add);
  const addBooking = useBookingsStore((s) => s.addBooking);

  const [step, setStep] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(addresses[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [pinArea, setPinArea] = useState<string | null>(null);
  const [newLine, setNewLine] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentId, setPaymentId] = useState('visa');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (items.length > 0) track('start_checkout', { providerId, items: items.length });
  }, [items.length, providerId, items]);

  const slots = selectedDay !== null ? getSlotsForDay(providerId ?? 'x', selectedDay) : [];
  const selectedAddress = addresses.find((a) => a.id === addressId);
  const payment = PAYMENTS.find((p) => p.id === paymentId);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            hitSlop={8}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Go home"
          >
            <Ionicons name="chevron-back" size={26} color={c.text.primary} />
          </Pressable>
        </View>
        <EmptyState
          icon="cart-outline"
          title="Nothing to check out"
          message="Your cart is empty."
          actionLabel="Explore services"
          onAction={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  const saveNewAddress = () => {
    const line = [newLine.trim(), pinArea].filter(Boolean).join(', ');
    if (line.length < 4) {
      showToast('Enter an address or pick an area');
      return;
    }
    const saved = addAddress({ label: 'New address', line });
    setAddressId(saved.id);
    setAdding(false);
    setNewLine('');
    setPinArea(null);
    showToast('Address added');
  };

  const canContinue =
    (step === 0 && selectedDay !== null && selectedTime !== null) ||
    (step === 1 && Boolean(selectedAddress)) ||
    step === 2 ||
    step === 3;

  const goBack = () => (step === 0 ? router.back() : setStep(step - 1));

  const confirm = () => {
    if (selectedDay === null || !selectedTime || !selectedAddress) return;
    setConfirming(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const id = generateBookingId();
    const serviceName =
      items.length === 1 ? items[0].name : `${items[0].name} +${items.length - 1} more`;
    track('confirm_booking', {
      bookingId: id,
      providerId,
      total: breakdown.total,
      items: items.length,
      payment: paymentId,
    });
    setTimeout(() => {
      addBooking({
        id,
        providerId: providerId ?? '',
        providerName: providerName ?? 'Provider',
        serviceName,
        date: dayFullLabel(selectedDay),
        time: selectedTime,
        price: breakdown.subtotal,
        fee: breakdown.fee,
        total: breakdown.total,
        status: 'Requested',
      });
      clearCart();
      router.replace({ pathname: '/success', params: { bookingId: id } });
    }, 650);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={goBack}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <View style={styles.stepper}>
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <View key={label} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    (done || current) && styles.stepDotActive,
                    done && styles.stepDotDone,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={14} color={c.text.inverse} />
                  ) : (
                    <Text style={[styles.stepNum, current && styles.stepNumActive]}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[styles.stepLabel, current && styles.stepLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <View style={styles.block}>
            <Text style={styles.stepTitle}>Pick a slot</Text>
            <Text style={styles.label}>Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayRow}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const active = selectedDay === d;
                const dd = new Date();
                dd.setDate(dd.getDate() + d);
                return (
                  <Pressable
                    key={d}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                    onPress={() => {
                      setSelectedDay(d);
                      setSelectedTime(null);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={dayFullLabel(d)}
                  >
                    <Text style={[styles.dayWeekday, active && styles.dayTextActive]}>
                      {d === 0 ? 'Today' : WEEKDAYS[dd.getDay()]}
                    </Text>
                    <Text style={[styles.dayNum, active && styles.dayTextActive]}>
                      {dd.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {selectedDay !== null ? (
              <>
                <Text style={[styles.label, styles.labelSpaced]}>Time</Text>
                <View style={styles.timeGrid}>
                  {slots.map((slot) => (
                    <Pressable
                      key={slot.time}
                      disabled={!slot.available}
                      onPress={() => setSelectedTime(slot.time)}
                      style={[
                        styles.timeSlot,
                        selectedTime === slot.time && styles.timeSlotActive,
                        !slot.available && styles.timeSlotOff,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: selectedTime === slot.time,
                        disabled: !slot.available,
                      }}
                      accessibilityLabel={`${slot.time}${slot.available ? '' : ', unavailable'}`}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedTime === slot.time && styles.timeTextActive,
                          !slot.available && styles.timeTextOff,
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.hint}>Greyed times are already booked.</Text>
              </>
            ) : null}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
            <Text style={styles.stepTitle}>Where?</Text>
            <Text style={styles.label}>Saved addresses</Text>
            {addresses.map((a: Address) => {
              const selected = addressId === a.id;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => {
                    setAddressId(a.id);
                    setAdding(false);
                  }}
                  style={[styles.selectRow, selected && styles.selectRowActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${a.label}: ${a.line}`}
                >
                  <Ionicons
                    name={a.fromLocation ? 'navigate' : a.label === 'Work' ? 'briefcase' : 'home'}
                    size={18}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                  <View style={styles.selectInfo}>
                    <Text style={styles.selectLabel}>{a.label}</Text>
                    <Text style={styles.selectSub} numberOfLines={1}>
                      {a.line}
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                </Pressable>
              );
            })}

            {adding ? (
              <View style={styles.newAddress}>
                <Text style={[styles.label, styles.labelSpaced]}>
                  Pick an area (map not available)
                </Text>
                <View style={styles.pinWrap}>
                  {PIN_AREAS.map((area) => (
                    <Chip
                      key={area}
                      label={area}
                      active={pinArea === area}
                      onPress={() => setPinArea(pinArea === area ? null : area)}
                    />
                  ))}
                </View>
                <Input
                  containerStyle={styles.spaced}
                  label="Street address"
                  value={newLine}
                  onChangeText={setNewLine}
                  placeholder="e.g. 12 Cardigan Road"
                />
                <Input
                  containerStyle={styles.spaced}
                  label="Access instructions (optional)"
                  value={instructions}
                  onChangeText={setInstructions}
                  placeholder="e.g. buzzer 4, leave with neighbour"
                  multiline
                />
                <View style={styles.newActions}>
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onPress={() => setAdding(false)}
                    style={styles.flex1}
                  />
                  <Button label="Save address" onPress={saveNewAddress} style={styles.flex1} />
                </View>
              </View>
            ) : (
              <Pressable
                style={styles.addNew}
                onPress={() => setAdding(true)}
                accessibilityRole="button"
                accessibilityLabel="Add a new address"
              >
                <Ionicons name="add-circle-outline" size={20} color={c.brand.tint} />
                <Text style={styles.addNewText}>Add a new address</Text>
              </Pressable>
            )}

            {!adding ? (
              <Input
                containerStyle={styles.spaced}
                label="Access instructions (optional)"
                value={instructions}
                onChangeText={setInstructions}
                placeholder="e.g. buzzer 4, leave with neighbour"
                multiline
              />
            ) : null}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.stepTitle}>Payment</Text>
            {PAYMENTS.map((p) => {
              const selected = paymentId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPaymentId(p.id)}
                  style={[styles.selectRow, selected && styles.selectRowActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${p.label}, ${p.sub}`}
                >
                  <Ionicons
                    name={p.icon}
                    size={20}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                  <View style={styles.selectInfo}>
                    <Text style={styles.selectLabel}>{p.label}</Text>
                    <Text style={styles.selectSub}>{p.sub}</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                </Pressable>
              );
            })}
            <View style={styles.secureNote}>
              <Ionicons name="lock-closed" size={14} color={c.text.muted} />
              <Text style={styles.secureText}>
                Payments are secured and only charged after the job.
              </Text>
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.block}>
            <Text style={styles.stepTitle}>Review & confirm</Text>
            <View style={styles.reviewCard}>
              <ReviewRow label="Provider" value={providerName ?? '—'} styles={styles} />
              {items.map((it) => (
                <ReviewRow
                  key={it.key}
                  label={`${it.name} × ${it.quantity}`}
                  value={money(it.price * it.quantity)}
                  styles={styles}
                />
              ))}
              <View style={styles.divider} />
              <ReviewRow
                label="When"
                value={`${dayFullLabel(selectedDay ?? 0)} · ${selectedTime ?? ''}`}
                styles={styles}
              />
              <ReviewRow label="Address" value={selectedAddress?.line ?? '—'} styles={styles} />
              {instructions.trim() ? (
                <ReviewRow label="Instructions" value={instructions.trim()} styles={styles} />
              ) : null}
              <ReviewRow
                label="Payment"
                value={`${payment?.label ?? ''} ${payment?.sub ?? ''}`}
                styles={styles}
              />
              <View style={styles.divider} />
              <ReviewRow
                label="Services & add-ons"
                value={money(breakdown.subtotal)}
                styles={styles}
              />
              <ReviewRow label="Platform fee (12%)" value={money(breakdown.fee)} styles={styles} />
              {breakdown.tip > 0 ? (
                <ReviewRow label="Tip" value={money(breakdown.tip)} styles={styles} />
              ) : null}
              {breakdown.discount > 0 ? (
                <ReviewRow
                  label="Promo discount"
                  value={`-${money(breakdown.discount)}`}
                  styles={styles}
                />
              ) : null}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{money(breakdown.total)}</Text>
              </View>
            </View>
            <Pressable
              style={styles.policyLink}
              onPress={() => router.push(route('/policies'))}
              accessibilityRole="button"
              accessibilityLabel="Read booking and cancellation policy"
            >
              <Ionicons name="shield-checkmark-outline" size={16} color={c.brand.tint} />
              <Text style={styles.policyLinkText}>Booking & cancellation policy</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {step < 3 ? (
          <View style={styles.footerTotalRow}>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerTotal}>{money(breakdown.total)}</Text>
          </View>
        ) : null}
        <Button
          label={step === 3 ? 'Confirm booking' : 'Continue'}
          icon={step === 3 ? 'checkmark' : undefined}
          loading={confirming}
          disabled={!canContinue}
          onPress={() => (step === 3 ? confirm() : setStep(step + 1))}
        />
      </View>
    </View>
  );
}

function ReviewRow({
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
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    back: { marginBottom: spacing.md, alignSelf: 'flex-start' },
    stepper: { flexDirection: 'row', justifyContent: 'space-between' },
    stepItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
    stepDot: {
      width: 28,
      height: 28,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.background.muted,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    stepDotActive: { borderColor: c.brand.primary },
    stepDotDone: { backgroundColor: c.brand.primary, borderColor: c.brand.primary },
    stepNum: {
      ...typography.scale.caption,
      fontFamily: typography.font.bold,
      fontWeight: '700',
      color: c.text.muted,
    },
    stepNumActive: { color: c.brand.tint },
    stepLabel: { ...typography.scale.caption, color: c.text.muted },
    stepLabelActive: { color: c.text.primary },
    scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
    block: { gap: spacing.sm },
    stepTitle: { ...typography.scale.h1, color: c.text.primary, marginBottom: spacing.lg },
    label: { ...typography.scale.smallMedium, color: c.text.secondary, marginBottom: spacing.sm },
    labelSpaced: { marginTop: spacing.lg },
    spaced: { marginTop: spacing.md },
    dayRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    dayChip: {
      width: 56,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      gap: 2,
    },
    dayChipActive: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    dayWeekday: { ...typography.scale.caption, color: c.text.muted },
    dayNum: { ...typography.scale.bodyMedium, color: c.text.primary },
    dayTextActive: { color: c.brand.tint },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    timeSlot: {
      minWidth: 80,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
    },
    timeSlotActive: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    timeSlotOff: { backgroundColor: c.background.muted, borderColor: c.background.muted },
    timeText: { ...typography.scale.smallMedium, color: c.text.primary },
    timeTextActive: { color: c.brand.tint },
    timeTextOff: { color: c.text.muted, textDecorationLine: 'line-through' },
    hint: { ...typography.scale.caption, color: c.text.muted, marginTop: spacing.sm },
    selectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      marginBottom: spacing.sm,
    },
    selectRowActive: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    selectInfo: { flex: 1, gap: 2 },
    selectLabel: { ...typography.scale.bodyMedium, color: c.text.primary },
    selectSub: { ...typography.scale.caption, color: c.text.muted },
    addNew: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      minHeight: 48,
    },
    addNewText: { ...typography.scale.bodyMedium, color: c.brand.tint },
    newAddress: { gap: spacing.xs },
    pinWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    newActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    flex1: { flex: 1 },
    secureNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    secureText: { flex: 1, ...typography.scale.caption, color: c.text.muted },
    reviewCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.md,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
    rowLabel: { ...typography.scale.small, color: c.text.secondary, flexShrink: 1 },
    rowValue: {
      flex: 1,
      textAlign: 'right',
      ...typography.scale.smallMedium,
      color: c.text.primary,
    },
    divider: { height: 1, backgroundColor: c.border },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { ...typography.scale.bodyMedium, color: c.text.primary },
    totalValue: { ...typography.scale.h1, color: c.brand.tint },
    policyLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    policyLinkText: { ...typography.scale.smallMedium, color: c.brand.tint },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.md,
    },
    footerTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerLabel: { ...typography.scale.small, color: c.text.secondary },
    footerTotal: { ...typography.scale.h2, color: c.text.primary },
  });
