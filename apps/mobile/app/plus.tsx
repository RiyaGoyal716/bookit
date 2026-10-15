import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  Button,
  Text,
  Icon,
  IconButton,
  PressableScale,
  type IconName,
} from '../src/components/ui';
import { showToast } from '../src/stores/toastStore';
import { usePlusStore, PLUS_PRICE, type PlusPlan } from '../src/stores/plusStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

const BENEFITS: { icon: IconName; title: string; sub: string }[] = [
  { icon: 'tag', title: '10% off every booking', sub: 'Applied automatically at checkout' },
  { icon: 'zap', title: 'Priority matching', sub: 'Get the fastest-responding pros first' },
  {
    icon: 'shield-check',
    title: 'Free cancellation',
    sub: 'Cancel up to 2 hours before, any time',
  },
  { icon: 'phone', title: 'Priority support', sub: 'Skip the queue with a dedicated line' },
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

  const onSubscribe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    subscribe(plan);
    showToast('Welcome to Bookit Plus!');
  };

  const onCancelMembership = () => {
    Alert.alert(
      'Cancel Bookit Plus?',
      "You'll keep your benefits until the end of the current billing period.",
      [
        { text: 'Keep membership', style: 'cancel' },
        {
          text: 'Cancel membership',
          style: 'destructive',
          onPress: () => {
            cancel();
            showToast('Membership cancelled');
          },
        },
      ],
    );
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
          <IconButton
            name="chevron-left"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            color={c.text.inverse}
            style={styles.back}
          />
          <View style={styles.badge}>
            <Icon name="star" size={16} color={c.text.inverse} />
            <Text variant="caption" tone="inverse" style={styles.badgeText}>
              BOOKIT PLUS
            </Text>
          </View>
          <Text variant="display" tone="inverse">
            Save more on every booking
          </Text>
          <Text variant="body" tone="inverse" style={styles.heroSub}>
            {subscribed
              ? `You're a Plus member · renews ${renewsOn ?? ''}`
              : 'Members save an average of £84 a year'}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <Text variant="title2" style={styles.sectionTitle}>
            Benefits
          </Text>
          <View style={styles.card}>
            {BENEFITS.map((b, i) => (
              <View
                key={b.title}
                style={[styles.benefitRow, i < BENEFITS.length - 1 && styles.divider]}
              >
                <View style={styles.benefitIcon}>
                  <Icon name={b.icon} size={20} color={c.brand.tint} />
                </View>
                <View style={styles.flex1}>
                  <Text variant="headline">{b.title}</Text>
                  <Text variant="caption" tone="muted">
                    {b.sub}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {!subscribed ? (
            <>
              <Text variant="title2" style={styles.sectionTitle}>
                Choose a plan
              </Text>
              {(['yearly', 'monthly'] as PlusPlan[]).map((p) => {
                const active = plan === p;
                return (
                  <PressableScale
                    key={p}
                    onPress={() => setPlan(p)}
                    style={[styles.planRow, active && styles.planRowActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${p} plan`}
                  >
                    <View style={styles.flex1}>
                      <View style={styles.planTitleRow}>
                        <Text variant="headline">{p === 'yearly' ? 'Yearly' : 'Monthly'}</Text>
                        {p === 'yearly' ? (
                          <View style={styles.saveTag}>
                            <Text variant="micro" tone="success" style={styles.saveText}>
                              Best value · 2 months free
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text variant="title2" tone="accent" style={styles.planPrice}>
                        {money(PLUS_PRICE[p])}
                        <Text variant="caption" tone="muted">
                          {p === 'yearly' ? ' / year' : ' / month'}
                        </Text>
                      </Text>
                    </View>
                    <Icon
                      name={active ? 'check-circle' : 'circle'}
                      size={24}
                      color={active ? c.brand.tint : c.text.muted}
                    />
                  </PressableScale>
                );
              })}
            </>
          ) : (
            <>
              <Text variant="title2" style={styles.sectionTitle}>
                Billing
              </Text>
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
          <Button label="Cancel membership" variant="secondary" onPress={onCancelMembership} />
        ) : (
          <Button
            label={`Subscribe · ${money(PLUS_PRICE[plan])}${plan === 'yearly' ? '/yr' : '/mo'}`}
            icon="star"
            onPress={onSubscribe}
          />
        )}
      </View>
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
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="footnote" style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
    back: { marginLeft: -spacing.sm, marginBottom: spacing.sm },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      paddingVertical: 4,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.glass,
    },
    badgeText: { fontWeight: '700', letterSpacing: 1 },
    heroSub: { opacity: 0.9 },
    body: { padding: spacing.lg },
    sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.md },
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
    saveTag: {
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.status.successSoft,
    },
    saveText: { fontWeight: '700' },
    planPrice: { marginTop: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
    rowValue: { fontWeight: '600' },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
  });
