import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Text, Icon, Screen } from '../src/components/ui';
import { Logo } from '../src/brand';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const WHATS_NEW = [
  'Live tracking with ETA on your bookings',
  'Chat with pros and in-app support',
  'Bookit Plus membership with 10% off',
];

export default function AppUpdateScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Screen>
      <View style={styles.center}>
        <Logo size={56} />
        <View style={styles.iconWrap}>
          <Icon name="rocket" size={24} color={c.brand.tint} />
        </View>
        <Text variant="title1" style={styles.title}>
          Update available
        </Text>
        <Text variant="body" tone="muted" style={styles.body}>
          A new version of Bookit is ready with faster performance and fresh features.
        </Text>
        <View style={styles.card}>
          <Text variant="headline" style={styles.cardTitle}>
            What&apos;s new
          </Text>
          {WHATS_NEW.map((w) => (
            <View key={w} style={styles.featRow}>
              <Icon name="check-circle" size={16} color={c.status.success} />
              <Text variant="callout" tone="muted" style={styles.featText}>
                {w}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          label="Update now"
          icon="arrow-down"
          onPress={() => showToast('Opening the app store (demo)')}
        />
        <Button
          label="Later"
          variant="tertiary"
          onPress={() => {
            if (router.canGoBack()) router.back();
          }}
        />
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    iconWrap: {
      width: 88,
      height: 88,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.lg,
    },
    title: { marginTop: spacing.sm },
    body: {
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    card: {
      alignSelf: 'stretch',
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.sm,
    },
    cardTitle: { marginBottom: spacing.xs },
    featRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    featText: { flex: 1 },
    footer: { gap: spacing.sm, paddingBottom: spacing.md },
  });
