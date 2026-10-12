import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { GradientButton } from '../src/components';
import { IllustrationLocation, IllustrationNotify } from '../src/assets/illustrations';
import { useT } from '../src/i18n';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { route } from '../src/lib/nav';
import {
  useColors,
  useColorSchemeName,
  typography,
  spacing,
  radius,
  type Palette,
} from '../src/theme';

type Step = 'location' | 'notifications';

export default function PermissionsScreen() {
  const router = useRouter();
  const c = useColors();
  const scheme = useColorSchemeName();
  const t = useT();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const setNotifications = useSettingsStore((s) => s.setNotificationsEnabled);
  const [step, setStep] = useState<Step>('location');
  const [busy, setBusy] = useState(false);

  const finish = () => {
    markSeen();
    router.replace(route('/(tabs)'));
  };

  const nextAfterLocation = () => setStep('notifications');

  const onAllowLocation = async () => {
    setBusy(true);
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      // Expo Go / denied — proceed regardless; the primer is best-effort.
    } finally {
      setBusy(false);
      nextAfterLocation();
    }
  };

  const onEnableNotifications = () => {
    // Mock primer — flip the settings flag and continue.
    setNotifications(true);
    finish();
  };

  const isLocation = step === 'location';

  return (
    <View style={styles.root}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View
        style={[
          styles.body,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.art}>
          {isLocation ? <IllustrationLocation size={220} /> : <IllustrationNotify size={220} />}
        </View>

        <View style={styles.copy}>
          <View style={styles.dots}>
            <View style={[styles.dot, isLocation && styles.dotActive]} />
            <View style={[styles.dot, !isLocation && styles.dotActive]} />
          </View>
          <Text style={styles.title}>
            {t(isLocation ? 'permissions.locationTitle' : 'permissions.notifTitle')}
          </Text>
          <Text style={styles.subtitle}>
            {t(isLocation ? 'permissions.locationBody' : 'permissions.notifBody')}
          </Text>
        </View>

        <View style={styles.footer}>
          <GradientButton
            label={t(isLocation ? 'permissions.allow' : 'permissions.enable')}
            loading={busy}
            onPress={isLocation ? onAllowLocation : onEnableNotifications}
          />
          <Pressable
            onPress={isLocation ? nextAfterLocation : finish}
            style={styles.skip}
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>{t('permissions.notNow')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    body: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'space-between' },
    art: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    copy: { alignItems: 'center', gap: spacing.md },
    dots: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
    dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: c.border },
    dotActive: { backgroundColor: c.brand.primary, width: 24 },
    title: { ...typography.scale.display, color: c.text.primary, textAlign: 'center' },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      textAlign: 'center',
      maxWidth: 320,
    },
    footer: { gap: spacing.sm, marginTop: spacing.xxl },
    skip: { alignItems: 'center', paddingVertical: spacing.md },
    skipText: { ...typography.scale.bodyMedium, color: c.text.muted },
  });
