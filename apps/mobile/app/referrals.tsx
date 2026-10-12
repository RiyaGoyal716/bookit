import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button } from '../src/components';
import { track } from '../src/lib/analytics';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const CODE = 'ALEX-BOOKIT';

const STEPS = [
  {
    icon: 'share-social-outline' as const,
    title: 'Share your code',
    text: 'Send your referral code to a friend.',
  },
  {
    icon: 'cart-outline' as const,
    title: 'They book',
    text: 'Your friend gets £10 off their first booking.',
  },
  {
    icon: 'cash-outline' as const,
    title: 'You earn £10',
    text: 'Credit lands after their job completes.',
  },
];

export default function ReferralsScreen() {
  const router = useRouter();
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
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Refer & earn</Text>
        <View style={styles.back} />
      </View>

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
          <Ionicons name="gift" size={40} color="#FFFFFF" />
          <Text style={styles.heroTitle}>Give £10, get £10</Text>
          <Text style={styles.heroText}>
            Invite friends to Bookit. They save £10, and you earn £10 credit when they book.
          </Text>
        </LinearGradient>

        <Text style={styles.sectionLabel}>Your referral code</Text>
        <Pressable
          style={styles.codeBox}
          onPress={() => showToast('Code copied')}
          accessibilityRole="button"
          accessibilityLabel={`Copy referral code ${CODE}`}
        >
          <Text style={styles.code}>{CODE}</Text>
          <Ionicons name="copy-outline" size={20} color={c.brand.tint} />
        </Pressable>

        <Text style={styles.sectionLabel}>How it works</Text>
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s.title} style={[styles.step, i < STEPS.length - 1 && styles.stepDivider]}>
              <View style={styles.stepIcon}>
                <Ionicons name={s.icon} size={20} color={c.brand.tint} />
              </View>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepText}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          label="Share your invite"
          icon="share-social"
          style={styles.shareBtn}
          onPress={onShare}
        />
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
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.scale.h2, color: c.text.primary },
    hero: {
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.xl,
      borderRadius: radius.xl,
    },
    heroTitle: { ...typography.scale.h1, color: '#FFFFFF' },
    heroText: {
      ...typography.scale.small,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
    },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
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
    code: {
      ...typography.scale.h2,
      color: c.brand.tint,
      letterSpacing: 1,
    },
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
    stepTitle: { ...typography.scale.bodyMedium, color: c.text.primary },
    stepText: { ...typography.scale.caption, color: c.text.secondary },
    shareBtn: { marginTop: spacing.xl },
  });
