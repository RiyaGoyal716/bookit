import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../src/stores/authStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { useRegionStore } from '../src/stores/regionStore';
import { useThemeStore, type ThemePreference } from '../src/stores/themeStore';
import type { LocaleCode } from '../src/i18n';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const LANGUAGE_OPTIONS: { key: LocaleCode; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'हिंदी' },
  { key: 'ar', label: 'العربية' },
];

const THEME_OPTIONS: {
  key: ThemePreference;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
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
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Appearance</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dark mode</Text>
          <View style={styles.segment}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setPreference(opt.key)}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${opt.label} theme`}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={active ? c.brand.tint : c.text.muted}
                  />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            accessibilityRole="switch"
            accessibilityState={{ checked: notificationsEnabled }}
            accessibilityLabel="Push notifications"
          >
            <View style={styles.rowIcon}>
              <Ionicons name="notifications-outline" size={18} color={c.brand.tint} />
            </View>
            <Text style={styles.rowLabel}>Push notifications</Text>
            <View style={[styles.switch, notificationsEnabled && styles.switchOn]}>
              <View style={[styles.knob, notificationsEnabled && styles.knobOn]} />
            </View>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.row}
            onPress={() => setHapticsEnabled(!hapticsEnabled)}
            accessibilityRole="switch"
            accessibilityState={{ checked: hapticsEnabled }}
            accessibilityLabel="Haptic feedback"
          >
            <View style={styles.rowIcon}>
              <Ionicons name="phone-portrait-outline" size={18} color={c.brand.tint} />
            </View>
            <Text style={styles.rowLabel}>Haptic feedback</Text>
            <View style={[styles.switch, hapticsEnabled && styles.switchOn]}>
              <View style={[styles.knob, hapticsEnabled && styles.knobOn]} />
            </View>
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name="language-outline" size={18} color={c.brand.tint} />
            </View>
            <Text style={styles.rowLabel}>Language</Text>
          </View>
          <View style={[styles.segment, styles.languageSegment]}>
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setLanguage(opt.key)}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${opt.label} language`}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <View style={styles.rowIcon}>
              <Ionicons name="person-outline" size={18} color={c.brand.tint} />
            </View>
            <Text style={styles.rowLabel}>Edit profile</Text>
            <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/security')}
            accessibilityRole="button"
            accessibilityLabel="Security"
          >
            <View style={styles.rowIcon}>
              <Ionicons name="lock-closed-outline" size={18} color={c.brand.tint} />
            </View>
            <Text style={styles.rowLabel}>Security (PIN & biometrics)</Text>
            <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/account-status')}
            accessibilityRole="button"
            accessibilityLabel="Account status"
          >
            <View style={styles.rowIcon}>
              <Ionicons name="pulse-outline" size={18} color={c.brand.tint} />
            </View>
            <Text style={styles.rowLabel}>Account status</Text>
            <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
          </Pressable>
        </View>

        <Pressable
          style={styles.deleteRow}
          onPress={deleteAccount}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
        >
          <Ionicons name="trash-outline" size={18} color={c.status.danger} />
          <Text style={styles.deleteText}>Delete account</Text>
        </Pressable>

        <Pressable
          onLongPress={() => router.push('/dev/design-system')}
          delayLongPress={600}
          accessibilityRole="text"
          accessibilityLabel="App version 1.0.0"
          style={{ alignItems: 'center', paddingVertical: spacing.xl }}
        >
          <Text style={{ ...typography.scale.caption, color: c.text.muted }}>Bookit · v1.0.0</Text>
        </Pressable>
      </ScrollView>
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
    headerTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
    },
    content: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.muted,
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
    cardTitle: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
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
    segmentText: {
      ...typography.scale.smallMedium,
      color: c.text.muted,
    },
    segmentTextActive: {
      color: c.text.primary,
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
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    languageSegment: {
      marginTop: spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: spacing.sm,
    },
    switch: {
      width: 48,
      height: 28,
      borderRadius: radius.pill,
      backgroundColor: c.background.muted,
      padding: 3,
      justifyContent: 'center',
    },
    switchOn: {
      backgroundColor: c.brand.primary,
    },
    knob: {
      width: 22,
      height: 22,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
    },
    knobOn: {
      alignSelf: 'flex-end',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 52,
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
    deleteText: {
      ...typography.scale.bodyMedium,
      color: c.status.danger,
    },
  });
