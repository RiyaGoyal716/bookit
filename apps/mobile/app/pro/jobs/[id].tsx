import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  Text,
  Icon,
  IconButton,
  Button,
  TextField,
  EmptyState,
  type IconName,
} from '../../../src/components/ui';
import { showToast } from '../../../src/stores/toastStore';
import { useProviderStore, type ProJobStatus } from '../../../src/stores/providerStore';
import { useColors, radius, spacing, type Palette } from '../../../src/theme';
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
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}
        />
        <EmptyState art="search" title="Job not found" />
      </View>
    );
  }

  const primaryCta = () => {
    if (job.status === 'scheduled') {
      return (
        <Button
          label="Start job"
          icon="arrow-right"
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
          icon="check-all"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            advanceJob(job.id);
            showToast('Job completed');
          }}
        />
      );
    }
    if (job.status === 'completed') {
      return <Button label="Completed" icon="check-circle" disabled onPress={() => {}} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          Job {job.id}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.statusTag}>
          <Text variant="caption" tone="accent" style={styles.statusText}>
            {STATUS_LABEL[job.status]}
          </Text>
        </View>

        <Text variant="title1" style={styles.service}>
          {job.service}
        </Text>
        <Text variant="title2" tone="accent" tabular style={styles.amount}>
          {job.status === 'offer' ? `Budget ${money(job.budget ?? 0)}` : money(job.amount)}
        </Text>

        <View style={styles.mapPlaceholder}>
          <Icon name="map-pin" size={24} color={c.text.muted} />
          <Text variant="caption" tone="muted">
            {job.area}
          </Text>
        </View>

        <View style={styles.card}>
          <Row icon="user" label="Customer" value={job.customer} styles={styles} c={c} />
          <Row
            icon="calendar"
            label="When"
            value={`${job.date} · ${job.time}`}
            styles={styles}
            c={c}
          />
          <Row icon="map-pin" label="Area" value={job.area} styles={styles} c={c} />
        </View>

        <View style={styles.contactRow}>
          <Button
            label="Call"
            variant="secondary"
            icon="phone"
            style={styles.flex1}
            onPress={() =>
              Linking.openURL('tel:+441130000000').catch(() => showToast('Calling unavailable'))
            }
          />
          <Button
            label="Message"
            variant="secondary"
            icon="message"
            style={styles.flex1}
            onPress={() => showToast('Opening chat (demo)')}
          />
        </View>

        {job.status === 'offer' ? (
          <View style={styles.quoteCard}>
            <Text variant="headline" style={styles.quoteTitle}>
              Send a quote
            </Text>
            <TextField
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
  icon: IconName;
  label: string;
  value: string;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={16} color={c.text.muted} />
      <Text variant="caption" tone="muted" style={styles.rowLabel}>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { marginLeft: -spacing.xs },
    title: { flex: 1 },
    statusTag: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
    },
    statusText: { fontWeight: '700' },
    service: { marginTop: spacing.md },
    amount: { marginTop: 2 },
    mapPlaceholder: {
      height: 140,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.muted,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginVertical: spacing.lg,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      padding: spacing.lg,
      gap: spacing.md,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    rowLabel: { width: 80 },
    rowValue: {
      flex: 1,
      textAlign: 'right',
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
    quoteTitle: { marginBottom: spacing.md },
    footer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
    footerRow: { flexDirection: 'row', gap: spacing.md },
  });
