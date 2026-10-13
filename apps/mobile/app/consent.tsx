import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../src/components';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useConsentStore, type ConsentPrefs } from '../src/stores/consentStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const ROWS: {
  key: keyof ConsentPrefs;
  label: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'analytics',
    label: 'Usage analytics',
    sub: 'Help us improve the app',
    icon: 'bar-chart-outline',
  },
  {
    key: 'personalization',
    label: 'Personalisation',
    sub: 'Tailor recommendations to you',
    icon: 'sparkles-outline',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    sub: 'Offers and partner promotions',
    icon: 'megaphone-outline',
  },
  {
    key: 'crashReports',
    label: 'Crash reports',
    sub: 'Share diagnostics when something breaks',
    icon: 'bug-outline',
  },
];

export default function ConsentScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const consent = useConsentStore();

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
        <Text style={styles.title}>Data & consent</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          You’re in control of your data. Essential processing needed to run bookings is always on;
          everything below is optional.
        </Text>

        <View style={styles.card}>
          {ROWS.map((r, i) => (
            <View key={r.key} style={[styles.row, i < ROWS.length - 1 && styles.divider]}>
              <View style={styles.rowIcon}>
                <Ionicons name={r.icon} size={18} color={c.brand.tint} />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowSub}>{r.sub}</Text>
              </View>
              <Switch
                value={consent[r.key]}
                onValueChange={() => consent.toggle(r.key)}
                trackColor={{ false: c.border, true: c.brand.primary }}
                thumbColor={c.background.surface}
                accessibilityLabel={r.label}
              />
            </View>
          ))}
        </View>

        <Button
          label="Download my data (demo)"
          variant="secondary"
          icon="download-outline"
          style={styles.action}
          onPress={() => showToast('We’ll email your data export shortly')}
        />
        <Pressable
          style={styles.policyLink}
          onPress={() => router.push(route('/legal/privacy'))}
          accessibilityRole="button"
          accessibilityLabel="Read privacy policy"
        >
          <Ionicons name="lock-closed-outline" size={16} color={c.brand.tint} />
          <Text style={styles.policyText}>Read our Privacy Policy</Text>
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
    title: { flex: 1, ...typography.scale.h2, color: c.text.primary },
    intro: { ...typography.scale.small, color: c.text.secondary, marginBottom: spacing.lg },
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
    divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flex1: { flex: 1 },
    rowLabel: { ...typography.scale.bodyMedium, color: c.text.primary },
    rowSub: { ...typography.scale.caption, color: c.text.muted },
    action: { marginTop: spacing.lg },
    policyLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      justifyContent: 'center',
    },
    policyText: { ...typography.scale.smallMedium, color: c.brand.tint },
  });
