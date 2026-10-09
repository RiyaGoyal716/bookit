import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, Screen } from '../src/components';
import { track } from '../src/lib/analytics';
import { useAuthStore } from '../src/stores/authStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const CELLS = [0, 1, 2, 3];
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const login = useAuthStore((s) => s.login);

  const inputs = useRef<(TextInput | null)[]>([]);
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const verify = (full: string) => {
    if (full.length < 4 || verifying) return;
    setVerifying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => {
      login(phone ?? '');
      track('login', { phone });
      router.replace('/(tabs)');
    }, 450);
  };

  const onChangeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CELLS.length - 1) {
      inputs.current[index + 1]?.focus();
    }
    const full = next.join('');
    if (full.length === 4 && next.every((d) => d !== '')) {
      verify(full);
    }
  };

  const onKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const next = [...code];
      next[index - 1] = '';
      setCode(next);
    }
  };

  const resend = () => {
    if (seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    setCode(['', '', '', '']);
    inputs.current[0]?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const full = code.join('');

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
          Sent to {phone || 'your number'}. Use any 4 digits for this demo.
        </Text>

        <View style={styles.cells}>
          {CELLS.map((i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              style={[styles.cell, code[i] ? styles.cellFilled : null]}
              value={code[i]}
              onChangeText={(v) => onChangeDigit(i, v)}
              onKeyPress={(e) => onKeyPress(i, e)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={i === 0}
              selectTextOnFocus
              accessibilityLabel={`Digit ${i + 1} of 4`}
            />
          ))}
        </View>

        <Pressable
          onPress={resend}
          disabled={seconds > 0}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            seconds > 0 ? `Resend available in ${seconds} seconds` : 'Resend code'
          }
        >
          <Text style={[styles.resend, seconds > 0 && styles.resendDisabled]}>
            {seconds > 0 ? `Resend in 0:${String(seconds).padStart(2, '0')}` : 'Resend code'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Change number"
          style={styles.changeRow}
        >
          <Ionicons name="pencil" size={14} color={c.brand.tint} />
          <Text style={styles.change}>Change number</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Button
          label="Verify & continue"
          loading={verifying}
          disabled={full.length < 4}
          onPress={() => verify(full)}
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
      textAlign: 'center',
      ...typography.scale.h1,
      color: c.text.primary,
    },
    cellFilled: {
      borderColor: c.brand.primary,
      backgroundColor: c.brand.primarySoft,
    },
    resend: {
      marginTop: spacing.xl,
      ...typography.scale.smallMedium,
      color: c.brand.tint,
    },
    resendDisabled: {
      color: c.text.muted,
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    change: {
      ...typography.scale.smallMedium,
      color: c.brand.tint,
    },
    footer: {
      paddingTop: spacing.md,
    },
  });
