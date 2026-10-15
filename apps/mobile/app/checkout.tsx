import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  useReducedMotion,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Text,
  Icon,
  IconButton,
  Button,
  Chip,
  TextField,
  PressableScale,
  Card,
  Divider,
  EmptyState,
  Screen,
} from '../src/components/ui';
import type { IconName } from '../src/components/ui';
import { Confetti } from '../src/components';
import { route } from '../src/lib/nav';
import { track } from '../src/lib/analytics';
import { haptics } from '../src/lib/haptics';
import { getSlotsForDay } from '../src/mocks/availability';
import {
  generateBookingId,
  useBookingsStore,
  RECURRENCE_LABEL,
  type Recurrence,
} from '../src/stores/bookingsStore';
import { useAddressStore, type Address } from '../src/stores/addressStore';
import { computeCart, useCartStore } from '../src/stores/cartStore';
import { useWalletStore } from '../src/stores/walletStore';
import { showToast } from '../src/stores/toastStore';
import { useTokens, radius, spacing, spring } from '../src/theme';
import { useMoney } from '../src/i18n';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
  icon: IconName;
}
const PAYMENTS: PaymentMethod[] = [
  { id: 'visa', label: 'Visa', sub: '•••• 4242', icon: 'card' },
  { id: 'mc', label: 'Mastercard', sub: '•••• 5307', icon: 'card' },
  { id: 'applepay', label: 'Apple Pay', sub: 'Pay with Face ID', icon: 'smartphone' },
  { id: 'googlepay', label: 'Google Pay', sub: 'Pay with Google', icon: 'smartphone' },
  { id: 'after', label: 'Pay after service', sub: 'Cash or card on the day', icon: 'banknote' },
];

const RECURRENCE_OPTIONS: { value: Recurrence; label: string; sub: string }[] = [
  { value: 'none', label: 'One-off', sub: 'Just this once' },
  { value: 'weekly', label: 'Weekly', sub: 'Every week, save 10%' },
  { value: 'fortnightly', label: 'Fortnightly', sub: 'Every 2 weeks, save 5%' },
];

function dayFullLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

type StepId = 'service' | 'time' | 'address' | 'pay' | 'review';

export default function CheckoutScreen() {
  const router = useRouter();
  const t = useTokens();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

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
  const walletBalance = useWalletStore((s) => s.balance());
  const debitWallet = useWalletStore((s) => s.debit);

  const [open, setOpen] = useState<StepId>('time');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [addressId, setAddressId] = useState<string | null>(addresses[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [pinArea, setPinArea] = useState<string | null>(null);
  const [newLine, setNewLine] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentId, setPaymentId] = useState('visa');
  const [confirming, setConfirming] = useState(false);
  const [fired, setFired] = useState(false);

  const WALLET_PAYMENTS: PaymentMethod[] = useMemo(
    () => [
      ...PAYMENTS,
      {
        id: 'wallet',
        label: 'Bookit wallet',
        sub: `Balance ${money(walletBalance)}`,
        icon: 'wallet',
      },
    ],
    [money, walletBalance],
  );

  useEffect(() => {
    if (items.length > 0) track('start_checkout', { providerId, items: items.length });
  }, [items.length, providerId, items]);

  // Live animated total — pulse when the total changes.
  const totalPulse = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    totalPulse.value = withSequence(
      withTiming(1.08, { duration: 120 }),
      withSpring(1, spring.snappy),
    );
  }, [breakdown.total, reduced, totalPulse]);
  const totalStyle = useAnimatedStyle(() => ({ transform: [{ scale: totalPulse.value }] }));

  const slots = selectedDay !== null ? getSlotsForDay(providerId ?? 'x', selectedDay) : [];
  const selectedAddress = addresses.find((a) => a.id === addressId);
  const payment = WALLET_PAYMENTS.find((p) => p.id === paymentId);

  if (items.length === 0) {
    return (
      <Screen>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go home"
          onPress={() => router.replace('/(tabs)')}
        />
        <EmptyState
          art="empty"
          title="Nothing to check out"
          message="Your cart is empty."
          actionLabel="Explore services"
          onAction={() => router.replace('/(tabs)')}
        />
      </Screen>
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

  const confirm = () => {
    if (selectedDay === null || !selectedTime || !selectedAddress) return;
    setConfirming(true);
    setFired(true);
    haptics.success();
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
    if (paymentId === 'wallet') debitWallet(serviceName, breakdown.total);
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
        address: selectedAddress.line,
        paymentLabel: `${payment?.label ?? ''}`.trim(),
        recurrence,
      });
      clearCart();
      router.replace({ pathname: '/success', params: { bookingId: id } });
    }, 900);
  };

  const timeSummary =
    selectedDay !== null && selectedTime ? `${dayFullLabel(selectedDay)} · ${selectedTime}` : null;
  const reviewReady = selectedDay !== null && Boolean(selectedTime) && Boolean(selectedAddress);

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <Text variant="title2">Checkout</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Service */}
        <StepSection
          index={1}
          id="service"
          title="Service"
          summary={providerName ?? undefined}
          open={open}
          setOpen={setOpen}
          done={items.length > 0}
        >
          {items.map((it) => (
            <View key={it.key} style={styles.lineRow}>
              <Text variant="footnote" style={styles.flex1}>
                {it.name} × {it.quantity}
              </Text>
              <Text variant="footnote" tabular>
                {money(it.price * it.quantity)}
              </Text>
            </View>
          ))}
          <Button
            label="Edit cart"
            variant="tertiary"
            size="sm"
            fullWidth={false}
            onPress={() => router.push(route('/cart'))}
          />
        </StepSection>

        {/* Time */}
        <StepSection
          index={2}
          id="time"
          title="Time"
          summary={timeSummary ?? undefined}
          open={open}
          setOpen={setOpen}
          done={timeSummary !== null}
        >
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
                <PressableScale
                  key={d}
                  haptic="selection"
                  onPress={() => {
                    setSelectedDay(d);
                    setSelectedTime(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={dayFullLabel(d)}
                  style={[
                    styles.dayChip,
                    {
                      borderColor: active ? t.primary : t.border,
                      backgroundColor: active ? t.accentSoft : t.surface,
                    },
                  ]}
                >
                  <Text variant="micro" tone={active ? 'accent' : 'muted'}>
                    {d === 0 ? 'Today' : WEEKDAYS[dd.getDay()]}
                  </Text>
                  <Text variant="headline" tone={active ? 'accent' : 'default'} tabular>
                    {dd.getDate()}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          {selectedDay !== null ? (
            <>
              <View style={styles.timeGrid}>
                {slots.map((slot) => {
                  const active = selectedTime === slot.time;
                  return (
                    <PressableScale
                      key={slot.time}
                      haptic="selection"
                      disabled={!slot.available}
                      onPress={() => {
                        setSelectedTime(slot.time);
                        setOpen('address');
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active, disabled: !slot.available }}
                      accessibilityLabel={`${slot.time}${slot.available ? '' : ', unavailable'}`}
                      style={[
                        styles.timeSlot,
                        {
                          borderColor: active ? t.primary : t.border,
                          backgroundColor: active
                            ? t.accentSoft
                            : slot.available
                              ? t.surface
                              : t.bgSubtle,
                          opacity: slot.available ? 1 : 0.6,
                        },
                      ]}
                    >
                      <Text
                        variant="footnote"
                        tone={active ? 'accent' : slot.available ? 'default' : 'subtle'}
                        tabular
                        style={!slot.available && styles.strike}
                      >
                        {slot.time}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <Text variant="caption" tone="muted" style={styles.subLabel}>
                Repeat
              </Text>
              {RECURRENCE_OPTIONS.map((r) => (
                <SelectRow
                  key={r.value}
                  icon={r.value === 'none' ? 'calendar' : 'repeat'}
                  label={r.label}
                  sub={r.sub}
                  selected={recurrence === r.value}
                  onPress={() => setRecurrence(r.value)}
                />
              ))}
            </>
          ) : null}
        </StepSection>

        {/* Address */}
        <StepSection
          index={3}
          id="address"
          title="Address"
          summary={selectedAddress?.line}
          open={open}
          setOpen={setOpen}
          done={Boolean(selectedAddress)}
        >
          {addresses.map((a: Address) => (
            <SelectRow
              key={a.id}
              icon={a.fromLocation ? 'navigation' : a.label === 'Work' ? 'briefcase' : 'home'}
              label={a.label}
              sub={a.line}
              selected={addressId === a.id}
              onPress={() => {
                setAddressId(a.id);
                setAdding(false);
              }}
            />
          ))}

          {adding ? (
            <View style={styles.newAddress}>
              <Text variant="caption" tone="muted" style={styles.subLabel}>
                Pin your area
              </Text>
              <View style={styles.pinWrap}>
                {PIN_AREAS.map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    selected={pinArea === area}
                    onPress={() => setPinArea(pinArea === area ? null : area)}
                  />
                ))}
              </View>
              <TextField
                label="Street address"
                value={newLine}
                onChangeText={setNewLine}
                placeholder="e.g. 12 Cardigan Road"
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
            <PressableScale
              onPress={() => setAdding(true)}
              accessibilityRole="button"
              accessibilityLabel="Add a new address"
              style={styles.addNew}
            >
              <Icon name="plus-circle" size={20} color={t.accent} />
              <Text variant="footnote" tone="accent">
                Add a new address
              </Text>
            </PressableScale>
          )}

          <TextField
            label="Access instructions (optional)"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. buzzer 4, leave with neighbour"
            multiline
          />
        </StepSection>

        {/* Pay */}
        <StepSection
          index={4}
          id="pay"
          title="Pay"
          summary={payment ? `${payment.label} ${payment.sub}` : undefined}
          open={open}
          setOpen={setOpen}
          done
        >
          {WALLET_PAYMENTS.map((p) => {
            const walletLow = p.id === 'wallet' && walletBalance < breakdown.total;
            return (
              <SelectRow
                key={p.id}
                icon={p.icon}
                label={p.label}
                sub={walletLow ? 'Balance too low for this total' : p.sub}
                selected={paymentId === p.id}
                disabled={walletLow}
                onPress={() => setPaymentId(p.id)}
              />
            );
          })}
          <View style={styles.secureNote}>
            <Icon name="lock" size={16} color={t.textMuted} />
            <Text variant="caption" tone="muted" style={styles.flex1}>
              Payments are secured and only charged after the job.
            </Text>
          </View>
        </StepSection>

        {/* Review */}
        <StepSection
          index={5}
          id="review"
          title="Review"
          summary={reviewReady ? money(breakdown.total) : undefined}
          open={open}
          setOpen={setOpen}
          done={reviewReady}
        >
          <Card variant="flat" padding={spacing.md} style={styles.reviewCard}>
            <ReviewRow label="When" value={timeSummary ?? '—'} />
            {recurrence !== 'none' ? (
              <ReviewRow label="Repeats" value={RECURRENCE_LABEL[recurrence]} />
            ) : null}
            <ReviewRow label="Address" value={selectedAddress?.line ?? '—'} />
            {instructions.trim() ? (
              <ReviewRow label="Instructions" value={instructions.trim()} />
            ) : null}
            <ReviewRow label="Payment" value={`${payment?.label ?? ''} ${payment?.sub ?? ''}`} />
            <Divider />
            <ReviewRow label="Services & add-ons" value={money(breakdown.subtotal)} />
            <ReviewRow label="Platform fee (12%)" value={money(breakdown.fee)} />
            {breakdown.tip > 0 ? <ReviewRow label="Tip" value={money(breakdown.tip)} /> : null}
            {breakdown.discount > 0 ? (
              <ReviewRow label="Promo discount" value={`-${money(breakdown.discount)}`} />
            ) : null}
            <Divider />
            <View style={styles.lineRow}>
              <Text variant="headline">Total</Text>
              <Text variant="title2" tone="accent" tabular>
                {money(breakdown.total)}
              </Text>
            </View>
          </Card>
          <PressableScale
            onPress={() => router.push(route('/policies'))}
            accessibilityRole="button"
            accessibilityLabel="Read booking and cancellation policy"
            style={styles.policyLink}
          >
            <Icon name="shield-check" size={16} color={t.accent} />
            <Text variant="footnote" tone="accent">
              Booking & cancellation policy
            </Text>
          </PressableScale>
        </StepSection>
      </ScrollView>

      {/* Live total + slide to confirm */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: t.surface,
            borderTopColor: t.border,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <View style={styles.footerTotalRow}>
          <Text variant="footnote" tone="muted">
            Total
          </Text>
          <Animated.View style={totalStyle}>
            <Text variant="title2" tabular>
              {money(breakdown.total)}
            </Text>
          </Animated.View>
        </View>
        {reviewReady ? (
          <SlideToConfirm label="Slide to confirm" onConfirm={confirm} busy={confirming} />
        ) : (
          <Button label="Complete the steps above" disabled onPress={() => {}} />
        )}
      </View>

      <Confetti run={fired} />
    </View>
  );
}

function StepSection({
  index,
  id,
  title,
  summary,
  open,
  setOpen,
  done,
  children,
}: {
  index: number;
  id: StepId;
  title: string;
  summary?: string;
  open: StepId;
  setOpen: (s: StepId) => void;
  done?: boolean;
  children: React.ReactNode;
}) {
  const t = useTokens();
  const isOpen = open === id;
  return (
    <View style={[styles.step, { borderColor: t.border, backgroundColor: t.surface }]}>
      <PressableScale
        haptic="selection"
        onPress={() => setOpen(isOpen ? ('' as StepId) : id)}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: isOpen }}
        style={styles.stepHead}
      >
        <View
          style={[
            styles.stepBadge,
            {
              backgroundColor: done ? t.primary : t.bgSubtle,
              borderColor: done ? t.primary : t.border,
            },
          ]}
        >
          {done ? (
            <Icon name="check" size={16} color={t.onPrimary} />
          ) : (
            <Text variant="caption">{index}</Text>
          )}
        </View>
        <View style={styles.flex1}>
          <Text variant="headline">{title}</Text>
          {!isOpen && summary ? (
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
        </View>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={t.textMuted} />
      </PressableScale>
      {isOpen ? <View style={styles.stepBody}>{children}</View> : null}
    </View>
  );
}

function SelectRow({
  icon,
  label,
  sub,
  selected,
  disabled,
  onPress,
}: {
  icon: IconName;
  label: string;
  sub: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const t = useTokens();
  return (
    <PressableScale
      haptic="selection"
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`${label}, ${sub}`}
      style={[
        styles.selectRow,
        {
          borderColor: selected ? t.primary : t.border,
          backgroundColor: selected ? t.accentSoft : t.surface,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Icon name={icon} size={20} color={selected ? t.accent : t.textMuted} />
      <View style={styles.flex1}>
        <Text variant="footnote">{label}</Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Icon
        name={selected ? 'check-circle' : 'circle'}
        size={20}
        color={selected ? t.accent : t.textMuted}
      />
    </PressableScale>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text variant="footnote" tone="muted" style={styles.reviewLabel}>
        {label}
      </Text>
      <Text variant="footnote" numberOfLines={2} style={styles.reviewValue}>
        {value}
      </Text>
    </View>
  );
}

const THUMB = 52;
function SlideToConfirm({
  label,
  onConfirm,
  busy,
}: {
  label: string;
  onConfirm: () => void;
  busy: boolean;
}) {
  const t = useTokens();
  const [trackW, setTrackW] = useState(0);
  const x = useSharedValue(0);
  const done = useSharedValue(0);

  const maxX = Math.max(0, trackW - THUMB - 8);

  const fire = () => {
    if (!busy) onConfirm();
  };

  const pan = Gesture.Pan()
    .enabled(!busy)
    .onUpdate((e) => {
      x.value = Math.min(Math.max(0, e.translationX), maxX);
    })
    .onEnd(() => {
      if (x.value > maxX * 0.75) {
        x.value = withSpring(maxX, spring.snappy);
        done.value = 1;
        runOnJS(fire)();
      } else {
        x.value = withSpring(0, spring.snappy);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const fillStyle = useAnimatedStyle(() => ({
    width: x.value + THUMB,
    opacity: interpolate(x.value, [0, maxX], [0.3, 1], Extrapolation.CLAMP),
  }));

  const onLayout = (e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      style={[styles.slideTrack, { backgroundColor: t.bgSubtle, borderColor: t.border }]}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          styles.slideFill,
          { backgroundColor: t.primary, borderRadius: radius.pill },
          fillStyle,
        ]}
      />
      <Text variant="footnote" tone="muted" style={styles.slideLabel}>
        {busy ? 'Confirming…' : label}
      </Text>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.slideThumb, { backgroundColor: t.primary }, thumbStyle]}>
          <Icon name="arrow-right" size={20} color={t.onPrimary} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  spacer: { width: 44, height: 44 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 160, gap: spacing.sm },
  step: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  flex1: { flex: 1 },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dayRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  dayChip: {
    width: 56,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 2,
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  timeSlot: {
    minWidth: 80,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  strike: { textDecorationLine: 'line-through' },
  subLabel: { marginTop: spacing.sm },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  newAddress: { gap: spacing.sm },
  pinWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  newActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  reviewCard: { gap: spacing.sm },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  reviewLabel: { flexShrink: 1 },
  reviewValue: { flex: 1, textAlign: 'right' },
  policyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  footerTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slideTrack: {
    height: THUMB + 8,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slideFill: { position: 'absolute', left: 4, top: 4, bottom: 4 },
  slideLabel: { alignSelf: 'center' },
  slideThumb: {
    position: 'absolute',
    left: 4,
    width: THUMB,
    height: THUMB,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
