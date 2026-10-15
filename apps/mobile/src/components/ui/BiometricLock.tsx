import { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { useTokens, spacing } from '../../theme';
import { useSecurityStore } from '../../stores/securityStore';
import { hasBiometrics, authenticate } from '../../lib/biometrics';
import { haptics } from '../../lib/haptics';
import { LogoMark } from '../../brand';
import { Text } from './Text';
import { Button } from './Button';
import { PressableScale } from './PressableScale';
import { Icon } from './Icon';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

/**
 * App-lock gate. When a PIN or biometrics are enabled, blocks the app behind a
 * lock screen on cold start. Real biometrics (expo-local-authentication) with a
 * PIN fallback. Session-only (unlocks once per launch).
 */
export function BiometricLock({ children }: { children: React.ReactNode }) {
  const t = useTokens();
  const pin = useSecurityStore((s) => s.pin);
  const biometricEnabled = useSecurityStore((s) => s.biometricEnabled);
  const locked = pin !== null || biometricEnabled;

  const [unlocked, setUnlocked] = useState(!locked);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);

  const tryBiometric = useCallback(async () => {
    if (!biometricEnabled) return;
    if (!(await hasBiometrics())) return;
    if (await authenticate()) {
      haptics.success();
      setUnlocked(true);
    }
  }, [biometricEnabled]);

  useEffect(() => {
    // Prompt the OS biometric sheet once on mount (an external side-effect; the
    // state update happens asynchronously after the await).
    if (!unlocked) {
      const id = setTimeout(() => void tryBiometric(), 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (unlocked) return <>{children}</>;

  const press = (k: string) => {
    if (k === 'del') {
      setEntry((e) => e.slice(0, -1));
      return;
    }
    if (!k) return;
    haptics.selection();
    const next = (entry + k).slice(0, 4);
    setEntry(next);
    if (next.length === 4) {
      if (!pin || next === pin) {
        haptics.success();
        setUnlocked(true);
      } else {
        haptics.error();
        setError(true);
        setTimeout(() => {
          setEntry('');
          setError(false);
        }, 500);
      }
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.top}>
        <LogoMark size={48} />
        <Text variant="title2" style={{ marginTop: spacing.lg }}>
          Enter your PIN
        </Text>
        <Text variant="footnote" tone={error ? 'danger' : 'muted'}>
          {error ? 'Incorrect PIN, try again' : 'Bookit is locked'}
        </Text>
        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.pinDot,
                {
                  borderColor: t.border,
                  backgroundColor: i < entry.length ? t.accent : 'transparent',
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.pad}>
        {KEYS.map((k, i) =>
          k === '' ? (
            <View key={i} style={styles.key} />
          ) : (
            <PressableScale
              key={i}
              onPress={() => press(k)}
              haptic={null}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? 'Delete' : k}
              style={styles.key}
            >
              {k === 'del' ? (
                <Icon name="chevron-left" size={24} color={t.text} />
              ) : (
                <Text variant="title1">{k}</Text>
              )}
            </PressableScale>
          ),
        )}
      </View>

      {biometricEnabled && (
        <View style={styles.bio}>
          <Button
            label="Use biometrics"
            variant="secondary"
            icon="fingerprint"
            onPress={tryBiometric}
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
  },
  top: { alignItems: 'center', gap: spacing.xs },
  dots: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  pinDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  pad: {
    width: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: spacing.md,
  },
  key: { width: '33.33%', height: 64, alignItems: 'center', justifyContent: 'center' },
  bio: { marginTop: spacing.md },
});
