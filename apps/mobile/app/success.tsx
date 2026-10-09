import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, Screen } from '../src/components';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

export default function SuccessScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  const [scale] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(0));

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

          <View style={styles.idCard}>
            <Text style={styles.idLabel}>Booking reference</Text>
            <Text style={styles.idValue}>{bookingId ?? 'BK------'}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button
          label="View booking"
          icon="calendar"
          onPress={() => router.replace('/(tabs)/bookings')}
        />
        <Button
          label="Back to home"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
        />
      </View>
    </Screen>
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
    title: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    idCard: {
      marginTop: spacing.lg,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xxl,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
    },
    idLabel: {
      ...typography.scale.caption,
      color: c.text.secondary,
    },
    idValue: {
      ...typography.scale.h2,
      color: c.brand.tint,
      letterSpacing: 1,
    },
    footer: {
      gap: spacing.md,
    },
  });
