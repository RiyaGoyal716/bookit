import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, InlineBanner, Input } from '../src/components';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useSafetyStore, type AccountStatus } from '../src/stores/safetyStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const STATUS_META: Record<
  AccountStatus,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    tone: 'success' | 'warning' | 'danger';
    sub: string;
  }
> = {
  active: {
    label: 'Active',
    icon: 'checkmark-circle',
    tone: 'success',
    sub: 'Your account is in good standing. Keep it up!',
  },
  under_review: {
    label: 'Under review',
    icon: 'hourglass',
    tone: 'warning',
    sub: 'We’re reviewing recent activity. Some features may be limited temporarily.',
  },
  restricted: {
    label: 'Restricted',
    icon: 'alert-circle',
    tone: 'danger',
    sub: 'Your account is restricted. Submit an appeal to request a review.',
  },
};

export default function AccountStatusScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const status = useSafetyStore((s) => s.accountStatus);
  const setStatus = useSafetyStore((s) => s.setAccountStatus);
  const violations = useSafetyStore((s) => s.violations);
  const appealSubmitted = useSafetyStore((s) => s.appealSubmitted);
  const submitAppeal = useSafetyStore((s) => s.submitAppeal);

  const [appeal, setAppeal] = useState('');
  const meta = STATUS_META[status];
  const toneColor =
    meta.tone === 'success'
      ? c.status.success
      : meta.tone === 'warning'
        ? c.status.warning
        : c.status.danger;
  const toneBg =
    meta.tone === 'success'
      ? c.status.successSoft
      : meta.tone === 'warning'
        ? c.status.warningSoft
        : c.status.dangerSoft;

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
        <Text style={styles.title}>Account status</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.statusCard, { backgroundColor: toneBg }]}>
          <View style={[styles.statusIcon, { backgroundColor: toneColor }]}>
            <Ionicons name={meta.icon} size={32} color={c.text.inverse} />
          </View>
          <Text style={styles.statusLabel}>{meta.label}</Text>
          <Text style={styles.statusSub}>{meta.sub}</Text>
        </View>

        {violations.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Notices</Text>
            {violations.map((v) => (
              <InlineBanner
                key={v.id}
                tone={v.severity === 'strike' ? 'danger' : 'warning'}
                title={v.title}
                message={v.reason}
                actionLabel="View details"
                onAction={() => router.push(route(`/violation/${v.id}`))}
                style={{ marginBottom: spacing.sm }}
              />
            ))}
          </>
        ) : null}

        {status !== 'active' ? (
          <>
            <Text style={styles.sectionTitle}>Appeal</Text>
            {appealSubmitted ? (
              <InlineBanner
                tone="info"
                title="Appeal submitted"
                message="Our team will review your appeal and respond within 3 business days."
              />
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardText}>
                  If you believe this is a mistake, tell us what happened and we’ll review.
                </Text>
                <Input
                  containerStyle={{ marginTop: spacing.md }}
                  value={appeal}
                  onChangeText={setAppeal}
                  placeholder="Explain your situation…"
                  multiline
                  maxLength={600}
                />
                <Button
                  label="Submit appeal"
                  disabled={appeal.trim().length < 10}
                  style={{ marginTop: spacing.md }}
                  onPress={() => {
                    submitAppeal();
                    showToast('Appeal submitted');
                  }}
                />
              </View>
            )}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Demo controls</Text>
        <View style={styles.segment}>
          {(['active', 'under_review', 'restricted'] as AccountStatus[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.segBtn, status === s && styles.segBtnActive]}
              onPress={() => setStatus(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: status === s }}
              accessibilityLabel={STATUS_META[s].label}
            >
              <Text style={[styles.segText, status === s && styles.segTextActive]}>
                {STATUS_META[s].label}
              </Text>
            </Pressable>
          ))}
        </View>
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
    statusCard: {
      alignItems: 'center',
      gap: spacing.xs,
      padding: spacing.xl,
      borderRadius: radius.xl,
    },
    statusIcon: {
      width: 68,
      height: 68,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    statusLabel: { ...typography.scale.h1, color: c.text.primary },
    statusSub: { ...typography.scale.small, color: c.text.secondary, textAlign: 'center' },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    cardText: { ...typography.scale.small, color: c.text.secondary },
    segment: {
      flexDirection: 'row',
      backgroundColor: c.background.muted,
      borderRadius: radius.md,
      padding: 4,
      gap: 4,
    },
    segBtn: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
    },
    segBtnActive: { backgroundColor: c.background.surface },
    segText: { ...typography.scale.caption, color: c.text.muted },
    segTextActive: {
      color: c.text.primary,
      fontFamily: typography.font.semibold,
      fontWeight: '600',
    },
  });
