import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  EmptyState,
  Text,
  Icon,
  PressableScale,
  IconButton,
  type IconName,
} from '../../src/components/ui';
import { getProviderById } from '../../src/mocks';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import {
  BOOKING_TIMELINE,
  nextStatus,
  useBookingsStore,
  type BookingStatus,
} from '../../src/stores/bookingsStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';

interface TimelineStep {
  key: string;
  label: string;
  caption: string;
  icon: IconName;
}

/** Map the booking status to tracker progress (0..1) and a rough ETA. */
function statusProgress(status: BookingStatus): number {
  switch (status) {
    case 'Requested':
      return 0.08;
    case 'Accepted':
      return 0.35;
    case 'On the way':
      return 0.72;
    case 'Completed':
      return 1;
    default:
      return 0;
  }
}

function etaFor(status: BookingStatus): string {
  switch (status) {
    case 'Requested':
      return 'Awaiting confirmation';
    case 'Accepted':
      return 'Arriving in ~25 min';
    case 'On the way':
      return 'Arriving in ~8 min';
    case 'Completed':
      return 'Job completed';
    default:
      return '—';
  }
}

const STEP_META: Record<string, { label: string; caption: string; icon: IconName }> = {
  Requested: {
    label: 'Request sent',
    caption: 'Waiting for the pro to accept',
    icon: 'send',
  },
  Accepted: {
    label: 'Pro confirmed',
    caption: 'Your booking is locked in',
    icon: 'check-circle',
  },
  'On the way': { label: 'On the way', caption: 'Your pro is heading to you', icon: 'truck' },
  Completed: { label: 'Arrived & completed', caption: 'Hope it went well!', icon: 'home' },
};

export default function TrackingScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === id));
  const advanceStatus = useBookingsStore((s) => s.advanceStatus);
  const provider = booking ? getProviderById(booking.providerId) : undefined;

  if (!booking) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="surface"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <EmptyState art="empty" title="Nothing to track" />
      </View>
    );
  }

  const currentIndex = Math.max(0, BOOKING_TIMELINE.indexOf(booking.status));
  const progress = statusProgress(booking.status);
  const next = nextStatus(booking.status);
  const steps: TimelineStep[] = BOOKING_TIMELINE.map((s) => ({
    key: s,
    label: STEP_META[s].label,
    caption: STEP_META[s].caption,
    icon: STEP_META[s].icon,
  }));

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapWrap}>
          <View style={styles.mapPlaceholder}>
            <Icon name="map-pin" size={24} color={c.brand.tint} />
            <Text variant="caption" tone="muted">
              Live route tracking
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </View>
          <IconButton
            name="chevron-left"
            size={24}
            variant="surface"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={[styles.backFloat, { top: insets.top + spacing.sm }]}
          />
        </View>

        <View style={styles.body}>
          <View style={styles.etaCard}>
            <View style={styles.etaIcon}>
              <Icon name="clock" size={24} color={c.brand.tint} />
            </View>
            <View style={styles.flex1}>
              <Text variant="caption" tone="muted">
                {booking.status}
              </Text>
              <Text variant="title2">{etaFor(booking.status)}</Text>
            </View>
          </View>

          {provider ? (
            <View style={styles.proRow}>
              <Image
                source={{ uri: provider.photo }}
                style={styles.proAvatar}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
              <View style={styles.flex1}>
                <Text variant="headline">{provider.name}</Text>
                <Text variant="caption" tone="muted">
                  {booking.serviceName}
                </Text>
              </View>
              <PressableScale
                style={styles.circleBtn}
                onPress={() =>
                  Linking.openURL('tel:+441130000000').catch(() => showToast('Calling unavailable'))
                }
                accessibilityRole="button"
                accessibilityLabel={`Call ${provider.name}`}
              >
                <Icon name="phone" size={20} color={c.brand.tint} />
              </PressableScale>
              <PressableScale
                style={styles.circleBtn}
                onPress={() => router.push(route(`/chat/${provider.id}`))}
                accessibilityRole="button"
                accessibilityLabel={`Message ${provider.name}`}
              >
                <Icon name="message" size={20} color={c.brand.tint} />
              </PressableScale>
            </View>
          ) : null}

          <Text variant="title2" style={styles.sectionTitle}>
            Status timeline
          </Text>
          <View style={styles.timeline}>
            {steps.map((step, i) => {
              const done = i <= currentIndex;
              const isLast = i === steps.length - 1;
              return (
                <View key={step.key} style={styles.tlRow}>
                  <View style={styles.tlRail}>
                    <View style={[styles.tlDot, done && styles.tlDotActive]}>
                      <Icon
                        name={step.icon}
                        size={16}
                        color={done ? c.text.inverse : c.text.muted}
                      />
                    </View>
                    {!isLast ? <View style={[styles.tlLine, done && styles.tlLineActive]} /> : null}
                  </View>
                  <View style={styles.tlBody}>
                    <Text variant="headline" tone={done ? 'default' : 'muted'}>
                      {step.label}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {step.caption}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {next ? (
            <Button
              label={`Advance to “${next}” (demo)`}
              variant="tertiary"
              icon="arrow-right"
              onPress={() => advanceStatus(booking.id)}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    mapWrap: { position: 'relative' },
    mapPlaceholder: {
      height: 300,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.background.muted,
    },
    progressTrack: {
      width: 160,
      height: 6,
      borderRadius: radius.pill,
      backgroundColor: c.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: 6,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
    },
    back: { alignSelf: 'flex-start', marginLeft: spacing.sm },
    backFloat: { position: 'absolute', left: spacing.lg },
    body: { padding: spacing.lg, gap: spacing.lg },
    flex1: { flex: 1 },
    etaCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
    },
    etaIcon: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    proRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    proAvatar: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: c.skeleton },
    circleBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {},
    timeline: { gap: 0 },
    tlRow: { flexDirection: 'row', gap: spacing.md },
    tlRail: { width: 36, alignItems: 'center' },
    tlDot: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.background.muted,
    },
    tlDotActive: { backgroundColor: c.brand.primary },
    tlLine: { width: 2, flex: 1, marginVertical: spacing.xs, backgroundColor: c.border },
    tlLineActive: { backgroundColor: c.brand.primary },
    tlBody: { flex: 1, paddingBottom: spacing.lg, gap: spacing.xxs },
  });
