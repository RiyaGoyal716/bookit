import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Logo, Screen } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

export default function MaintenanceScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Screen>
      <View style={styles.center}>
        <Logo size={56} />
        <View style={styles.iconWrap}>
          <Ionicons name="construct" size={40} color={c.brand.tint} />
        </View>
        <Text style={styles.title}>We’ll be right back</Text>
        <Text style={styles.body}>
          Bookit is down for scheduled maintenance. We’re making things better and expect to be back
          within an hour. Thanks for your patience!
        </Text>
        <View style={styles.statusPill}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>Estimated back by 14:00 BST</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button
          label="Try again"
          icon="refresh"
          onPress={() => {
            showToast('Still in maintenance — please check back soon');
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
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.status.warningSoft,
      marginTop: spacing.sm,
    },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.status.warning },
    statusText: { ...typography.scale.smallMedium, color: c.status.warning },
    footer: { paddingBottom: spacing.md },
  });
