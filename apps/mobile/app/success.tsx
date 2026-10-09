import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Screen } from '../src/components';
import { colors, radius, spacing, typography } from '../src/theme';

export default function SuccessScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={52} color={colors.text.inverse} />
        </View>
        <Text style={styles.title}>Booking confirmed!</Text>
        <Text style={styles.subtitle}>
          Your provider will confirm shortly. We&apos;ve saved the details to your bookings.
        </Text>

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Booking reference</Text>
          <Text style={styles.idValue}>{bookingId ?? 'BK------'}</Text>
        </View>
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.status.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
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
    backgroundColor: colors.brand.primarySoft,
  },
  idLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  idValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.brand.primary,
  },
  footer: {
    gap: spacing.md,
  },
});
