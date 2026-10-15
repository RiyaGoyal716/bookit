import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '../../src/components';
import {
  Button,
  Chip,
  EmptyState,
  Screen,
  StatusPill,
  Text,
  Icon,
  IconButton,
  PressableScale,
  type IconName,
  type StatusTone,
} from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import {
  BOOKING_TIMELINE,
  nextStatus,
  useBookingsStore,
  RECURRENCE_LABEL,
  type BookingStatus,
} from '../../src/stores/bookingsStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';
import { useMoney } from '../../src/i18n';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];

const STATUS_TONE: Record<BookingStatus, StatusTone> = {
  Requested: 'info',
  Accepted: 'accent',
  'On the way': 'warning',
  Completed: 'success',
  Cancelled: 'danger',
};

const CANCEL_REASONS = [
  'Booked by mistake',
  'Found a better price',
  'Changed my plans',
  'Provider unresponsive',
  'Rescheduling to later',
  'Other',
];

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

export default function BookingDetailScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === id));
  const cancelBooking = useBookingsStore((s) => s.cancelBooking);
  const rescheduleBooking = useBookingsStore((s) => s.rescheduleBooking);
  const advanceStatus = useBookingsStore((s) => s.advanceStatus);

  const days = useMemo(() => nextSevenDays(), []);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);

  if (!booking) {
    return (
      <Screen>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.backPlain}
        />
        <EmptyState art="error" title="Booking not found" />
      </Screen>
    );
  }

  const cancelled = booking.status === 'Cancelled';
  const completed = booking.status === 'Completed';
  const terminal = cancelled || completed;
  const currentIndex = BOOKING_TIMELINE.indexOf(booking.status);
  const next = nextStatus(booking.status);

  const doCancel = () => {
    cancelBooking(booking.id);
    setCancelOpen(false);
    showToast('Booking cancelled');
  };

  const rebook = () => {
    router.push(route(`/provider/${booking.providerId}`));
  };

  const contactMessageFn = () => {
    router.push(route(`/chat/${booking.providerId}`));
  };

  const openReschedule = () => {
    setDraftDate(booking.date);
    setDraftTime(booking.time);
    setRescheduleOpen(true);
  };

  const confirmReschedule = () => {
    if (!draftDate || !draftTime) return;
    rescheduleBooking(booking.id, draftDate, draftTime);
    setRescheduleOpen(false);
    showToast('Booking rescheduled');
  };

  const contactCall = () => {
    Linking.openURL('tel:+441130000000').catch(() => showToast('Calling is not available here'));
  };

  const writeReview = () => {
    const qs = `providerId=${encodeURIComponent(booking.providerId)}&providerName=${encodeURIComponent(booking.providerName)}`;
    router.push(route(`/review?${qs}`));
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <Text variant="title2">Booking details</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text variant="title2" numberOfLines={1} style={styles.provider}>
              {booking.providerName}
            </Text>
            <StatusPill label={booking.status} tone={STATUS_TONE[booking.status]} />
          </View>
          <Text variant="body" tone="muted">
            {booking.serviceName}
          </Text>
          <View style={styles.metaRow}>
            <Icon name="calendar" size={16} color={c.text.muted} />
            <Text variant="callout" tone="muted">
              {booking.date} · {booking.time}
            </Text>
            <Text variant="callout" tone="subtle" style={styles.dot}>
              ·
            </Text>
            <Text variant="callout" tone="accent">
              {money(booking.total)}
            </Text>
          </View>
          <Text variant="caption" tone="subtle" style={styles.bookingId}>
            {booking.id}
          </Text>
        </View>

        <View style={styles.contactRow}>
          <Button
            label="Call"
            variant="secondary"
            icon="phone"
            onPress={contactCall}
            style={styles.contactBtn}
          />
          <Button
            label="Message"
            variant="secondary"
            icon="message"
            onPress={contactMessageFn}
            style={styles.contactBtn}
          />
        </View>

        {booking.status === 'Accepted' || booking.status === 'On the way' ? (
          <PressableScale
            style={styles.trackCard}
            onPress={() => router.push(route(`/tracking/${booking.id}`))}
            accessibilityRole="button"
            accessibilityLabel="Track your pro live"
          >
            <Icon name="navigation" size={20} color={c.text.inverse} />
            <View style={styles.flex1}>
              <Text variant="headline" tone="onPrimary">
                Track your pro live
              </Text>
              <Text variant="caption" tone="onPrimary" style={styles.trackSub}>
                See their route and ETA
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={c.text.inverse} />
          </PressableScale>
        ) : null}

        <Text variant="title2" style={styles.sectionTitle}>
          Status
        </Text>
        {cancelled ? (
          <View style={styles.cancelledBox}>
            <Icon name="close-circle" size={20} color={c.status.danger} />
            <Text variant="callout" tone="danger">
              This booking was cancelled.
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {BOOKING_TIMELINE.map((stage: BookingStatus, i) => {
              const done = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <View key={stage} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.node, done && styles.nodeDone]}>
                      {done ? <Icon name="check" size={16} color={c.text.inverse} /> : null}
                    </View>
                    {i < BOOKING_TIMELINE.length - 1 ? (
                      <View style={[styles.line, i < currentIndex && styles.lineDone]} />
                    ) : null}
                  </View>
                  <View style={styles.timelineBody}>
                    <Text
                      variant={isCurrent ? 'headline' : 'body'}
                      tone={isCurrent ? 'default' : 'muted'}
                    >
                      {stage}
                    </Text>
                    {isCurrent ? (
                      <Text variant="caption" tone="accent">
                        Current status
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {!terminal && next ? (
          <Button
            label={`Advance to “${next}” (demo)`}
            variant="tertiary"
            icon="arrow-right"
            onPress={() => advanceStatus(booking.id)}
            fullWidth={false}
            style={styles.demoBtn}
          />
        ) : null}

        <Text variant="title2" style={styles.sectionTitle}>
          Details
        </Text>
        <View style={styles.detailCard}>
          {booking.address ? (
            <DetailRow
              icon="map-pin"
              label="Address"
              value={booking.address}
              styles={styles}
              c={c}
            />
          ) : null}
          <DetailRow
            icon="repeat"
            label="Repeats"
            value={RECURRENCE_LABEL[booking.recurrence ?? 'none']}
            styles={styles}
            c={c}
          />
          {booking.paymentLabel ? (
            <DetailRow
              icon="card"
              label="Payment"
              value={booking.paymentLabel}
              styles={styles}
              c={c}
            />
          ) : null}
          <PressableScale
            style={styles.invoiceRow}
            onPress={() => router.push(route(`/invoice/${booking.id}`))}
            accessibilityRole="button"
            accessibilityLabel="View invoice"
          >
            <Icon name="file-text" size={20} color={c.brand.tint} />
            <Text variant="callout" tone="accent" style={styles.invoiceText}>
              View invoice (PDF)
            </Text>
            <Icon name="chevron-right" size={20} color={c.text.muted} />
          </PressableScale>
        </View>
      </ScrollView>

      {!terminal ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            label="Reschedule"
            variant="secondary"
            icon="calendar"
            onPress={openReschedule}
            style={styles.footerBtn}
          />
          <Button
            label="Cancel"
            variant="secondary"
            icon="close"
            onPress={() => setCancelOpen(true)}
            style={styles.footerBtn}
          />
        </View>
      ) : completed ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            label="Rebook"
            variant="secondary"
            icon="repeat"
            onPress={rebook}
            style={styles.footerBtn}
          />
          <Button
            label="Write a review"
            icon="star"
            onPress={writeReview}
            style={styles.footerBtn}
          />
        </View>
      ) : (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button label="Rebook" icon="repeat" onPress={rebook} style={styles.reviewBtn} />
        </View>
      )}

      <BottomSheet
        visible={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reschedule booking"
      >
        <Text variant="footnote" tone="muted" style={styles.sheetLabel}>
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
              selected={draftDate === d.key}
              onPress={() => setDraftDate(d.key)}
            />
          ))}
        </ScrollView>
        <Text variant="footnote" tone="muted" style={[styles.sheetLabel, styles.sheetLabelSpaced]}>
          Time
        </Text>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((slot) => (
            <Chip
              key={slot}
              label={slot}
              selected={draftTime === slot}
              onPress={() => setDraftTime(slot)}
            />
          ))}
        </View>
        <Button
          label="Confirm new time"
          disabled={!draftDate || !draftTime}
          onPress={confirmReschedule}
          style={styles.sheetBtn}
        />
      </BottomSheet>

      <BottomSheet visible={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel booking">
        <View style={styles.policyBox}>
          <Icon name="shield-check" size={20} color={c.brand.tint} />
          <Text variant="caption" tone="muted" style={styles.policyBoxText}>
            Free cancellation up to 24 hours before your appointment. Later cancellations may incur
            a fee.
          </Text>
        </View>
        <Text variant="footnote" tone="muted" style={[styles.sheetLabel, styles.sheetLabelSpaced]}>
          Why are you cancelling?
        </Text>
        <View style={styles.reasonWrap}>
          {CANCEL_REASONS.map((r) => (
            <Chip
              key={r}
              label={r}
              selected={cancelReason === r}
              onPress={() => setCancelReason(r)}
            />
          ))}
        </View>
        <Button
          label="Cancel booking"
          variant="secondary"
          disabled={!cancelReason}
          onPress={doCancel}
          style={styles.sheetBtn}
        />
        <Button label="Keep booking" variant="tertiary" onPress={() => setCancelOpen(false)} />
      </BottomSheet>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  styles,
  c,
}: {
  icon: IconName;
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={16} color={c.text.muted} />
      <Text variant="callout" tone="muted" style={styles.detailLabel}>
        {label}
      </Text>
      <Text variant="callout" numberOfLines={2} style={styles.detailValue}>
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
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    backPlain: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
    scroll: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.lg,
    },
    summaryCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.xs,
    },
    summaryTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    provider: {
      flex: 1,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.xs,
    },
    dot: { marginHorizontal: 2 },
    bookingId: {
      marginTop: spacing.xs,
      letterSpacing: 0.5,
    },
    contactRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    contactBtn: { flex: 1 },
    flex1: { flex: 1 },
    trackCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primary,
    },
    trackSub: { opacity: 0.85 },
    sectionTitle: {},
    detailCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.md,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    detailLabel: { width: 80 },
    detailValue: {
      flex: 1,
      textAlign: 'right',
    },
    invoiceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    invoiceText: { flex: 1 },
    policyBox: {
      flexDirection: 'row',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
    },
    policyBoxText: { flex: 1 },
    reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    timeline: {
      paddingLeft: spacing.xs,
    },
    timelineRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    timelineLeft: {
      alignItems: 'center',
      width: 24,
    },
    node: {
      width: 24,
      height: 24,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nodeDone: {
      backgroundColor: c.brand.primary,
      borderColor: c.brand.primary,
    },
    line: {
      flex: 1,
      width: 2,
      minHeight: 28,
      backgroundColor: c.border,
    },
    lineDone: {
      backgroundColor: c.brand.primary,
    },
    timelineBody: {
      flex: 1,
      paddingBottom: spacing.lg,
    },
    cancelledBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.status.dangerSoft,
    },
    demoBtn: {
      alignSelf: 'flex-start',
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
    footerBtn: { flex: 1 },
    reviewBtn: { flex: 1 },
    sheetLabel: {
      marginBottom: spacing.sm,
    },
    sheetLabelSpaced: { marginTop: spacing.lg },
    chipsRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    timeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    sheetBtn: { marginTop: spacing.xl },
  });
