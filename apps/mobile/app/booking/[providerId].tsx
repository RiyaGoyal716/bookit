import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, Chip, EmptyState, Input, Screen } from '../../src/components';
import { getProviderById } from '../../src/mocks';
import { computeFees, generateBookingId, useBookingsStore } from '../../src/stores/bookingsStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

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
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const provider = getProviderById(providerId);
  const addBooking = useBookingsStore((s) => s.addBooking);

  const days = useMemo(() => nextSevenDays(), []);
  const [step, setStep] = useState(0);
  const [serviceIndex, setServiceIndex] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [confirming, setConfirming] = useState(false);

  if (!provider) {
    return (
      <Screen>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <EmptyState icon="alert-circle-outline" title="Provider not found" />
      </Screen>
    );
  }

  const service = serviceIndex !== null ? provider.services[serviceIndex] : null;
  const fees = service ? computeFees(service.price) : null;

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
        total: fees.total,
        status: 'Requested',
      });
      router.replace({ pathname: '/success', params: { bookingId: id } });
    }, 650);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={goBack}
          style={styles.back}
          hitSlop={8}
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
        <Text style={styles.providerName}>with {provider.name}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 ? (
          <View style={styles.list}>
            <Text style={styles.stepTitle}>Choose a service</Text>
            {provider.services.map((s, i) => {
              const selected = serviceIndex === i;
              return (
                <Pressable
                  key={s.name}
                  onPress={() => setServiceIndex(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.selectRow, selected && styles.selectRowActive]}
                >
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    <Text style={styles.serviceMeta}>{s.durationMin} min</Text>
                  </View>
                  <Text style={styles.servicePrice}>£{s.price}</Text>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selected ? c.brand.tint : c.text.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
            <Text style={styles.stepTitle}>Pick a date & time</Text>
            <Text style={styles.label}>Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {days.map((d) => (
                <Chip
                  key={d.key}
                  label={d.label}
                  active={date === d.key}
                  onPress={() => setDate(d.key)}
                />
              ))}
            </ScrollView>

            <Text style={[styles.label, styles.labelSpaced]}>Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((t) => (
                <Chip key={t} label={t} active={time === t} onPress={() => setTime(t)} />
              ))}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.stepTitle}>Where?</Text>
            <Input
              label="Your address"
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 12 Cardigan Road, Headingley, LS6 1LJ"
              multiline
              autoFocus
              helper="We only share this with your provider once the booking is accepted."
            />
          </View>
        ) : null}

        {step === 3 && service && fees ? (
          <View style={styles.block}>
            <Text style={styles.stepTitle}>Review & confirm</Text>
            <View style={styles.reviewCard}>
              <ReviewRow label="Provider" value={provider.name} styles={styles} />
              <ReviewRow label="Service" value={service.name} styles={styles} />
              <ReviewRow label="When" value={`${date} · ${time}`} styles={styles} />
              <ReviewRow label="Address" value={address} styles={styles} />
              <View style={styles.divider} />
              <ReviewRow label="Service price" value={`£${service.price}`} styles={styles} />
              <ReviewRow label="Platform fee (12%)" value={`£${fees.fee}`} styles={styles} />
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>£{fees.total}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
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
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={2}>
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
    back: { marginBottom: spacing.md, alignSelf: 'flex-start' },
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
      ...typography.scale.caption,
      fontFamily: typography.font.bold,
      fontWeight: '700',
      color: c.text.muted,
    },
    stepNumActive: {
      color: c.brand.tint,
    },
    stepLabel: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    stepLabelActive: {
      color: c.text.primary,
    },
    providerName: {
      ...typography.scale.small,
      color: c.text.secondary,
    },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    stepTitle: {
      ...typography.scale.h1,
      color: c.text.primary,
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
    serviceName: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    serviceMeta: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    servicePrice: {
      ...typography.scale.bodyMedium,
      color: c.brand.tint,
    },
    block: { gap: spacing.sm },
    label: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
      marginBottom: spacing.sm,
    },
    labelSpaced: { marginTop: spacing.xl },
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
    reviewLabel: {
      ...typography.scale.small,
      color: c.text.secondary,
    },
    reviewValue: {
      flex: 1,
      textAlign: 'right',
      ...typography.scale.smallMedium,
      color: c.text.primary,
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
    totalLabel: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    totalValue: {
      ...typography.scale.h1,
      color: c.brand.tint,
    },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
