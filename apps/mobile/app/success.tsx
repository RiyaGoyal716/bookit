import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, Confetti, Screen } from '../src/components';
import { useBookingsStore } from '../src/stores/bookingsStore';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

export default function SuccessScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useBookingsStore((s) => (bookingId ? s.getById(bookingId) : undefined));

  const [scale] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(0));
  // Confetti fires on mount.
  const [confetti] = useState(true);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, fade]);

  return (
    <Screen>
      <View style={styles.container}>
        <Animated.View style={[styles.iconCircle, { transform: [{ scale }] }]}>
          <Ionicons name="checkmark" size={52} color={c.text.inverse} />
        </Animated.View>
        <Animated.View style={{ opacity: fade, alignItems: 'center', gap: spacing.md }}>
          <Text style={styles.title}>Booking confirmed!</Text>
          <Text style={styles.subtitle}>
            Your provider will confirm shortly. We&apos;ve saved the details to your bookings.
          </Text>

          {booking ? (
            <View style={styles.summaryCard}>
              <SummaryRow
                icon="storefront-outline"
                label={booking.providerName}
                styles={styles}
                c={c}
              />
              <SummaryRow
                icon="construct-outline"
                label={booking.serviceName}
                styles={styles}
                c={c}
              />
              <SummaryRow
                icon="calendar-outline"
                label={`${booking.date} · ${booking.time}`}
                styles={styles}
                c={c}
              />
              <SummaryRow
                icon="pricetag-outline"
                label={`${money(booking.total)} total`}
                styles={styles}
                c={c}
              />
            </View>
          ) : null}

          <View style={styles.idCard}>
            <Text style={styles.idLabel}>Booking reference</Text>
            <Text style={styles.idValue}>{bookingId ?? 'BK------'}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Button
            label="Add to calendar"
            variant="secondary"
            icon="calendar-outline"
            style={styles.flex1}
            onPress={() => showToast('Added to your calendar')}
          />
          <Button
            label="Share"
            variant="secondary"
            icon="share-outline"
            style={styles.flex1}
            onPress={() => {
              const when = booking ? `${booking.date} at ${booking.time}` : 'soon';
              Share.share({
                message: `I just booked ${booking?.providerName ?? 'a Bookit pro'} for ${when}. Ref ${bookingId ?? ''}`,
              }).catch(() => {});
            }}
          />
        </View>
        <Button
          label="View booking"
          icon="receipt-outline"
          onPress={() =>
            bookingId
              ? router.replace({ pathname: '/booking-detail/[id]', params: { id: bookingId } })
              : router.replace('/(tabs)/bookings')
          }
        />
        <Button label="Back to home" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>

      <Confetti run={confetti} />
    </Screen>
  );
}

function SummaryRow({
  icon,
  label,
  styles,
  c,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon} size={16} color={c.brand.tint} />
      <Text style={styles.summaryText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    iconCircle: {
      width: 96,
      height: 96,
      borderRadius: radius.pill,
      backgroundColor: c.status.success,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    title: { ...typography.scale.h1, color: c.text.primary },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    summaryCard: {
      alignSelf: 'stretch',
      marginTop: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.sm,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    summaryText: { flex: 1, ...typography.scale.smallMedium, color: c.text.primary },
    idCard: {
      marginTop: spacing.sm,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xxl,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
    },
    idLabel: { ...typography.scale.caption, color: c.text.secondary },
    idValue: { ...typography.scale.h2, color: c.brand.tint, letterSpacing: 1 },
    footer: { gap: spacing.sm },
    footerRow: { flexDirection: 'row', gap: spacing.sm },
    flex1: { flex: 1 },
  });
