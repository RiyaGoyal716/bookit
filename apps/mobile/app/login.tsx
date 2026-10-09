import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Screen } from '../src/components';
import { colors, radius, spacing, typography } from '../src/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const canContinue = phone.replace(/\D/g, '').length >= 7;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
        </Pressable>

        <View style={styles.flex}>
          <Text style={styles.title}>What&apos;s your number?</Text>
          <Text style={styles.subtitle}>
            We&apos;ll text you a code to confirm it&apos;s really you.
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>🇬🇧 +44</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="7123 456789"
              placeholderTextColor={colors.text.muted}
              keyboardType="number-pad"
              maxLength={15}
              autoFocus
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue"
            disabled={!canContinue}
            onPress={() => router.push({ pathname: '/otp', params: { phone } })}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  prefix: {
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.muted,
  },
  prefixText: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  footer: {
    paddingTop: spacing.md,
  },
});
