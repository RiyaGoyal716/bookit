import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

import {
  Button,
  Chip,
  EmptyState,
  TextField,
  Screen,
  Text,
  Icon,
  IconButton,
  PressableScale,
} from '../../src/components/ui';
import { getProviderById } from '../../src/mocks';
import { track } from '../../src/lib/analytics';
import { computeFees, generateBookingId, useBookingsStore } from '../../src/stores/bookingsStore';
import { useAddressStore, type Address } from '../../src/stores/addressStore';
import { showToast } from '../../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';
import { useMoney } from '../../src/i18n';

const PROMO_CODE = 'BOOKIT10';
const PROMO_RATE = 0.1;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];
const STEPS = ['Service', 'Time', 'Address', 'Review'];

function nextSevenDays(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    out.push({ key: label, label: i === 0 ? 'Today' : label });
  }
  return out;
}

export default function BookingFlowScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const provider = getProviderById(providerId);
  const addBooking = useBookingsStore((s) => s.addBooking);
  const addresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.add);

  const days = useMemo(() => nextSevenDays(), []);
  const [step, setStep] = useState(0);
  const [serviceIndex, setServiceIndex] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (provider) track('start_booking', { providerId: provider.id });
  }, [provider]);

  const selectedAddress = addresses.find((a) => a.id === addressId);
  const address = selectedAddress ? selectedAddress.line : customAddress;

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      let label = `Current location (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`;
      try {
        const places = await Location.reverseGeocodeAsync(pos.coords);
        const place = places[0];
        if (place) {
          label = [place.name, place.street, place.city, place.postalCode]
            .filter(Boolean)
            .join(', ');
        }
      } catch {
        // Reverse geocode is best-effort; fall back to coordinates.
      }
      const saved = addAddress({ label: 'Current location', line: label, fromLocation: true });
      setAddressId(saved.id);
      showToast('Using your current location');
    } catch {
      showToast("Couldn't get your location");
    } finally {
      setLocating(false);
    }
  };

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      track('apply_promo', { code: PROMO_CODE });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showToast('Promo applied — 10% off');
    } else {
      setPromoApplied(false);
      showToast('Invalid promo code');
    }
  };

  if (!provider) {
    return (
      <Screen>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <EmptyState art="error" title="Provider not found" />
      </Screen>
    );
  }

  const service = serviceIndex !== null ? provider.services[serviceIndex] : null;
  const fees = service ? computeFees(service.price) : null;
  const discount = service && promoApplied ? Math.round(service.price * PROMO_RATE) : 0;
  const finalTotal = fees ? fees.total - discount : 0;

  const canContinue =
    (step === 0 && serviceIndex !== null) ||
    (step === 1 && date !== null && time !== null) ||
    (step === 2 && address.trim().length >= 4) ||
    step === 3;

  const goBack = () => (step === 0 ? router.back() : setStep(step - 1));

  const confirm = () => {
    if (!service || !fees || !date || !time) return;
    setConfirming(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const id = generateBookingId();
    track('confirm_booking', {
      bookingId: id,
      providerId: provider.id,
      total: finalTotal,
      promo: promoApplied ? PROMO_CODE : null,
    });
    setTimeout(() => {
      addBooking({
        id,
        providerId: provider.id,
        providerName: provider.name,
        serviceName: service.name,
        date,
        time,
        price: service.price,
        fee: fees.fee,
        total: finalTotal,
        status: 'Requested',
      });
      router.replace({ pathname: '/success', params: { bookingId: id } });
    }, 650);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={goBack}
          accessibilityLabel="Go back"
          style={styles.back}
        />

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
                    <Icon name="check" size={16} color={c.text.inverse} />
                  ) : (
                    <Text
                      variant="caption"
                      tone={current ? 'accent' : 'subtle'}
                      style={styles.stepNum}
                    >
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text variant="caption" tone={current ? 'default' : 'subtle'}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
        <Text variant="callout" tone="muted">
          with {provider.name}
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <View style={styles.list}>
            <Text variant="title1" style={styles.stepTitle}>
              Choose a service
            </Text>
            {provider.services.map((s, i) => {
              const selected = serviceIndex === i;
              return (
                <PressableScale
                  key={s.name}
                  onPress={() => setServiceIndex(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.selectRow, selected && styles.selectRowActive]}
                >
                  <View style={styles.serviceInfo}>
                    <Text variant="headline">{s.name}</Text>
                    <Text variant="caption" tone="subtle">
                      {s.durationMin} min
                    </Text>
                  </View>
                  <Text variant="headline" tone="accent">
                    {money(s.price)}
                  </Text>
                  <Icon
                    name={selected ? 'check-circle' : 'circle'}
                    size={24}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                </PressableScale>
              );
            })}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
            <Text variant="title1" style={styles.stepTitle}>
              Pick a date &amp; time
            </Text>
            <Text variant="footnote" tone="muted" style={styles.label}>
              Date
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {days.map((d) => (
                <Chip
                  key={d.key}
                  label={d.label}
                  selected={date === d.key}
                  onPress={() => setDate(d.key)}
                />
              ))}
            </ScrollView>

            <Text variant="footnote" tone="muted" style={[styles.label, styles.labelSpaced]}>
              Time
            </Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => (
                <Chip
                  key={slot}
                  label={slot}
                  selected={time === slot}
                  onPress={() => setTime(slot)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text variant="title1" style={styles.stepTitle}>
              Where?
            </Text>

            <Button
              label={locating ? 'Getting location…' : 'Use current location'}
              variant="secondary"
              icon="navigation"
              loading={locating}
              onPress={useCurrentLocation}
              style={styles.locBtn}
            />

            <Text variant="footnote" tone="muted" style={styles.label}>
              Saved addresses
            </Text>
            {addresses.map((a: Address) => {
              const selected = addressId === a.id;
              return (
                <PressableScale
                  key={a.id}
                  onPress={() => {
                    setAddressId(a.id);
                    setCustomAddress('');
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${a.label}: ${a.line}`}
                  style={[styles.addressRow, selected && styles.addressRowActive]}
                >
                  <Icon
                    name={a.fromLocation ? 'navigation' : a.label === 'Work' ? 'briefcase' : 'home'}
                    size={20}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                  <View style={styles.addressInfo}>
                    <Text variant="headline">{a.label}</Text>
                    <Text variant="caption" tone="subtle" numberOfLines={1}>
                      {a.line}
                    </Text>
                  </View>
                  <Icon
                    name={selected ? 'check-circle' : 'circle'}
                    size={20}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                </PressableScale>
              );
            })}

            <Text variant="footnote" tone="muted" style={[styles.label, styles.labelSpaced]}>
              Or enter a new address
            </Text>
            <TextField
              label="New address"
              value={customAddress}
              onChangeText={(text) => {
                setCustomAddress(text);
                if (text.length > 0) setAddressId(null);
              }}
              placeholder="e.g. 12 Cardigan Road, Headingley, LS6 1LJ"
              multiline
              helper="We only share this with your provider once the booking is accepted."
            />
          </View>
        ) : null}

        {step === 3 && service && fees ? (
          <View style={styles.block}>
            <Text variant="title1" style={styles.stepTitle}>
              Review &amp; confirm
            </Text>
            <View style={styles.reviewCard}>
              <ReviewRow label="Provider" value={provider.name} styles={styles} />
              <ReviewRow label="Service" value={service.name} styles={styles} />
              <ReviewRow label="When" value={`${date} · ${time}`} styles={styles} />
              <ReviewRow label="Address" value={address} styles={styles} />
              <View style={styles.divider} />
              <ReviewRow label="Service price" value={money(service.price)} styles={styles} />
              <ReviewRow label="Platform fee (12%)" value={money(fees.fee)} styles={styles} />
              {promoApplied ? (
                <View style={styles.reviewRow}>
                  <Text variant="callout" tone="success">
                    Promo {PROMO_CODE} (10% off)
                  </Text>
                  <Text variant="callout" tone="success">
                    -{money(discount)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text variant="headline">Total</Text>
                <Text variant="title1" tone="accent">
                  {money(finalTotal)}
                </Text>
              </View>
            </View>

            <View style={[styles.promoRow, styles.labelSpaced]}>
              <View style={styles.promoInput}>
                <TextField
                  label="Promo code"
                  value={promo}
                  onChangeText={(text) => {
                    setPromo(text);
                    if (promoApplied) setPromoApplied(false);
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
                onPress={applyPromo}
                fullWidth={false}
                style={styles.promoBtn}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label={step === 3 ? 'Confirm booking' : 'Continue'}
          icon={step === 3 ? 'check' : undefined}
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
    <View style={styles.reviewRow}>
      <Text variant="callout" tone="muted">
        {label}
      </Text>
      <Text variant="callout" numberOfLines={2} style={styles.reviewValue}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    flex: { flex: 1 },
    header: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginBottom: spacing.md, alignSelf: 'flex-start', marginLeft: -spacing.xs },
    stepper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    stepItem: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
    },
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
    stepDotActive: {
      borderColor: c.brand.primary,
    },
    stepDotDone: {
      backgroundColor: c.brand.primary,
      borderColor: c.brand.primary,
    },
    stepNum: {
      fontWeight: '700',
    },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    stepTitle: {
      marginBottom: spacing.lg,
    },
    list: { gap: spacing.sm },
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
    },
    selectRowActive: {
      borderColor: c.brand.primary,
      backgroundColor: c.brand.primarySoft,
    },
    serviceInfo: { flex: 1, gap: 2 },
    block: { gap: spacing.sm },
    label: {
      marginBottom: spacing.sm,
    },
    labelSpaced: { marginTop: spacing.xl },
    locBtn: { marginBottom: spacing.md },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    addressRowActive: {
      borderColor: c.brand.primary,
      backgroundColor: c.brand.primarySoft,
    },
    addressInfo: { flex: 1, gap: 2 },
    promoRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.sm,
    },
    promoInput: { flex: 1 },
    promoBtn: { minWidth: 100, height: 48 },
    chipsRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    timeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    reviewCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.md,
    },
    reviewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.lg,
    },
    reviewValue: {
      flex: 1,
      textAlign: 'right',
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
