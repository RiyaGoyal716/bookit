import { useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Divider,
  Icon,
  ListRow,
  PressableScale,
  ScreenHeader,
  Text,
  Toggle,
  type IconName,
} from '../src/components/ui';
import { useAuthStore } from '../src/stores/authStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useRegionStore } from '../src/stores/regionStore';
import { useThemeStore, type ThemePreference } from '../src/stores/themeStore';
import type { LocaleCode } from '../src/i18n';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const LANGUAGE_OPTIONS: { key: LocaleCode; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'हिंदी' },
  { key: 'ar', label: 'العربية' },
];

const THEME_OPTIONS: {
  key: ThemePreference;
  label: string;
  icon: IconName;
}[] = [
  { key: 'system', label: 'System', icon: 'smartphone' },
  { key: 'light', label: 'Light', icon: 'sun' },
  { key: 'dark', label: 'Dark', icon: 'moon' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useSettingsStore((s) => s.setHapticsEnabled);
  const language = useRegionStore((s) => s.language);
  const setLanguage = useRegionStore((s) => s.setLanguage);
  const logout = useAuthStore((s) => s.logout);

  const deleteAccount = () => {
    Alert.alert('Delete account?', 'This permanently removes your account and data.', [
      { text: 'Keep account', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader title="Settings" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="caption" tone="muted" style={styles.sectionLabel}>
          Appearance
        </Text>
        <View style={styles.card}>
          <Text variant="headline" style={styles.cardTitle}>
            Dark mode
          </Text>
          <View style={styles.segment}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.key;
              return (
                <PressableScale
                  key={opt.key}
                  onPress={() => setPreference(opt.key)}
                  haptic="selection"
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${opt.label} theme`}
                >
                  <Icon name={opt.icon} size={20} color={active ? c.brand.tint : c.text.muted} />
                  <Text
                    variant="footnote"
                    tone={active ? 'default' : 'subtle'}
                    style={styles.semibold}
                  >
                    {opt.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        <Text variant="caption" tone="muted" style={styles.sectionLabel}>
          Preferences
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Icon name="bell" size={20} color={c.brand.tint} />
            </View>
            <Text variant="headline" style={styles.rowLabel}>
              Push notifications
            </Text>
            <Toggle
              value={notificationsEnabled}
              onChange={setNotificationsEnabled}
              accessibilityLabel="Push notifications"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Icon name="smartphone" size={20} color={c.brand.tint} />
            </View>
            <Text variant="headline" style={styles.rowLabel}>
              Haptic feedback
            </Text>
            <Toggle
              value={hapticsEnabled}
              onChange={setHapticsEnabled}
              accessibilityLabel="Haptic feedback"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Icon name="languages" size={20} color={c.brand.tint} />
            </View>
            <Text variant="headline" style={styles.rowLabel}>
              Language
            </Text>
          </View>
          <View style={[styles.segment, styles.languageSegment]}>
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.key;
              return (
                <PressableScale
                  key={opt.key}
                  onPress={() => setLanguage(opt.key)}
                  haptic="selection"
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${opt.label} language`}
                >
                  <Text
                    variant="footnote"
                    tone={active ? 'default' : 'subtle'}
                    style={styles.semibold}
                  >
                    {opt.label}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        <Text variant="caption" tone="muted" style={styles.sectionLabel}>
          Account
        </Text>
        <View style={styles.linkCard}>
          <ListRow
            title="Edit profile"
            icon="user"
            iconTone="accent"
            onPress={() => router.push('/profile')}
          />
          <Divider inset={spacing.lg} />
          <ListRow
            title="Security (PIN & biometrics)"
            icon="lock"
            iconTone="accent"
            onPress={() => router.push('/security')}
          />
          <Divider inset={spacing.lg} />
          <ListRow
            title="Account status"
            icon="activity"
            iconTone="accent"
            onPress={() => router.push('/account-status')}
          />
        </View>

        <PressableScale
          style={styles.deleteRow}
          onPress={deleteAccount}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
        >
          <Icon name="trash" size={20} color={c.status.danger} />
          <Text variant="headline" tone="danger">
            Delete account
          </Text>
        </PressableScale>

        <PressableScale
          onLongPress={() => router.push('/dev/design-system')}
          delayLongPress={600}
          accessibilityRole="text"
          accessibilityLabel="App version 1.0.0"
          style={styles.version}
        >
          <Text variant="caption" tone="subtle">
            Bookit · v1.0.0
          </Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    content: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    semibold: { fontWeight: '600' },
    sectionLabel: {
      marginTop: spacing.lg,
      marginBottom: spacing.xs,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
    },
    linkCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      overflow: 'hidden',
    },
    cardTitle: {
      marginBottom: spacing.md,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: c.background.muted,
      borderRadius: radius.md,
      padding: 4,
      gap: 4,
    },
    segmentBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      minHeight: 44,
      borderRadius: radius.sm,
    },
    segmentBtnActive: {
      backgroundColor: c.background.surface,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 44,
    },
    rowIcon: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: {
      flex: 1,
    },
    languageSegment: {
      marginTop: spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: spacing.sm,
    },
    deleteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.status.dangerSoft,
      backgroundColor: c.status.dangerSoft,
    },
    version: { alignItems: 'center', paddingVertical: spacing.xl },
  });
