import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, ConfirmModal } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { usePlusStore, PLUS_PRICE, type PlusPlan } from '../src/stores/plusStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; sub: string }[] = [
  { icon: 'pricetag', title: '10% off every booking', sub: 'Applied automatically at checkout' },
  { icon: 'flash', title: 'Priority matching', sub: 'Get the fastest-responding pros first' },
  {
    icon: 'shield-checkmark',
    title: 'Free cancellation',
    sub: 'Cancel up to 2 hours before, any time',
  },
  { icon: 'headset', title: 'Priority support', sub: 'Skip the queue with a dedicated line' },
  { icon: 'gift', title: 'Member perks', sub: 'Seasonal credits and partner offers' },
];

export default function PlusScreen() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const subscribed = usePlusStore((s) => s.subscribed);
  const currentPlan = usePlusStore((s) => s.plan);
  const renewsOn = usePlusStore((s) => s.renewsOn);
  const subscribe = usePlusStore((s) => s.subscribe);
  const cancel = usePlusStore((s) => s.cancel);

  const [plan, setPlan] = useState<PlusPlan>('yearly');
  const [cancelOpen, setCancelOpen] = useState(false);

  const onSubscribe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    subscribe(plan);
    showToast('Welcome to Bookit Plus!');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={c.brand.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.back}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={c.text.inverse} />
          </Pressable>
          <View style={styles.badge}>
            <Ionicons name="star" size={14} color={c.text.inverse} />
            <Text style={styles.badgeText}>BOOKIT PLUS</Text>
          </View>
          <Text style={styles.heroTitle}>Save more on every booking</Text>
          <Text style={styles.heroSub}>
            {subscribed
              ? `You're a Plus member · renews ${renewsOn ?? ''}`
              : 'Members save an average of £84 a year'}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.card}>
            {BENEFITS.map((b, i) => (
              <View
                key={b.title}
                style={[styles.benefitRow, i < BENEFITS.length - 1 && styles.divider]}
              >
                <View style={styles.benefitIcon}>
                  <Ionicons name={b.icon} size={18} color={c.brand.tint} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitSub}>{b.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          {!subscribed ? (
            <>
              <Text style={styles.sectionTitle}>Choose a plan</Text>
              {(['yearly', 'monthly'] as PlusPlan[]).map((p) => {
                const active = plan === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPlan(p)}
                    style={[styles.planRow, active && styles.planRowActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${p} plan`}
                  >
                    <View style={styles.flex1}>
                      <View style={styles.planTitleRow}>
                        <Text style={styles.planName}>{p === 'yearly' ? 'Yearly' : 'Monthly'}</Text>
                        {p === 'yearly' ? (
                          <View style={styles.saveTag}>
                            <Text style={styles.saveText}>Best value · 2 months free</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.planPrice}>
                        {money(PLUS_PRICE[p])}
                        <Text style={styles.planPer}>
                          {p === 'yearly' ? ' / year' : ' / month'}
                        </Text>
                      </Text>
                    </View>
                    <Ionicons
                      name={active ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={active ? c.brand.tint : c.text.muted}
                    />
                  </Pressable>
                );
              })}
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Billing</Text>
              <View style={styles.card}>
                <Row
                  label="Plan"
                  value={currentPlan === 'yearly' ? 'Yearly' : 'Monthly'}
                  styles={styles}
                />
                <View style={styles.divider} />
                <Row label="Price" value={`${money(PLUS_PRICE[currentPlan])}`} styles={styles} />
                <View style={styles.divider} />
                <Row label="Renews on" value={renewsOn ?? '—'} styles={styles} />
                <View style={styles.divider} />
                <Row label="Payment" value="Visa •••• 4242" styles={styles} />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {subscribed ? (
          <Button
            label="Cancel membership"
            variant="secondary"
            onPress={() => setCancelOpen(true)}
          />
        ) : (
          <Button
            label={`Subscribe · ${money(PLUS_PRICE[plan])}${plan === 'yearly' ? '/yr' : '/mo'}`}
            icon="star"
            onPress={onSubscribe}
          />
        )}
      </View>

      <ConfirmModal
        visible={cancelOpen}
        icon="close-circle-outline"
        title="Cancel Bookit Plus?"
        message="You'll keep your benefits until the end of the current billing period."
        confirmLabel="Cancel membership"
        destructive
        onConfirm={() => {
          setCancelOpen(false);
          cancel();
          showToast('Membership cancelled');
        }}
        onCancel={() => setCancelOpen(false)}
      />
    </View>
  );
}

function Row({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
    back: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -spacing.sm,
      marginBottom: spacing.sm,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      paddingVertical: 4,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    badgeText: {
      ...typography.scale.caption,
      color: c.text.inverse,
      fontFamily: typography.font.bold,
      fontWeight: '700',
      letterSpacing: 1,
    },
    heroTitle: { ...typography.scale.display, color: c.text.inverse },
    heroSub: { ...typography.scale.body, color: c.text.inverse, opacity: 0.9 },
    body: { padding: spacing.lg },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.lg,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    benefitIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flex1: { flex: 1 },
    benefitTitle: { ...typography.scale.bodyMedium, color: c.text.primary },
    benefitSub: { ...typography.scale.caption, color: c.text.muted },
    divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    planRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      marginBottom: spacing.sm,
    },
    planRowActive: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    planName: { ...typography.scale.bodyMedium, color: c.text.primary },
    saveTag: {
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.status.successSoft,
    },
    saveText: {
      ...typography.scale.caption,
      fontSize: 10,
      color: c.status.success,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    planPrice: { ...typography.scale.h2, color: c.brand.tint, marginTop: 2 },
    planPer: { ...typography.scale.small, color: c.text.muted },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
    rowLabel: { ...typography.scale.small, color: c.text.secondary },
    rowValue: { ...typography.scale.smallMedium, color: c.text.primary },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
