import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Button, Icon, IconButton, PressableScale, Screen, Text } from '../src/components/ui';
import { useT, useDirectionalStyles } from '../src/i18n';
import { track } from '../src/lib/analytics';
import { useAuthStore } from '../src/stores/authStore';
import { route } from '../src/lib/nav';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const CELLS = [0, 1, 2, 3, 4, 5];
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const dir = useDirectionalStyles();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const login = useAuthStore((s) => s.login);

  const inputs = useRef<(TextInput | null)[]>([]);
  const [code, setCode] = useState<string[]>(CELLS.map(() => ''));
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const verify = (full: string) => {
    if (full.length < CELLS.length || verifying) return;
    setVerifying(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTimeout(() => {
      login(phone ?? '');
      track('login', { phone });
      router.replace(route('/permissions'));
    }, 450);
  };

  const onChangeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < CELLS.length - 1) inputs.current[index + 1]?.focus();
    const full = next.join('');
    if (full.length === CELLS.length && next.every((d) => d !== '')) verify(full);
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
    setCode(CELLS.map(() => ''));
    inputs.current[0]?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const full = code.join('');

  return (
    <Screen keyboardAvoiding>
      <IconButton
        name="chevron-left"
        size={24}
        onPress={() => router.back()}
        accessibilityLabel={t('common.back')}
        style={styles.back}
      />

      <View style={styles.flex}>
        <Text variant="title1" style={dir.textAlign}>
          {t('auth.otpTitle')}
        </Text>
        <Text variant="body" tone="muted" style={[styles.subtitle, dir.textAlign]}>
          {t('auth.otpSubtitle')} {phone || ''}
        </Text>

        <View style={[styles.cells, dir.row]}>
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
              accessibilityLabel={`Digit ${i + 1} of ${CELLS.length}`}
            />
          ))}
        </View>

        <PressableScale
          onPress={resend}
          disabled={seconds > 0}
          accessibilityRole="button"
          style={styles.resendWrap}
        >
          <Text variant="footnote" tone={seconds > 0 ? 'muted' : 'accent'}>
            {seconds > 0
              ? `${t('auth.resend')} 0:${String(seconds).padStart(2, '0')}`
              : t('auth.resend')}
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => router.back()}
          accessibilityRole="button"
          style={[styles.changeRow, dir.row]}
        >
          <Icon name="edit" size={16} color={c.brand.tint} />
          <Text variant="footnote" tone="accent">
            {t('common.back')}
          </Text>
        </PressableScale>
      </View>

      <View style={styles.footer}>
        <Button
          label={t('auth.verify')}
          loading={verifying}
          disabled={full.length < CELLS.length}
          onPress={() => verify(full)}
        />
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    back: { marginBottom: spacing.lg, alignSelf: 'flex-start', marginLeft: -spacing.sm },
    subtitle: {
      marginTop: spacing.sm,
      marginBottom: spacing.xl,
    },
    cells: { gap: spacing.sm },
    cell: {
      flex: 1,
      height: 64,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      textAlign: 'center',
      ...typography.scale.h1,
      color: c.text.primary,
    },
    cellFilled: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    resendWrap: { marginTop: spacing.xl, alignSelf: 'flex-start' },
    changeRow: { alignItems: 'center', gap: spacing.xs, marginTop: spacing.md },
    footer: { paddingTop: spacing.md },
  });
