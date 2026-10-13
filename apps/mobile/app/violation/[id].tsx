import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, EmptyState, InlineBanner } from '../../src/components';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import { useSafetyStore } from '../../src/stores/safetyStore';
import { useColors, spacing, typography, type Palette } from '../../src/theme';

export default function ViolationScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { id } = useLocalSearchParams<{ id: string }>();

  const violation = useSafetyStore((s) => s.violations.find((v) => v.id === id));
  const acknowledge = useSafetyStore((s) => s.acknowledge);

  if (!violation) {
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
        <EmptyState icon="shield-outline" title="Notice not found" />
      </View>
    );
  }

  const danger = violation.severity === 'strike';

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
        <Text style={styles.title}>Notice</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <InlineBanner
          tone={danger ? 'danger' : 'warning'}
          title={violation.title}
          message={`${violation.severity === 'strike' ? 'Strike' : 'Warning'} · ${violation.date}`}
        />

        <Text style={styles.sectionTitle}>What happened</Text>
        <Text style={styles.body}>{violation.reason}</Text>

        <Text style={styles.sectionTitle}>What this means</Text>
        <Text style={styles.body}>{violation.detail}</Text>

        <View style={styles.actions}>
          <Button
            label="Appeal this notice"
            variant="secondary"
            icon="chatbox-ellipses-outline"
            onPress={() => router.push(route('/account-status'))}
          />
          {!violation.acknowledged ? (
            <Button
              label="I understand"
              icon="checkmark"
              onPress={() => {
                acknowledge(violation.id);
                showToast('Acknowledged');
                router.back();
              }}
            />
          ) : (
            <View style={styles.ackRow}>
              <Ionicons name="checkmark-circle" size={16} color={c.status.success} />
              <Text style={styles.ackText}>Acknowledged</Text>
            </View>
          )}
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
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    body: { ...typography.scale.body, color: c.text.secondary, lineHeight: 24 },
    actions: { marginTop: spacing.xl, gap: spacing.md },
    ackRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    ackText: { ...typography.scale.smallMedium, color: c.status.success },
  });
