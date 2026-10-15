import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Chip,
  TextField,
  Text,
  Icon,
  StatusPill,
  PressableScale,
} from '../src/components/ui';
import { showToast } from '../src/stores/toastStore';
import {
  useTicketsStore,
  TICKET_CATEGORIES,
  type Ticket,
  type TicketStatus,
} from '../src/stores/ticketsStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const STATUS_META: Record<TicketStatus, { label: string; tone: 'warning' | 'info' | 'success' }> = {
  open: { label: 'Open', tone: 'warning' },
  in_review: { label: 'In review', tone: 'info' },
  resolved: { label: 'Resolved', tone: 'success' },
};

export default function ReportScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const tickets = useTicketsStore((s) => s.tickets);
  const create = useTicketsStore((s) => s.create);

  const [category, setCategory] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const canSubmit =
    Boolean(category) && subject.trim().length >= 3 && description.trim().length >= 5;

  const submit = () => {
    if (!canSubmit || !category) return;
    const ticket = create({ subject: subject.trim(), category, description: description.trim() });
    setCategory(null);
    setSubject('');
    setDescription('');
    setExpanded(ticket.id);
    showToast(`Report ${ticket.id} submitted`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <PressableScale
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="chevron-left" size={24} color={c.text.primary} />
        </PressableScale>
        <Text variant="title2" style={styles.title}>
          Report a problem
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="footnote" tone="muted" style={styles.label}>
          What’s it about?
        </Text>
        <View style={styles.catWrap}>
          {TICKET_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>

        <View style={styles.field}>
          <TextField
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="Short summary"
          />
        </View>
        <View style={styles.field}>
          <TextField
            label="Describe the problem"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us what happened…"
            multiline
            maxLength={600}
          />
        </View>
        <Button
          label="Submit report"
          icon="send"
          disabled={!canSubmit}
          onPress={submit}
          style={styles.submit}
        />

        <Text variant="title2" style={styles.sectionTitle}>
          Your reports
        </Text>
        {tickets.length === 0 ? (
          <Text variant="caption" tone="muted">
            You haven’t reported anything yet.
          </Text>
        ) : (
          tickets.map((t: Ticket) => {
            const open = expanded === t.id;
            return (
              <PressableScale
                key={t.id}
                style={styles.ticket}
                onPress={() => setExpanded(open ? null : t.id)}
                accessibilityRole="button"
                accessibilityLabel={`Ticket ${t.id}, ${STATUS_META[t.status].label}`}
              >
                <View style={styles.ticketTop}>
                  <View style={styles.flex1}>
                    <Text variant="headline">{t.subject}</Text>
                    <Text variant="caption" tone="muted">
                      {t.id} · {t.category} · {t.createdAt}
                    </Text>
                  </View>
                  <StatusPill
                    label={STATUS_META[t.status].label}
                    tone={STATUS_META[t.status].tone}
                  />
                </View>
                {open ? (
                  <View style={styles.updates}>
                    <Text variant="caption" tone="muted">
                      {t.description}
                    </Text>
                    {t.updates.map((u, i) => (
                      <View key={i} style={styles.updateRow}>
                        <Icon
                          name={u.fromSupport ? 'message' : 'user'}
                          size={16}
                          color={c.brand.tint}
                        />
                        <View style={styles.flex1}>
                          <Text variant="caption">{u.text}</Text>
                          <Text variant="caption" tone="muted" style={styles.updateTime}>
                            {u.time}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </PressableScale>
            );
          })
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
    label: { marginBottom: spacing.sm, fontWeight: '600' },
    catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    field: { marginBottom: spacing.md },
    submit: { marginTop: spacing.sm },
    sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
    ticket: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      marginBottom: spacing.sm,
    },
    ticketTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    flex1: { flex: 1 },
    updates: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      gap: spacing.md,
    },
    updateRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    updateTime: { marginTop: 2 },
  });
