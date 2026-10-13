import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../../src/components';
import { LEGAL_DOCS } from '../../src/content/legal';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

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
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <EmptyState icon="document-outline" title="Document not found" />
      </View>
    );
  }

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {content.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleBlock}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={content.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={c.brand.tint}
            />
          </View>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.updated}>{content.updated}</Text>
        </View>

        <Text style={styles.intro}>{content.intro}</Text>

        {content.sections.map((s) => (
          <View key={s.heading} style={styles.section}>
            <Text style={styles.sectionHeading}>{s.heading}</Text>
            {s.body?.map((p) => (
              <Text key={p} style={styles.paragraph}>
                {p}
              </Text>
            ))}
            {s.bullets?.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.copyright}>© 2026 Bookit Ltd · Made in Leeds</Text>
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
    back: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -spacing.sm,
    },
    headerTitle: { flex: 1, ...typography.scale.h2, color: c.text.primary },
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
    title: { ...typography.scale.h1, color: c.text.primary },
    updated: { ...typography.scale.caption, color: c.text.muted },
    intro: { ...typography.scale.body, color: c.text.secondary, marginBottom: spacing.lg },
    section: { marginBottom: spacing.lg, gap: spacing.sm },
    sectionHeading: { ...typography.scale.bodyMedium, color: c.text.primary },
    paragraph: { ...typography.scale.small, color: c.text.secondary, lineHeight: 22 },
    bulletRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
    bulletDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.brand.tint,
      marginTop: 7,
    },
    bulletText: { flex: 1, ...typography.scale.small, color: c.text.secondary, lineHeight: 22 },
    copyright: {
      ...typography.scale.caption,
      color: c.text.muted,
      textAlign: 'center',
      marginTop: spacing.lg,
    },
  });
