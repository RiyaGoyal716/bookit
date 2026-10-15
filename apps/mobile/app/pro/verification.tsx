import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Icon, IconButton, Button, type IconName } from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { useProviderStore } from '../../src/stores/providerStore';
import { useColors, radius, spacing, type Palette } from '../../src/theme';

const STEPS: { key: string; label: string; caption: string; icon: IconName }[] = [
  {
    key: 'submitted',
    label: 'Application submitted',
    caption: 'We’ve received your details',
    icon: 'send',
  },
  {
    key: 'review',
    label: 'Documents in review',
    caption: 'ID and background checks',
    icon: 'search',
  },
  {
    key: 'approved',
    label: 'Approved',
    caption: 'Start accepting jobs',
    icon: 'check-circle',
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
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          Verification
        </Text>
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
            <Icon name={verified ? 'shield-check' : 'clock'} size={24} color={c.text.inverse} />
          </View>
          <Text variant="title1">{verified ? 'You’re verified!' : 'Under review'}</Text>
          <Text variant="caption" tone="muted" center>
            {verified
              ? 'Your profile is live. You can now receive and accept jobs.'
              : 'Most applications are reviewed within 24 hours. We’ll notify you when it’s done.'}
          </Text>
        </View>

        <View style={styles.card}>
          {STEPS.map((step, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const nodeColor = done ? c.status.success : active ? c.brand.tint : c.text.muted;
            return (
              <View key={step.key} style={styles.step}>
                <View style={styles.stepRail}>
                  <View style={[styles.stepDot, { borderColor: nodeColor }]}>
                    <Icon name={done ? 'check' : step.icon} size={16} color={nodeColor} />
                  </View>
                  {i < STEPS.length - 1 ? (
                    <View
                      style={[
                        styles.stepLine,
                        { backgroundColor: done ? c.status.success : c.border },
                      ]}
                    />
                  ) : null}
                </View>
                <View style={styles.stepBody}>
                  <Text variant="headline" tone={active || done ? 'default' : 'muted'}>
                    {step.label}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {step.caption}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {verified ? (
          <Button
            label="Go to dashboard"
            icon="activity"
            style={styles.action}
            onPress={() => router.replace(route('/pro'))}
          />
        ) : (
          <Button
            label="Simulate approval (demo)"
            variant="secondary"
            icon="zap"
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
    title: { flex: 1 },
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
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    step: { flexDirection: 'row', gap: spacing.md },
    stepRail: { alignItems: 'center' },
    stepDot: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepLine: { width: 2, flex: 1, minHeight: spacing.md, marginVertical: spacing.xs },
    stepBody: { flex: 1, paddingTop: spacing.xs, paddingBottom: spacing.lg },
    action: { marginTop: spacing.xl },
  });
