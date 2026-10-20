import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text, PressableScale } from '../src/components/ui';
import { IllustrationNotify } from '../src/assets/illustrations';
import { useT } from '../src/i18n';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { route } from '../src/lib/nav';
import { useColors, useColorSchemeName, spacing, type Palette } from '../src/theme';

/**
 * Notifications primer. Location is NOT asked here any more — it is gated up
 * front by the location gate (app/location-gate.tsx) on every launch, so this
 * primer only covers push notifications.
 */
export default function PermissionsScreen() {
  const router = useRouter();
  const c = useColors();
  const scheme = useColorSchemeName();
  const t = useT();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const markSeen = useOnboardingStore((s) => s.markSeen);
  const setNotifications = useSettingsStore((s) => s.setNotificationsEnabled);

  const finish = () => {
    markSeen();
    router.replace(route('/(tabs)'));
  };

  const onEnableNotifications = () => {
    setNotifications(true);
    finish();
  };

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
          <IllustrationNotify size={220} />
        </View>

        <View style={styles.copy}>
          <Text variant="display" center>
            {t('permissions.notifTitle')}
          </Text>
          <Text variant="body" tone="muted" center style={styles.subtitle}>
            {t('permissions.notifBody')}
          </Text>
        </View>

        <View style={styles.footer}>
          <Button label={t('permissions.enable')} onPress={onEnableNotifications} />
          <PressableScale
            onPress={finish}
            style={styles.skip}
            accessibilityRole="button"
            accessibilityLabel={t('permissions.notNow')}
          >
            <Text variant="body" tone="muted">
              {t('permissions.notNow')}
            </Text>
          </PressableScale>
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
    subtitle: { maxWidth: 320 },
    footer: { gap: spacing.sm, marginTop: spacing.xxl },
    skip: { alignItems: 'center', paddingVertical: spacing.md },
  });
