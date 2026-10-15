import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, EmptyState, Banner, Text, Icon, IconButton } from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { showToast } from '../../src/stores/toastStore';
import { useSafetyStore } from '../../src/stores/safetyStore';
import { useColors, spacing, type Palette } from '../../src/theme';

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
        <IconButton
          name="chevron-left"
          size={24}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <EmptyState art="empty" title="Notice not found" />
      </View>
    );
  }

  const danger = violation.severity === 'strike';

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          size={24}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <Text variant="title2" style={styles.title}>
          Notice
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Banner
          tone={danger ? 'violation' : 'warning'}
          title={violation.title}
          message={`${violation.severity === 'strike' ? 'Strike' : 'Warning'} · ${violation.date}`}
        />

        <Text variant="title2" style={styles.sectionTitle}>
          What happened
        </Text>
        <Text variant="body" tone="muted" style={styles.body}>
          {violation.reason}
        </Text>

        <Text variant="title2" style={styles.sectionTitle}>
          What this means
        </Text>
        <Text variant="body" tone="muted" style={styles.body}>
          {violation.detail}
        </Text>

        <View style={styles.actions}>
          <Button
            label="Appeal this notice"
            variant="secondary"
            icon="message"
            onPress={() => router.push(route('/account-status'))}
          />
          {!violation.acknowledged ? (
            <Button
              label="I understand"
              icon="check"
              onPress={() => {
                acknowledge(violation.id);
                showToast('Acknowledged');
                router.back();
              }}
            />
          ) : (
            <View style={styles.ackRow}>
              <Icon name="check-circle" size={16} color={c.status.success} />
              <Text variant="footnote" tone="success">
                Acknowledged
              </Text>
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
    title: { flex: 1 },
    sectionTitle: {
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    body: { lineHeight: 24 },
    actions: { marginTop: spacing.xl, gap: spacing.md },
    ackRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
  });
