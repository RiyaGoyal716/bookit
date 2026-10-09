import { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Screen } from '../src/components';
import { useAuthStore } from '../src/stores/authStore';
import { colors, radius, spacing, typography } from '../src/theme';

const CELLS = [0, 1, 2, 3];

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const login = useAuthStore((s) => s.login);
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');

  const verify = () => {
    login(phone ?? '');
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={8}>
        <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
      </Pressable>

      <View style={styles.flex}>
        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          Sent to +44 {phone || 'your number'}. Use any 4 digits for this demo.
        </Text>

        <Pressable style={styles.cells} onPress={() => inputRef.current?.focus()}>
          {CELLS.map((i) => (
            <View key={i} style={[styles.cell, code.length === i && styles.cellActive]}>
              <Text style={styles.cellText}>{code[i] ?? ''}</Text>
            </View>
          ))}
        </Pressable>

        {/* Hidden capture input driving the 4 cells. */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 4))}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus
          caretHidden
        />

        <Text style={styles.resend}>Resend code</Text>
      </View>

      <View style={styles.footer}>
        <Button label="Verify & continue" disabled={code.length < 4} onPress={verify} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  back: { marginBottom: spacing.lg },
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
  cells: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cell: {
    width: 64,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primarySoft,
  },
  cellText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  resend: {
    marginTop: spacing.xl,
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  footer: {
    paddingTop: spacing.md,
  },
});
