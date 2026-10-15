import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  Button,
  Text,
  Icon,
  PressableScale,
  ScreenHeader,
  type IconName,
} from '../src/components/ui';
import { track } from '../src/lib/analytics';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const CODE = 'ALEX-BOOKIT';

const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'share',
    title: 'Share your code',
    text: 'Send your referral code to a friend.',
  },
  {
    icon: 'cart',
    title: 'They book',
    text: 'Your friend gets £10 off their first booking.',
  },
  {
    icon: 'banknote',
    title: 'You earn £10',
    text: 'Credit lands after their job completes.',
  },
];

export default function ReferralsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const onShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    track('share_referral', { code: CODE });
    Share.share({
      message: `Join me on Bookit for trusted local help in Leeds. Use my code ${CODE} for £10 off your first booking!`,
    }).catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScreenHeader title="Refer & earn" />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[c.brand.primary, c.brand.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Icon name="gift" size={24} color={c.text.onBrand} />
          <Text variant="title1" style={styles.heroTitle}>
            Give £10, get £10
          </Text>
          <Text variant="caption" style={styles.heroText}>
            Invite friends to Bookit. They save £10, and you earn £10 credit when they book.
          </Text>
        </LinearGradient>

        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Your referral code
        </Text>
        <PressableScale
          style={styles.codeBox}
          onPress={() => showToast('Code copied')}
          accessibilityRole="button"
          accessibilityLabel={`Copy referral code ${CODE}`}
        >
          <Text variant="title2" tone="accent" style={styles.code}>
            {CODE}
          </Text>
          <Icon name="copy" size={20} color={c.brand.tint} />
        </PressableScale>

        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          How it works
        </Text>
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={[styles.step, i < STEPS.length - 1 && styles.stepDivider]}>
              <View style={styles.stepIcon}>
                <Icon name={s.icon} size={20} color={c.brand.tint} />
              </View>
              <View style={styles.stepBody}>
                <Text variant="headline">{s.title}</Text>
                <Text variant="caption" tone="muted">
                  {s.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Button label="Share your invite" icon="share" style={styles.shareBtn} onPress={onShare} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    hero: {
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.xl,
      borderRadius: radius.xl,
    },
    heroTitle: { color: c.text.onBrand },
    heroText: {
      color: c.text.onBrand,
      opacity: 0.9,
      textAlign: 'center',
    },
    sectionLabel: {
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
      fontWeight: '600',
    },
    codeBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: c.brand.primary,
      backgroundColor: c.brand.primarySoft,
    },
    code: { letterSpacing: 1 },
    steps: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.lg,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    stepDivider: { borderBottomWidth: 1, borderBottomColor: c.border },
    stepIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBody: { flex: 1, gap: 2 },
    shareBtn: { marginTop: spacing.xl },
  });
