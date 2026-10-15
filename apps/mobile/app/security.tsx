import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  Button,
  Banner,
  Toggle,
  Text,
  Icon,
  PressableScale,
  IconButton,
} from '../src/components/ui';
import { showToast } from '../src/stores/toastStore';
import { useSecurityStore } from '../src/stores/securityStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function SecurityScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const pinSet = useSecurityStore((s) => s.pin !== null);
  const biometricEnabled = useSecurityStore((s) => s.biometricEnabled);
  const setPin = useSecurityStore((s) => s.setPin);
  const clearPin = useSecurityStore((s) => s.clearPin);
  const setBiometric = useSecurityStore((s) => s.setBiometric);

  const [entering, setEntering] = useState(false);
  const [digits, setDigits] = useState('');

  const press = (k: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (k === 'del') {
      setDigits((d) => d.slice(0, -1));
      return;
    }
    if (!k) return;
    const nextVal = (digits + k).slice(0, 4);
    setDigits(nextVal);
    if (nextVal.length === 4) {
      setTimeout(() => {
        setPin(nextVal);
        setEntering(false);
        setDigits('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        showToast('PIN set');
      }, 150);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          size={24}
          onPress={() => (entering ? setEntering(false) : router.back())}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          {entering ? 'Set a PIN' : 'Security'}
        </Text>
      </View>

      {entering ? (
        <View style={styles.pinPad}>
          <Text variant="body" tone="muted" style={styles.pinPrompt}>
            Enter a 4-digit PIN
          </Text>
          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.pinDot, i < digits.length && styles.pinDotFilled]} />
            ))}
          </View>
          <View style={styles.keypad}>
            {KEYS.map((k, i) => (
              <PressableScale
                key={`${k}-${i}`}
                haptic={null}
                style={[styles.key, !k && styles.keyEmpty]}
                onPress={() => press(k)}
                disabled={!k}
                accessibilityRole="button"
                accessibilityLabel={k === 'del' ? 'Delete' : k}
              >
                {k === 'del' ? (
                  <Icon name="backspace" size={24} color={c.text.primary} />
                ) : (
                  <Text variant="title1">{k}</Text>
                )}
              </PressableScale>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bannerWrap}>
            <Banner
              tone="info"
              title="App lock is a demo"
              message="PIN and biometrics are mocked for this prototype and never leave your device."
            />
          </View>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon name="grid" size={20} color={c.brand.tint} />
              </View>
              <View style={styles.flex1}>
                <Text variant="headline">App PIN</Text>
                <Text variant="caption" tone="muted">
                  {pinSet ? 'PIN is set' : 'Not set'}
                </Text>
              </View>
              <Button
                label={pinSet ? 'Change' : 'Set PIN'}
                variant="secondary"
                fullWidth={false}
                onPress={() => {
                  setDigits('');
                  setEntering(true);
                }}
                style={styles.smallBtn}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon name="fingerprint" size={20} color={c.brand.tint} />
              </View>
              <View style={styles.flex1}>
                <Text variant="headline">Biometric unlock</Text>
                <Text variant="caption" tone="muted">
                  Face ID / fingerprint
                </Text>
              </View>
              <Toggle
                value={biometricEnabled}
                disabled={!pinSet}
                onChange={(v) => {
                  setBiometric(v);
                  showToast(v ? 'Biometric unlock on' : 'Biometric unlock off');
                }}
                accessibilityLabel="Biometric unlock"
              />
            </View>
          </View>

          {pinSet ? (
            <PressableScale
              style={styles.removeRow}
              onPress={() => {
                clearPin();
                showToast('PIN removed');
              }}
              accessibilityRole="button"
              accessibilityLabel="Remove PIN"
            >
              <Icon name="trash" size={20} color={c.status.danger} />
              <Text variant="headline" tone="danger">
                Remove PIN
              </Text>
            </PressableScale>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    title: { flex: 1 },
    bannerWrap: { marginBottom: spacing.lg },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flex1: { flex: 1 },
    smallBtn: { minHeight: 40, paddingHorizontal: spacing.lg },
    divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    removeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      minHeight: 52,
      borderRadius: radius.lg,
      backgroundColor: c.status.dangerSoft,
    },
    pinPad: { flex: 1, alignItems: 'center', paddingTop: spacing.xl },
    pinPrompt: { marginBottom: spacing.xl },
    pinDots: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xxl },
    pinDot: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: c.brand.primary,
    },
    pinDotFilled: { backgroundColor: c.brand.primary },
    keypad: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: 280,
      justifyContent: 'space-between',
      rowGap: spacing.lg,
    },
    key: {
      width: 80,
      height: 72,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  });
