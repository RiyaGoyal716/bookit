import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Icon, IconButton, PressableScale, type IconName } from '../src/components/ui';
import { route } from '../src/lib/nav';
import { LEGAL_INDEX } from '../src/content/legal';
import { useColors, radius, spacing, type Palette } from '../src/theme';

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

const TRUST_LINKS: { icon: IconName; label: string; href: string }[] = [
  { icon: 'shield', label: 'Safety centre', href: '/safety' },
  { icon: 'alert-triangle', label: 'Report a problem', href: '/report' },
  { icon: 'activity', label: 'Account status', href: '/account-status' },
  { icon: 'sliders', label: 'Data & consent', href: '/consent' },
  { icon: 'clock', label: 'Booking policies', href: '/policies' },
  { icon: 'help', label: 'Help & support', href: '/help' },
];

export default function LegalScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          variant="subtle"
          size={24}
        />
        <Text variant="title2">Legal & guidelines</Text>
        <View style={styles.back} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Policies & documents
        </Text>
        <View style={styles.links}>
          {LEGAL_INDEX.map((l, i) => (
            <PressableScale
              key={l.slug}
              style={[styles.linkRow, i < LEGAL_INDEX.length - 1 && styles.linkDivider]}
              onPress={() => router.push(route(`/legal/${l.slug}`))}
              accessibilityRole="button"
              accessibilityLabel={l.title}
            >
              <View style={styles.linkIcon}>
                <Icon name={LEGAL_ICON[l.icon] ?? 'file-text'} size={20} color={c.brand.tint} />
              </View>
              <Text variant="body" style={styles.linkLabel}>
                {l.title}
              </Text>
              <Icon name="chevron-right" size={20} color={c.text.muted} />
            </PressableScale>
          ))}
        </View>

        <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
          Trust & safety
        </Text>
        <View style={styles.links}>
          {TRUST_LINKS.map((l, i) => (
            <PressableScale
              key={l.label}
              style={[styles.linkRow, i < TRUST_LINKS.length - 1 && styles.linkDivider]}
              onPress={() => router.push(route(l.href))}
              accessibilityRole="button"
              accessibilityLabel={l.label}
            >
              <View style={styles.linkIcon}>
                <Icon name={l.icon} size={20} color={c.brand.tint} />
              </View>
              <Text variant="body" style={styles.linkLabel}>
                {l.label}
              </Text>
              <Icon name="chevron-right" size={20} color={c.text.muted} />
            </PressableScale>
          ))}
        </View>

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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 44, height: 44 },
    sectionLabel: {
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    links: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      overflow: 'hidden',
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
    },
    linkDivider: { borderBottomWidth: 1, borderBottomColor: c.border },
    linkIcon: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkLabel: { flex: 1 },
    copyright: {
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  });
