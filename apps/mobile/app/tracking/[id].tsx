import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  Button,
  EmptyState,
  PressableScale,
  Reveal,
  RouteMapTracker,
  StatusTimeline,
  type TimelineStep,
} from '../../src/components';
import { getProviderById } from '../../src/mocks';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import {
  BOOKING_TIMELINE,
  nextStatus,
  useBookingsStore,
  type BookingStatus,
} from '../../src/stores/bookingsStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

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

const STEP_META: Record<string, { label: string; caption: string; icon: TimelineStep['icon'] }> = {
  Requested: {
    label: 'Request sent',
    caption: 'Waiting for the pro to accept',
    icon: 'paper-plane-outline',
  },
  Accepted: {
    label: 'Pro confirmed',
    caption: 'Your booking is locked in',
    icon: 'checkmark-circle-outline',
  },
  'On the way': { label: 'On the way', caption: 'Your pro is heading to you', icon: 'car-outline' },
  Completed: { label: 'Arrived & completed', caption: 'Hope it went well!', icon: 'home-outline' },
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
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <EmptyState icon="navigate-outline" title="Nothing to track" />
      </View>
    );
  }

  const currentIndex = Math.max(0, BOOKING_TIMELINE.indexOf(booking.status));
  const progress = statusProgress(booking.status);
  const next = nextStatus(booking.status);
  const isLive = booking.status === 'Accepted' || booking.status === 'On the way';
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
          <RouteMapTracker progress={progress} height={300} />
          <PressableScale
            haptic="none"
            style={[styles.back, styles.backFloat, { top: insets.top + spacing.sm }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={c.text.primary} />
          </PressableScale>
        </View>

        <View style={styles.body}>
          <Reveal index={0} style={styles.etaCard}>
            <View style={styles.etaIcon}>
              <Ionicons name="time-outline" size={22} color={c.brand.tint} />
            </View>
            <View style={styles.flex1}>
              <View style={styles.etaStatusRow}>
                {isLive ? (
                  <MotiView
                    style={styles.liveDot}
                    from={{ opacity: 0.4, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'timing',
                      duration: 700,
                      loop: true,
                      repeatReverse: true,
                    }}
                  />
                ) : null}
                <Text style={styles.etaLabel}>{booking.status}</Text>
              </View>
              <Text style={styles.etaValue}>{etaFor(booking.status)}</Text>
            </View>
          </Reveal>

          {provider ? (
            <Reveal index={1} style={styles.proRow}>
              <Image
                source={{ uri: provider.photo }}
                style={styles.proAvatar}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
              <View style={styles.flex1}>
                <Text style={styles.proName}>{provider.name}</Text>
                <Text style={styles.proService}>{booking.serviceName}</Text>
              </View>
              <PressableScale
                style={styles.circleBtn}
                onPress={() =>
                  Linking.openURL('tel:+441130000000').catch(() => showToast('Calling unavailable'))
                }
                accessibilityRole="button"
                accessibilityLabel={`Call ${provider.name}`}
              >
                <Ionicons name="call" size={20} color={c.brand.tint} />
              </PressableScale>
              <PressableScale
                style={styles.circleBtn}
                onPress={() => router.push(route(`/chat/${provider.id}`))}
                accessibilityRole="button"
                accessibilityLabel={`Message ${provider.name}`}
              >
                <Ionicons name="chatbubble-ellipses" size={20} color={c.brand.tint} />
              </PressableScale>
            </Reveal>
          ) : null}

          <Reveal index={2}>
            <Text style={styles.sectionTitle}>Status timeline</Text>
            <StatusTimeline steps={steps} currentIndex={currentIndex} />
          </Reveal>

          {next ? (
            <Button
              label={`Advance to “${next}” (demo)`}
              variant="ghost"
              icon="play-forward"
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
    back: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    etaStatusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.status.success },
    etaLabel: { ...typography.scale.caption, color: c.text.secondary },
    etaValue: { ...typography.scale.h2, color: c.text.primary },
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
    proName: { ...typography.scale.bodyMedium, color: c.text.primary },
    proService: { ...typography.scale.caption, color: c.text.muted },
    circleBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: { ...typography.scale.h2, color: c.text.primary },
  });
