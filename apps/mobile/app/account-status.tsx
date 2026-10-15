import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Banner,
  Button,
  Icon,
  PressableScale,
  ScreenHeader,
  Text,
  TextField,
  type IconName,
} from '../src/components/ui';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useSafetyStore, type AccountStatus } from '../src/stores/safetyStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const STATUS_META: Record<
  AccountStatus,
  {
    label: string;
    icon: IconName;
    tone: 'success' | 'warning' | 'danger';
    sub: string;
  }
> = {
  active: {
    label: 'Active',
    icon: 'check-circle',
    tone: 'success',
    sub: 'Your account is in good standing. Keep it up!',
  },
  under_review: {
    label: 'Under review',
    icon: 'clock',
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
      <ScreenHeader title="Account status" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.statusCard, { backgroundColor: toneBg }]}>
          <View style={[styles.statusIcon, { backgroundColor: toneColor }]}>
            <Icon name={meta.icon} size={24} color={c.text.inverse} />
          </View>
          <Text variant="title1">{meta.label}</Text>
          <Text variant="caption" tone="muted" style={styles.statusSub}>
            {meta.sub}
          </Text>
        </View>

        {violations.length > 0 ? (
          <>
            <Text variant="title2" style={styles.sectionTitle}>
              Notices
            </Text>
            <View style={styles.notices}>
              {violations.map((v) => (
                <Banner
                  key={v.id}
                  tone={v.severity === 'strike' ? 'violation' : 'warning'}
                  title={v.title}
                  message={v.reason}
                  actionLabel="View details"
                  onAction={() => router.push(route(`/violation/${v.id}`))}
                />
              ))}
            </View>
          </>
        ) : null}

        {status !== 'active' ? (
          <>
            <Text variant="title2" style={styles.sectionTitle}>
              Appeal
            </Text>
            {appealSubmitted ? (
              <Banner
                tone="info"
                title="Appeal submitted"
                message="Our team will review your appeal and respond within 3 business days."
              />
            ) : (
              <View style={styles.card}>
                <Text variant="caption" tone="muted">
                  If you believe this is a mistake, tell us what happened and we’ll review.
                </Text>
                <View style={styles.appealField}>
                  <TextField
                    label="Appeal"
                    value={appeal}
                    onChangeText={setAppeal}
                    placeholder="Explain your situation…"
                    multiline
                    maxLength={600}
                  />
                </View>
                <Button
                  label="Submit appeal"
                  disabled={appeal.trim().length < 10}
                  style={styles.appealButton}
                  onPress={() => {
                    submitAppeal();
                    showToast('Appeal submitted');
                  }}
                />
              </View>
            )}
          </>
        ) : null}

        <Text variant="title2" style={styles.sectionTitle}>
          Demo controls
        </Text>
        <View style={styles.segment}>
          {(['active', 'under_review', 'restricted'] as AccountStatus[]).map((s) => (
            <PressableScale
              key={s}
              style={[styles.segBtn, status === s && styles.segBtnActive]}
              onPress={() => setStatus(s)}
              haptic="selection"
              accessibilityRole="button"
              accessibilityState={{ selected: status === s }}
              accessibilityLabel={STATUS_META[s].label}
            >
              <Text
                variant="caption"
                tone={status === s ? 'default' : 'subtle'}
                style={status === s ? styles.semibold : undefined}
              >
                {STATUS_META[s].label}
              </Text>
            </PressableScale>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    semibold: { fontWeight: '600' },
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
    statusSub: { textAlign: 'center' },
    sectionTitle: {
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    notices: { gap: spacing.sm },
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    appealField: { marginTop: spacing.md },
    appealButton: { marginTop: spacing.md },
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
  });
