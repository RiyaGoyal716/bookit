import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { BarChart, Button, InlineBanner, type BarDatum } from '../../src/components';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import { useProviderStore, WEEKLY_EARNINGS, type ProJob } from '../../src/stores/providerStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';
import { useMoney } from '../../src/i18n';

export default function ProDashboard() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const verification = useProviderStore((s) => s.verification);
  const jobs = useProviderStore((s) => s.jobs);
  const rating = useProviderStore((s) => s.rating);
  const acceptanceRate = useProviderStore((s) => s.acceptanceRate);
  const weekEarnings = useProviderStore((s) => s.weekEarnings());
  const acceptJob = useProviderStore((s) => s.acceptJob);
  const declineJob = useProviderStore((s) => s.declineJob);

  const requests = jobs.filter((j) => j.status === 'request');
  const offers = jobs.filter((j) => j.status === 'offer');
  const todays = jobs.filter(
    (j) => j.date === 'Today' && (j.status === 'scheduled' || j.status === 'in_progress'),
  );

  const chartData = useMemo<BarDatum[]>(
    () => WEEKLY_EARNINGS.map((w) => ({ label: w.label, value: w.amount })),
    [],
  );

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
        <View style={styles.flex1}>
          <Text style={styles.title}>Pro dashboard</Text>
          <Text style={styles.subtitle}>Leeds · Cleaning</Text>
        </View>
        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push(route('/pro/guidelines'))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Pro guidelines"
        >
          <Ionicons name="book-outline" size={22} color={c.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {verification !== 'verified' ? (
          <InlineBanner
            tone={verification === 'pending' ? 'warning' : 'info'}
            icon={verification === 'pending' ? 'time-outline' : 'shield-outline'}
            title={verification === 'pending' ? 'Verification in review' : 'Finish setting up'}
            message={
              verification === 'pending'
                ? 'We’re reviewing your documents — usually within 24 hours.'
                : 'Complete onboarding to start receiving jobs.'
            }
            actionLabel={verification === 'pending' ? 'View status' : 'Start onboarding'}
            onAction={() =>
              router.push(
                route(verification === 'pending' ? '/pro/verification' : '/pro/onboarding'),
              )
            }
            style={{ marginBottom: spacing.lg }}
          />
        ) : null}

        <View style={styles.statGrid}>
          <StatTile
            icon="briefcase"
            value={`${todays.length}`}
            label="Today’s jobs"
            styles={styles}
            c={c}
          />
          <StatTile
            icon="cash"
            value={money(weekEarnings)}
            label="This week"
            styles={styles}
            c={c}
          />
          <StatTile icon="star" value={rating.toFixed(1)} label="Rating" styles={styles} c={c} />
          <StatTile
            icon="checkmark-done"
            value={`${acceptanceRate}%`}
            label="Acceptance"
            styles={styles}
            c={c}
          />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>This week</Text>
          <Pressable
            onPress={() => router.push(route('/pro/earnings'))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Earnings and payouts"
          >
            <Text style={styles.link}>Earnings</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <BarChart
            data={chartData}
            height={150}
            formatValue={(v) => money(v)}
            highlightIndex={5}
          />
        </View>

        {requests.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Job requests</Text>
            {requests.map((j) => (
              <RequestCard
                key={j.id}
                job={j}
                onAccept={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
                    () => {},
                  );
                  acceptJob(j.id);
                  showToast('Job accepted');
                }}
                onDecline={() => {
                  declineJob(j.id);
                  showToast('Job declined');
                }}
                onOpen={() => router.push(route(`/pro/jobs/${j.id}`))}
                styles={styles}
                c={c}
                money={money}
              />
            ))}
          </>
        ) : null}

        {offers.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Posted tasks · send a quote</Text>
            {offers.map((j) => (
              <Pressable
                key={j.id}
                style={styles.offerCard}
                onPress={() => router.push(route(`/pro/jobs/${j.id}`))}
                accessibilityRole="button"
                accessibilityLabel={`Quote on ${j.service}`}
              >
                <View style={styles.flex1}>
                  <Text style={styles.jobService}>{j.service}</Text>
                  <Text style={styles.jobMeta}>
                    {j.customer} · {j.area}
                  </Text>
                  <Text style={styles.budget}>Budget {money(j.budget ?? 0)}</Text>
                </View>
                <Button
                  label="Quote"
                  variant="secondary"
                  style={styles.quoteBtn}
                  onPress={() => router.push(route(`/pro/jobs/${j.id}`))}
                />
              </Pressable>
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Today’s schedule</Text>
        {todays.length === 0 ? (
          <Text style={styles.empty}>No more jobs today. Enjoy the break!</Text>
        ) : (
          todays.map((j) => (
            <Pressable
              key={j.id}
              style={styles.jobRow}
              onPress={() => router.push(route(`/pro/jobs/${j.id}`))}
              accessibilityRole="button"
              accessibilityLabel={`${j.service} for ${j.customer} at ${j.time}`}
            >
              <View style={styles.timePill}>
                <Text style={styles.timePillText}>{j.time}</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.jobService}>{j.service}</Text>
                <Text style={styles.jobMeta}>
                  {j.customer} · {j.area}
                </Text>
              </View>
              <Text style={styles.jobAmount}>{money(j.amount)}</Text>
            </Pressable>
          ))
        )}

        <View style={styles.proActions}>
          <Button
            label="Availability"
            variant="secondary"
            icon="calendar"
            style={styles.flex1}
            onPress={() => router.push(route('/pro/availability'))}
          />
          <Button
            label="Earnings"
            variant="secondary"
            icon="wallet"
            style={styles.flex1}
            onPress={() => router.push(route('/pro/earnings'))}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({
  icon,
  value,
  label,
  styles,
  c,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <View style={styles.statTile}>
      <Ionicons name={icon} size={18} color={c.brand.tint} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RequestCard({
  job,
  onAccept,
  onDecline,
  onOpen,
  styles,
  c,
  money,
}: {
  job: ProJob;
  onAccept: () => void;
  onDecline: () => void;
  onOpen: () => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  money: (n: number) => string;
}) {
  const [remaining, setRemaining] = useState(job.expiresInSec ?? 0);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const mm = Math.floor(remaining / 60);
  const ss = `${remaining % 60}`.padStart(2, '0');
  const expired = remaining <= 0;

  return (
    <Pressable
      style={styles.requestCard}
      onPress={onOpen}
      accessibilityRole="button"
      accessibilityLabel={`Request: ${job.service}`}
    >
      <View style={styles.requestTop}>
        <View style={styles.flex1}>
          <Text style={styles.jobService}>{job.service}</Text>
          <Text style={styles.jobMeta}>
            {job.customer} · {job.area}
          </Text>
          <Text style={styles.jobMeta}>
            {job.date} · {job.time}
          </Text>
        </View>
        <View style={styles.requestRight}>
          <Text style={styles.jobAmount}>{money(job.amount)}</Text>
          <View style={[styles.countdown, expired && styles.countdownOff]}>
            <Ionicons
              name="time-outline"
              size={12}
              color={expired ? c.text.muted : c.status.warning}
            />
            <Text style={[styles.countdownText, expired && styles.countdownTextOff]}>
              {expired ? 'Expired' : `${mm}:${ss}`}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.requestActions}>
        <Button label="Decline" variant="secondary" style={styles.flex1} onPress={onDecline} />
        <Button label="Accept" style={styles.flex1} disabled={expired} onPress={onAccept} />
      </View>
    </Pressable>
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
    flex1: { flex: 1 },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.scale.h1, color: c.text.primary },
    subtitle: { ...typography.scale.small, color: c.text.secondary },
    statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    statTile: {
      width: '47%',
      flexGrow: 1,
      gap: 2,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    statValue: { ...typography.scale.h1, color: c.text.primary, marginTop: spacing.xs },
    statLabel: { ...typography.scale.caption, color: c.text.muted },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    link: { ...typography.scale.smallMedium, color: c.brand.tint },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
    },
    requestCard: {
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.brand.primary,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    requestTop: { flexDirection: 'row', gap: spacing.md },
    requestRight: { alignItems: 'flex-end', gap: spacing.xs },
    jobService: { ...typography.scale.bodyMedium, color: c.text.primary },
    jobMeta: { ...typography.scale.caption, color: c.text.muted },
    jobAmount: { ...typography.scale.h2, color: c.brand.tint },
    countdown: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.status.warningSoft,
    },
    countdownOff: { backgroundColor: c.background.muted },
    countdownText: {
      ...typography.scale.caption,
      color: c.status.warning,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    countdownTextOff: { color: c.text.muted },
    requestActions: { flexDirection: 'row', gap: spacing.md },
    offerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
      marginBottom: spacing.sm,
    },
    budget: { ...typography.scale.smallMedium, color: c.brand.tint, marginTop: 2 },
    quoteBtn: { minHeight: 44, paddingHorizontal: spacing.lg },
    jobRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    timePill: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
    },
    timePillText: { ...typography.scale.smallMedium, color: c.brand.tint },
    empty: { ...typography.scale.small, color: c.text.muted },
    proActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  });
