import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Icon, IconButton, EmptyState, type IconName } from '../../src/components/ui';
import { LEGAL_DOCS } from '../../src/content/legal';
import { useColors, radius, spacing, type Palette } from '../../src/theme';

/** Map legacy icon names (from the legal content data) to NOVA icons. */
const LEGAL_ICON: Record<string, IconName> = {
  'document-text-outline': 'file-text',
  'lock-closed-outline': 'lock',
  'time-outline': 'clock',
  'people-outline': 'users',
  'shield-checkmark-outline': 'shield-check',
  'ribbon-outline': 'award',
  'cafe-outline': 'book',
};

export default function LegalDocScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = doc ? LEGAL_DOCS[doc] : undefined;

  if (!content) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          variant="subtle"
          size={24}
          style={styles.back}
        />
        <EmptyState art="error" title="Document not found" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          variant="subtle"
          size={24}
          style={styles.back}
        />
        <Text variant="title2" numberOfLines={1} style={styles.flex1}>
          {content.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <View style={styles.iconWrap}>
            <Icon name={LEGAL_ICON[content.icon] ?? 'file-text'} size={24} color={c.brand.tint} />
          </View>
          <Text variant="title1">{content.title}</Text>
          <Text variant="caption" tone="muted">
            {content.updated}
          </Text>
        </View>

        <Text variant="body" tone="muted" style={styles.intro}>
          {content.intro}
        </Text>

        {content.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <Text variant="headline">{s.heading}</Text>
            {s.body?.map((p) => (
              <Text key={p} variant="footnote" tone="muted" style={styles.paragraph}>
                {p}
              </Text>
            ))}
            {s.bullets?.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text variant="footnote" tone="muted" style={styles.bulletText}>
                  {b}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text variant="caption" tone="muted" style={styles.copyright}>
          © 2026 Bookit Ltd · Made in Leeds
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    flex1: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: {
      marginLeft: -spacing.sm,
    },
    titleBlock: { gap: spacing.xs, marginBottom: spacing.lg },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    intro: { marginBottom: spacing.lg },
    section: { marginBottom: spacing.lg, gap: spacing.sm },
    paragraph: { lineHeight: 22 },
    bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.brand.tint,
      marginTop: 7,
    },
    bulletText: { flex: 1, lineHeight: 22 },
    copyright: {
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });
