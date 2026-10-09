import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Chip, EmptyState, Screen } from '../../src/components';
import { getProviderById } from '../../src/mocks';
import { computeFees, generateBookingId, useBookingsStore } from '../../src/stores/bookingsStore';
import { colors, radius, spacing, typography } from '../../src/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];
const STEP_TITLES = ['Choose a service', 'Pick a date & time', 'Where?', 'Review & confirm'];

function nextSevenDays(): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const label = `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
    out.push({ key: label, label: i === 0 ? `Today` : label });
  }
  return out;
}

export default function BookingFlowScreen() {
  const router = useRouter();
  const { providerId } = useLocalSearchParams<{ providerId: string }>();
  const provider = getProviderById(providerId);
  const addBooking = useBookingsStore((s) => s.addBooking);

  const days = useMemo(() => nextSevenDays(), []);
  const [step, setStep] = useState(0);
  const [serviceIndex, setServiceIndex] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [address, setAddress] = useState('');

  if (!provider) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
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
    const id = generateBookingId();
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
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={styles.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
        </Pressable>
        <View style={styles.progress}>
          {STEP_TITLES.map((_, i) => (
            <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
          ))}
        </View>
        <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>
        <Text style={styles.providerName}>with {provider.name}</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 ? (
          <View style={styles.list}>
            {provider.services.map((s, i) => {
              const selected = serviceIndex === i;
              return (
                <Pressable
                  key={s.name}
                  onPress={() => setServiceIndex(i)}
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
                    color={selected ? colors.brand.primary : colors.text.muted}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.block}>
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

            <Text style={[styles.label, { marginTop: spacing.xl }]}>Time</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((t) => (
                <Chip key={t} label={t} active={time === t} onPress={() => setTime(t)} />
              ))}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.block}>
            <Text style={styles.label}>Your address</Text>
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 12 Cardigan Road, Headingley, LS6 1LJ"
              placeholderTextColor={colors.text.muted}
              multiline
              autoFocus
            />
            <Text style={styles.hint}>
              We only share this with your provider once the booking is accepted.
            </Text>
          </View>
        ) : null}

        {step === 3 && service && fees ? (
          <View style={styles.block}>
            <View style={styles.reviewCard}>
              <ReviewRow label="Provider" value={provider.name} />
              <ReviewRow label="Service" value={service.name} />
              <ReviewRow label="When" value={`${date} · ${time}`} />
              <ReviewRow label="Address" value={address} />
              <View style={styles.divider} />
              <ReviewRow label="Service price" value={`£${service.price}`} />
              <ReviewRow label="Platform fee (12%)" value={`£${fees.fee}`} />
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>£{fees.total}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={step === 3 ? 'Confirm booking' : 'Continue'}
          icon={step === 3 ? 'checkmark' : undefined}
          disabled={!canContinue}
          onPress={() => (step === 3 ? confirm() : setStep(step + 1))}
        />
      </View>
    </Screen>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  back: { marginBottom: spacing.md },
  progress: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.brand.primary,
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
  },
  providerName: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
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
    borderColor: colors.border,
    backgroundColor: colors.background.base,
  },
  selectRowActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySoft,
  },
  serviceInfo: { flex: 1, gap: 2 },
  serviceName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  serviceMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
  servicePrice: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  block: { gap: spacing.sm },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  chipsRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  addressInput: {
    minHeight: 96,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
  reviewCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.base,
    gap: spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  reviewLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  reviewValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.base,
  },
});
