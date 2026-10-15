import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Icon, Screen, Text } from '../src/components/ui';
import { Logo } from '../src/brand';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

export default function MaintenanceScreen() {
  const router = useRouter();
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Screen>
      <View style={styles.center}>
        <Logo size={56} />
        <View style={styles.iconWrap}>
          <Icon name="hammer" size={24} color={c.brand.tint} />
        </View>
        <Text variant="title1" style={styles.title}>
          We&apos;ll be right back
        </Text>
        <Text variant="body" tone="muted" style={styles.body}>
          Bookit is down for scheduled maintenance. We&apos;re making things better and expect to be
          back within an hour. Thanks for your patience!
        </Text>
        <View style={styles.statusPill}>
          <View style={styles.dot} />
          <Text variant="footnote" tone="warning">
            Estimated back by 14:00 BST
          </Text>
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
    title: { marginTop: spacing.sm },
    body: {
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
    footer: { paddingBottom: spacing.md },
  });
