import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, Screen } from '../src/components';
import { useAuthStore } from '../src/stores/authStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const CELLS = [0, 1, 2, 3];

export default function OtpScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const login = useAuthStore((s) => s.login);
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const verify = () => {
    setVerifying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => {
      login(phone ?? '');
      router.replace('/(tabs)');
    }, 450);
  };

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
        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          Sent to +44 {phone || 'your number'}. Use any 4 digits for this demo.
        </Text>

        <Pressable
          style={styles.cells}
          onPress={() => inputRef.current?.focus()}
          accessibilityRole="button"
          accessibilityLabel="Enter verification code"
        >
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
        <Button
          label="Verify & continue"
          loading={verifying}
          disabled={code.length < 4}
          onPress={verify}
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
    cells: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    cell: {
      width: 64,
      height: 72,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cellActive: {
      borderColor: c.brand.primary,
      backgroundColor: c.brand.primarySoft,
    },
    cellText: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      height: 1,
      width: 1,
    },
    resend: {
      marginTop: spacing.xl,
      ...typography.scale.smallMedium,
      color: c.brand.tint,
    },
    footer: {
      paddingTop: spacing.md,
    },
  });
