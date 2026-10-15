import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Text,
  Icon,
  IconButton,
  Button,
  Card,
  Banner,
  StatusPill,
  PressableScale,
} from '../../src/components/ui';
import type { IconName } from '../../src/components/ui';
import { BarChart, type BarDatum } from '../../src/components';
import { route } from '../../src/lib/nav';
import { haptics } from '../../src/lib/haptics';
import { showToast } from '../../src/stores/toastStore';
import { useProviderStore, WEEKLY_EARNINGS, type ProJob } from '../../src/stores/providerStore';
import { useTokens, radius, spacing, spring, type NovaTokens } from '../../src/theme';
import { useMoney } from '../../src/i18n';

export default function ProDashboard() {
  const router = useRouter();
  const t = useTokens();
  const money = useMoney();
  const insets = useSafeAreaInsets();

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
  const nextJob = todays[0];

  const chartData = useMemo<BarDatum[]>(
    () => WEEKLY_EARNINGS.map((w) => ({ label: w.label, value: w.amount })),
    [],
  );

  const kpis: { icon: IconName; value: string; label: string }[] = [
    { icon: 'briefcase', value: `${todays.length}`, label: 'Today' },
    { icon: 'banknote', value: money(weekEarnings), label: 'This week' },
    { icon: 'star', value: rating.toFixed(1), label: 'Rating' },
    { icon: 'check-all', value: `${acceptanceRate}%`, label: 'Acceptance' },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + spacing.sm }]}
    >
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <View style={styles.flex1}>
          <Text variant="title2">Today</Text>
          <Text variant="caption" tone="muted">
            Leeds · Cleaning
          </Text>
        </View>
        <IconButton
          name="book"
          accessibilityLabel="Pro guidelines"
          variant="subtle"
          onPress={() => router.push(route('/pro/guidelines'))}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        {verification !== 'verified' ? (
          <Banner
            tone={verification === 'pending' ? 'warning' : 'info'}
            title={verification === 'pending' ? 'Verification in review' : 'Finish setting up'}
            message={
              verification === 'pending'
                ? "We're reviewing your documents — usually within 24 hours."
                : 'Complete onboarding to start receiving jobs.'
            }
            actionLabel={verification === 'pending' ? 'View status' : 'Start onboarding'}
            onAction={() =>
              router.push(
                route(verification === 'pending' ? '/pro/verification' : '/pro/onboarding'),
              )
            }
          />
        ) : null}

        {/* KPI row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kpiRow}
        >
          {kpis.map((k) => (
            <Card key={k.label} variant="outlined" padding={spacing.md} style={styles.kpiTile}>
              <Icon name={k.icon} size={20} color={t.accent} />
              <Text variant="title2" tabular>
                {k.value}
              </Text>
              <Text variant="caption" tone="muted">
                {k.label}
              </Text>
            </Card>
          ))}
        </ScrollView>

        {/* Next job */}
        {nextJob ? (
          <>
            <Text variant="headline" style={styles.section}>
              Next job
            </Text>
            <Card variant="raised" style={styles.nextCard}>
              <View style={styles.nextTop}>
                <View style={[styles.timePill, { backgroundColor: t.accentSoft }]}>
                  <Text variant="footnote" tone="accent" tabular>
                    {nextJob.time}
                  </Text>
                </View>
                {nextJob.status === 'in_progress' ? (
                  <StatusPill label="In progress" tone="warning" />
                ) : (
                  <StatusPill label="Scheduled" tone="accent" />
                )}
              </View>
              <Text variant="title2">{nextJob.service}</Text>
              <Text variant="footnote" tone="muted">
                {nextJob.customer} · {nextJob.area}
              </Text>
              <View style={styles.nextFooter}>
                <Text variant="title2" tone="accent" tabular>
                  {money(nextJob.amount)}
                </Text>
                <Button
                  label="Open job"
                  icon="arrow-right"
                  iconPosition="right"
                  fullWidth={false}
                  onPress={() => router.push(route(`/pro/jobs/${nextJob.id}`))}
                />
              </View>
            </Card>
          </>
        ) : null}

        {/* This week chart */}
        <View style={styles.sectionRow}>
          <Text variant="headline">This week</Text>
          <PressableScale
            onPress={() => router.push(route('/pro/earnings'))}
            accessibilityRole="button"
            accessibilityLabel="Earnings and payouts"
          >
            <Text variant="footnote" tone="accent">
              Earnings
            </Text>
          </PressableScale>
        </View>
        <Card variant="outlined">
          <BarChart
            data={chartData}
            height={150}
            formatValue={(v) => money(v)}
            highlightIndex={5}
          />
        </Card>

        {/* Requests */}
        {requests.length > 0 ? (
          <>
            <Text variant="headline" style={styles.section}>
              Job requests
            </Text>
            <Text variant="caption" tone="muted">
              Swipe right to accept, left to decline.
            </Text>
            {requests.map((j) => (
              <RequestCard
                key={j.id}
                job={j}
                tokens={t}
                money={money}
                onAccept={() => {
                  haptics.success();
                  acceptJob(j.id);
                  showToast('Job accepted');
                }}
                onDecline={() => {
                  haptics.warning();
                  declineJob(j.id);
                  showToast('Job declined');
                }}
                onOpen={() => router.push(route(`/pro/jobs/${j.id}`))}
              />
            ))}
          </>
        ) : null}

        {/* Offers */}
        {offers.length > 0 ? (
          <>
            <Text variant="headline" style={styles.section}>
              Posted tasks · send a quote
            </Text>
            {offers.map((j) => (
              <Card key={j.id} variant="outlined" padding={spacing.md} style={styles.offerCard}>
                <View style={styles.flex1}>
                  <Text variant="headline">{j.service}</Text>
                  <Text variant="caption" tone="muted">
                    {j.customer} · {j.area}
                  </Text>
                  <Text variant="footnote" tone="accent" tabular>
                    Budget {money(j.budget ?? 0)}
                  </Text>
                </View>
                <Button
                  label="Quote"
                  variant="secondary"
                  size="sm"
                  fullWidth={false}
                  onPress={() => router.push(route(`/pro/jobs/${j.id}`))}
                />
              </Card>
            ))}
          </>
        ) : null}

        {/* Schedule */}
        <Text variant="headline" style={styles.section}>
          {"Today's schedule"}
        </Text>
        {todays.length === 0 ? (
          <Text variant="footnote" tone="muted">
            No more jobs today. Enjoy the break!
          </Text>
        ) : (
          todays.map((j) => (
            <PressableScale
              key={j.id}
              onPress={() => router.push(route(`/pro/jobs/${j.id}`))}
              accessibilityRole="button"
              accessibilityLabel={`${j.service} for ${j.customer} at ${j.time}`}
              style={[styles.jobRow, { borderColor: t.border, backgroundColor: t.surface }]}
            >
              <View style={[styles.timePill, { backgroundColor: t.accentSoft }]}>
                <Text variant="footnote" tone="accent" tabular>
                  {j.time}
                </Text>
              </View>
              <View style={styles.flex1}>
                <Text variant="headline">{j.service}</Text>
                <Text variant="caption" tone="muted">
                  {j.customer} · {j.area}
                </Text>
              </View>
              <Text variant="headline" tone="accent" tabular>
                {money(j.amount)}
              </Text>
            </PressableScale>
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

const RING = 44;
const STROKE = 4;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function CountdownRing({
  remaining,
  total,
  tokens,
}: {
  remaining: number;
  total: number;
  tokens: NovaTokens;
}) {
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const expired = remaining <= 0;
  const mm = Math.floor(remaining / 60);
  const ss = `${remaining % 60}`.padStart(2, '0');
  const color = expired ? tokens.textMuted : frac < 0.3 ? tokens.danger : tokens.warning;
  return (
    <View style={styles.ring}>
      <Svg width={RING} height={RING}>
        <Circle
          cx={RING / 2}
          cy={RING / 2}
          r={R}
          stroke={tokens.border}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={RING / 2}
          cy={RING / 2}
          r={R}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - frac)}
          transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Text variant="micro" tabular tone={expired ? 'muted' : 'default'}>
          {expired ? 'Exp' : `${mm}:${ss}`}
        </Text>
      </View>
    </View>
  );
}

function RequestCard({
  job,
  onAccept,
  onDecline,
  onOpen,
  tokens,
  money,
}: {
  job: ProJob;
  onAccept: () => void;
  onDecline: () => void;
  onOpen: () => void;
  tokens: NovaTokens;
  money: (n: number) => string;
}) {
  const [total] = useState(job.expiresInSec ?? 0);
  const [remaining, setRemaining] = useState(job.expiresInSec ?? 0);
  const [committed, setCommitted] = useState(false);
  const x = useSharedValue(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const expired = remaining <= 0;

  const commit = (dir: 'accept' | 'decline') => {
    if (committed) return;
    setCommitted(true);
    if (dir === 'accept') onAccept();
    else onDecline();
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .enabled(!expired && !committed)
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > 110) {
        x.value = withSpring(400, spring.snappy);
        runOnJS(commit)('accept');
      } else if (e.translationX < -110) {
        x.value = withSpring(-400, spring.snappy);
        runOnJS(commit)('decline');
      } else {
        x.value = withSpring(0, spring.snappy);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const acceptBg = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, 110], [0, 1], Extrapolation.CLAMP),
  }));
  const declineBg = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-110, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.swipeWrap}>
      <Animated.View
        style={[
          styles.swipeHint,
          styles.swipeAccept,
          { backgroundColor: tokens.success },
          acceptBg,
        ]}
      >
        <Icon name="check" size={24} color={tokens.onPrimary} />
      </Animated.View>
      <Animated.View
        style={[
          styles.swipeHint,
          styles.swipeDecline,
          { backgroundColor: tokens.danger },
          declineBg,
        ]}
      >
        <Icon name="close" size={24} color={tokens.onPrimary} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={cardStyle}>
          <Card
            variant="outlined"
            padding={spacing.md}
            style={[styles.requestCard, { borderColor: tokens.primary }]}
          >
            <PressableScale
              onPress={onOpen}
              haptic={null}
              accessibilityRole="button"
              accessibilityLabel={`Request: ${job.service}`}
              style={styles.requestTop}
            >
              <View style={styles.flex1}>
                <Text variant="headline">{job.service}</Text>
                <Text variant="caption" tone="muted">
                  {job.customer} · {job.area}
                </Text>
                <Text variant="caption" tone="muted">
                  {job.date} · {job.time}
                </Text>
                <Text variant="headline" tone="accent" tabular style={styles.reqAmount}>
                  {money(job.amount)}
                </Text>
              </View>
              <CountdownRing remaining={remaining} total={total} tokens={tokens} />
            </PressableScale>
            <View style={styles.requestActions}>
              <Button
                label="Decline"
                variant="secondary"
                style={styles.flex1}
                onPress={onDecline}
              />
              <Button label="Accept" style={styles.flex1} disabled={expired} onPress={onAccept} />
            </View>
          </Card>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  flex1: { flex: 1 },
  kpiRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  kpiTile: { width: 120, gap: 2 },
  section: { marginTop: spacing.md },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  nextCard: { gap: spacing.xs },
  nextTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  nextFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  timePill: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.md },
  swipeWrap: { position: 'relative', marginBottom: spacing.xs },
  swipeHint: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  swipeAccept: { left: 0 },
  swipeDecline: { right: 0 },
  requestCard: { gap: spacing.md },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reqAmount: { marginTop: spacing.xs },
  requestActions: { flexDirection: 'row', gap: spacing.md },
  ring: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  ringLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  proActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
