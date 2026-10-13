import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Logo, Screen } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

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
          <Ionicons name="rocket" size={40} color={c.brand.tint} />
        </View>
        <Text style={styles.title}>Update available</Text>
        <Text style={styles.body}>
          A new version of Bookit is ready with faster performance and fresh features.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What’s new</Text>
          {WHATS_NEW.map((w) => (
            <View key={w} style={styles.featRow}>
              <Ionicons name="checkmark-circle" size={16} color={c.status.success} />
              <Text style={styles.featText}>{w}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          label="Update now"
          icon="download"
          onPress={() => showToast('Opening the app store (demo)')}
        />
        <Button
          label="Later"
          variant="ghost"
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
    title: { ...typography.scale.h1, color: c.text.primary, marginTop: spacing.sm },
    body: {
      ...typography.scale.body,
      color: c.text.secondary,
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
    cardTitle: { ...typography.scale.bodyMedium, color: c.text.primary, marginBottom: spacing.xs },
    featRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    featText: { flex: 1, ...typography.scale.small, color: c.text.secondary },
    footer: { gap: spacing.sm, paddingBottom: spacing.md },
  });
