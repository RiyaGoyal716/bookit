import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, EmptyState, Input, MapPlaceholder } from '../../../src/components';
import { showToast } from '../../../src/stores/toastStore';
import { useProviderStore, type ProJobStatus } from '../../../src/stores/providerStore';
import { useColors, radius, spacing, typography, type Palette } from '../../../src/theme';
import { useMoney } from '../../../src/i18n';

const STATUS_LABEL: Record<ProJobStatus, string> = {
  request: 'New request',
  offer: 'Posted task',
  scheduled: 'Scheduled',
  in_progress: 'In progress',
  completed: 'Completed',
  declined: 'Declined',
};

export default function ProJobDetail() {
  const router = useRouter();
  const c = useColors();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const job = useProviderStore((s) => s.jobs.find((j) => j.id === id));
  const acceptJob = useProviderStore((s) => s.acceptJob);
  const declineJob = useProviderStore((s) => s.declineJob);
  const advanceJob = useProviderStore((s) => s.advanceJob);
  const sendQuote = useProviderStore((s) => s.sendQuote);

  const [quote, setQuote] = useState('');

  if (!job) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <EmptyState icon="briefcase-outline" title="Job not found" />
      </View>
    );
  }

  const primaryCta = () => {
    if (job.status === 'scheduled') {
      return (
        <Button
          label="Start job"
          icon="play"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            advanceJob(job.id);
            showToast('Job started');
          }}
        />
      );
    }
    if (job.status === 'in_progress') {
      return (
        <Button
          label="Mark complete"
          icon="checkmark-done"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            advanceJob(job.id);
            showToast('Job completed');
          }}
        />
      );
    }
    if (job.status === 'completed') {
      return <Button label="Completed" icon="checkmark-circle" disabled onPress={() => {}} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Job {job.id}</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.statusTag}>
          <Text style={styles.statusText}>{STATUS_LABEL[job.status]}</Text>
        </View>

        <Text style={styles.service}>{job.service}</Text>
        <Text style={styles.amount}>
          {job.status === 'offer' ? `Budget ${money(job.budget ?? 0)}` : money(job.amount)}
        </Text>

        <MapPlaceholder height={140} style={{ marginVertical: spacing.lg }} caption={job.area} />

        <View style={styles.card}>
          <Row icon="person-outline" label="Customer" value={job.customer} styles={styles} c={c} />
          <Row
            icon="calendar-outline"
            label="When"
            value={`${job.date} · ${job.time}`}
            styles={styles}
            c={c}
          />
          <Row icon="location-outline" label="Area" value={job.area} styles={styles} c={c} />
        </View>

        <View style={styles.contactRow}>
          <Button
            label="Call"
            variant="secondary"
            icon="call"
            style={styles.flex1}
            onPress={() =>
              Linking.openURL('tel:+441130000000').catch(() => showToast('Calling unavailable'))
            }
          />
          <Button
            label="Message"
            variant="secondary"
            icon="chatbubble-ellipses"
            style={styles.flex1}
            onPress={() => showToast('Opening chat (demo)')}
          />
        </View>

        {job.status === 'offer' ? (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteTitle}>Send a quote</Text>
            <Input
              label="Your price (GBP)"
              value={quote}
              onChangeText={setQuote}
              placeholder={`${job.budget ?? 40}`}
              keyboardType="number-pad"
            />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {job.status === 'request' ? (
          <View style={styles.footerRow}>
            <Button
              label="Decline"
              variant="secondary"
              style={styles.flex1}
              onPress={() => {
                declineJob(job.id);
                showToast('Declined');
                router.back();
              }}
            />
            <Button
              label="Accept"
              style={styles.flex1}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                acceptJob(job.id);
                showToast('Accepted');
              }}
            />
          </View>
        ) : job.status === 'offer' ? (
          <Button
            label="Send quote"
            icon="send"
            disabled={!quote.trim()}
            onPress={() => {
              sendQuote(job.id, Math.round(Number(quote) || 0));
              showToast('Quote sent');
              router.back();
            }}
          />
        ) : (
          primaryCta()
        )}
      </View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  styles,
  c,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={c.text.muted} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
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
    statusTag: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
    },
    statusText: {
      ...typography.scale.caption,
      color: c.brand.tint,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    service: { ...typography.scale.h1, color: c.text.primary, marginTop: spacing.md },
    amount: { ...typography.scale.h2, color: c.brand.tint, marginTop: 2 },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
      gap: spacing.md,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    rowLabel: { ...typography.scale.small, color: c.text.secondary, width: 80 },
    rowValue: {
      flex: 1,
      textAlign: 'right',
      ...typography.scale.smallMedium,
      color: c.text.primary,
    },
    contactRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
    flex1: { flex: 1 },
    quoteCard: {
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    quoteTitle: { ...typography.scale.bodyMedium, color: c.text.primary, marginBottom: spacing.md },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
    footerRow: { flexDirection: 'row', gap: spacing.md },
  });
