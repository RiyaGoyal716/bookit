import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, StatusTimeline, type TimelineStep } from '../../src/components';
import { route } from '../../src/lib/nav';
import { useProviderStore } from '../../src/stores/providerStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

const STEPS: TimelineStep[] = [
  {
    key: 'submitted',
    label: 'Application submitted',
    caption: 'We’ve received your details',
    icon: 'paper-plane-outline',
  },
  {
    key: 'review',
    label: 'Documents in review',
    caption: 'ID and background checks',
    icon: 'search-outline',
  },
  {
    key: 'approved',
    label: 'Approved',
    caption: 'Start accepting jobs',
    icon: 'checkmark-circle-outline',
  },
];

export default function ProVerification() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const verification = useProviderStore((s) => s.verification);
  const complete = useProviderStore((s) => s.completeVerification);

  const verified = verification === 'verified';
  const currentIndex = verified ? 2 : 1;

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
        <Text style={styles.title}>Verification</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, verified && styles.heroVerified]}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: verified ? c.status.success : c.status.warning },
            ]}
          >
            <Ionicons
              name={verified ? 'shield-checkmark' : 'hourglass'}
              size={36}
              color={c.text.inverse}
            />
          </View>
          <Text style={styles.heroTitle}>{verified ? 'You’re verified!' : 'Under review'}</Text>
          <Text style={styles.heroSub}>
            {verified
              ? 'Your profile is live. You can now receive and accept jobs.'
              : 'Most applications are reviewed within 24 hours. We’ll notify you when it’s done.'}
          </Text>
        </View>

        <View style={styles.card}>
          <StatusTimeline steps={STEPS} currentIndex={currentIndex} />
        </View>

        {verified ? (
          <Button
            label="Go to dashboard"
            icon="speedometer"
            style={styles.action}
            onPress={() => router.replace(route('/pro'))}
          />
        ) : (
          <Button
            label="Simulate approval (demo)"
            variant="secondary"
            icon="flash"
            style={styles.action}
            onPress={complete}
          />
        )}
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
    hero: {
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.xl,
      borderRadius: radius.xl,
      backgroundColor: c.status.warningSoft,
      marginBottom: spacing.lg,
    },
    heroVerified: { backgroundColor: c.status.successSoft },
    heroIcon: {
      width: 72,
      height: 72,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: { ...typography.scale.h1, color: c.text.primary },
    heroSub: { ...typography.scale.small, color: c.text.secondary, textAlign: 'center' },
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    action: { marginTop: spacing.xl },
  });
