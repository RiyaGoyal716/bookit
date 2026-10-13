import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Chip, Input } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import {
  useTicketsStore,
  TICKET_CATEGORIES,
  type Ticket,
  type TicketStatus,
} from '../src/stores/ticketsStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

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

  const tone = (t: TicketStatus) => {
    const m = STATUS_META[t].tone;
    return m === 'warning' ? c.status.warning : m === 'info' ? c.status.info : c.status.success;
  };
  const toneBg = (t: TicketStatus) => {
    const m = STATUS_META[t].tone;
    return m === 'warning'
      ? c.status.warningSoft
      : m === 'info'
        ? c.status.infoSoft
        : c.status.successSoft;
  };

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
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Report a problem</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>What’s it about?</Text>
        <View style={styles.catWrap}>
          {TICKET_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>

        <Input
          containerStyle={styles.field}
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="Short summary"
        />
        <Input
          containerStyle={styles.field}
          label="Describe the problem"
          value={description}
          onChangeText={setDescription}
          placeholder="Tell us what happened…"
          multiline
          maxLength={600}
        />
        <Button
          label="Submit report"
          icon="send"
          disabled={!canSubmit}
          onPress={submit}
          style={styles.submit}
        />

        <Text style={styles.sectionTitle}>Your reports</Text>
        {tickets.length === 0 ? (
          <Text style={styles.empty}>You haven’t reported anything yet.</Text>
        ) : (
          tickets.map((t: Ticket) => {
            const open = expanded === t.id;
            return (
              <Pressable
                key={t.id}
                style={styles.ticket}
                onPress={() => setExpanded(open ? null : t.id)}
                accessibilityRole="button"
                accessibilityLabel={`Ticket ${t.id}, ${STATUS_META[t.status].label}`}
              >
                <View style={styles.ticketTop}>
                  <View style={styles.flex1}>
                    <Text style={styles.ticketSubject}>{t.subject}</Text>
                    <Text style={styles.ticketMeta}>
                      {t.id} · {t.category} · {t.createdAt}
                    </Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: toneBg(t.status) }]}>
                    <Text style={[styles.statusText, { color: tone(t.status) }]}>
                      {STATUS_META[t.status].label}
                    </Text>
                  </View>
                </View>
                {open ? (
                  <View style={styles.updates}>
                    <Text style={styles.ticketDesc}>{t.description}</Text>
                    {t.updates.map((u, i) => (
                      <View key={i} style={styles.updateRow}>
                        <Ionicons
                          name={u.fromSupport ? 'headset' : 'person'}
                          size={14}
                          color={c.brand.tint}
                        />
                        <View style={styles.flex1}>
                          <Text style={styles.updateText}>{u.text}</Text>
                          <Text style={styles.updateTime}>{u.time}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}
              </Pressable>
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
    title: { flex: 1, ...typography.scale.h2, color: c.text.primary },
    label: { ...typography.scale.smallMedium, color: c.text.secondary, marginBottom: spacing.sm },
    catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
    field: { marginBottom: spacing.md },
    submit: { marginTop: spacing.sm },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    empty: { ...typography.scale.small, color: c.text.muted },
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
    ticketSubject: { ...typography.scale.bodyMedium, color: c.text.primary },
    ticketMeta: { ...typography.scale.caption, color: c.text.muted },
    statusTag: { paddingVertical: 3, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
    statusText: {
      ...typography.scale.caption,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    updates: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      gap: spacing.md,
    },
    ticketDesc: { ...typography.scale.small, color: c.text.secondary },
    updateRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    updateText: { ...typography.scale.small, color: c.text.primary },
    updateTime: { ...typography.scale.caption, color: c.text.muted, marginTop: 2 },
  });
