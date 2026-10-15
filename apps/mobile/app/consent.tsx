import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Text,
  Icon,
  IconButton,
  Button,
  Toggle,
  PressableScale,
  type IconName,
} from '../src/components/ui';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useConsentStore, type ConsentPrefs } from '../src/stores/consentStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const ROWS: {
  key: keyof ConsentPrefs;
  label: string;
  sub: string;
  icon: IconName;
}[] = [
  {
    key: 'analytics',
    label: 'Usage analytics',
    sub: 'Help us improve the app',
    icon: 'chart',
  },
  {
    key: 'personalization',
    label: 'Personalisation',
    sub: 'Tailor recommendations to you',
    icon: 'sparkles',
  },
  {
    key: 'marketing',
    label: 'Marketing',
    sub: 'Offers and partner promotions',
    icon: 'tag',
  },
  {
    key: 'crashReports',
    label: 'Crash reports',
    sub: 'Share diagnostics when something breaks',
    icon: 'alert-triangle',
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
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          variant="subtle"
          size={24}
          style={styles.back}
        />
        <Text variant="title2" style={styles.flex1}>
          Data & consent
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="footnote" tone="muted" style={styles.intro}>
          You’re in control of your data. Essential processing needed to run bookings is always on;
          everything below is optional.
        </Text>

        <View style={styles.card}>
          {ROWS.map((r, i) => (
            <View key={r.key} style={[styles.row, i < ROWS.length - 1 && styles.divider]}>
              <View style={styles.rowIcon}>
                <Icon name={r.icon} size={20} color={c.brand.tint} />
              </View>
              <View style={styles.flex1}>
                <Text variant="headline">{r.label}</Text>
                <Text variant="caption" tone="muted">
                  {r.sub}
                </Text>
              </View>
              <Toggle
                value={consent[r.key]}
                onChange={() => consent.toggle(r.key)}
                accessibilityLabel={r.label}
              />
            </View>
          ))}
        </View>

        <Button
          label="Download my data (demo)"
          variant="secondary"
          icon="arrow-down"
          style={styles.action}
          onPress={() => showToast('We’ll email your data export shortly')}
        />
        <PressableScale
          style={styles.policyLink}
          onPress={() => router.push(route('/legal/privacy'))}
          accessibilityRole="button"
          accessibilityLabel="Read privacy policy"
        >
          <Icon name="lock" size={16} color={c.brand.tint} />
          <Text variant="footnote" tone="accent">
            Read our Privacy Policy
          </Text>
        </PressableScale>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    flex1: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    intro: { marginBottom: spacing.lg },
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
    action: { marginTop: spacing.lg },
    policyLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
      justifyContent: 'center',
    },
  });
