import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input, Screen } from '../src/components';
import { useColors, spacing, typography, type Palette } from '../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [phone, setPhone] = useState('');
  const digits = phone.replace(/\D/g, '');
  const canContinue = digits.length >= 7;
  const showError = phone.length > 0 && digits.length < 7;

  return (
    <Screen keyboardAvoiding>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={26} color={c.text.primary} />
      </Pressable>

      <View style={styles.flex}>
        <Text style={styles.title}>What&apos;s your number?</Text>
        <Text style={styles.subtitle}>
          We&apos;ll text you a code to confirm it&apos;s really you.
        </Text>

        <Input
          label="Mobile number"
          value={phone}
          onChangeText={setPhone}
          placeholder="7123 456789"
          keyboardType="number-pad"
          maxLength={15}
          autoFocus
          error={showError ? 'Enter a valid UK mobile number' : undefined}
          helper="Standard message rates may apply"
          left={
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇬🇧 +44</Text>
            </View>
          }
        />
      </View>

      <View style={styles.footer}>
        <Button
          label="Continue"
          disabled={!canContinue}
          onPress={() => router.push({ pathname: '/otp', params: { phone } })}
        />
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    back: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
    title: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    prefix: {
      borderRightWidth: 1.5,
      borderRightColor: c.border,
      paddingRight: spacing.md,
      marginRight: spacing.xs,
    },
    prefixText: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    footer: {
      paddingTop: spacing.md,
    },
  });
