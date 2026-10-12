import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Accordion } from '../src/components';
import { route } from '../src/lib/nav';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const GUIDELINES = [
  {
    question: 'Terms of Service',
    answer:
      'By using Bookit you agree to book services in good faith, provide accurate information, and treat providers with respect. Bookit connects you with independent providers and is not the provider of the services themselves.',
  },
  {
    question: 'Privacy Policy',
    answer:
      'We collect only what we need to run your bookings — your name, contact details and address are shared with a provider after they accept. We never sell your data. You can request deletion at any time.',
  },
  {
    question: 'Community guidelines',
    answer:
      'Be kind and punctual. Leave honest reviews. Harassment, discrimination or unsafe behaviour results in removal from the platform for customers and providers alike.',
  },
  {
    question: 'Provider vetting',
    answer:
      'Every provider completes ID verification and a background check before going live. “Top rated” and “Insured” badges reflect verified status on their profile.',
  },
];

const LINKS = [
  {
    icon: 'document-text-outline' as const,
    label: 'Booking & cancellation policy',
    href: '/policies',
  },
  { icon: 'help-circle-outline' as const, label: 'Help & support', href: '/help' },
];

export default function LegalScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Legal & guidelines</Text>
        <View style={styles.back} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Accordion items={GUIDELINES} />

        <Text style={styles.sectionLabel}>More</Text>
        <View style={styles.links}>
          {LINKS.map((l, i) => (
            <Pressable
              key={l.label}
              style={[styles.linkRow, i < LINKS.length - 1 && styles.linkDivider]}
              onPress={() => router.push(route(l.href))}
              accessibilityRole="button"
              accessibilityLabel={l.label}
            >
              <View style={styles.linkIcon}>
                <Ionicons name={l.icon} size={18} color={c.brand.tint} />
              </View>
              <Text style={styles.linkLabel}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
            </Pressable>
          ))}
        </View>

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
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.scale.h2, color: c.text.primary },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
      marginTop: spacing.xl,
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
    linkLabel: { flex: 1, ...typography.scale.bodyMedium, color: c.text.primary },
    copyright: {
      ...typography.scale.caption,
      color: c.text.muted,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  });
