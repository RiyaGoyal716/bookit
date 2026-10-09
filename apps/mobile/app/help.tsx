import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I book a provider?',
    a: 'Open a provider, tap Book now, pick a service, choose a date and time, confirm your address and review the total — then confirm.',
  },
  {
    q: 'When am I charged?',
    a: 'This is a demo, so no real payment is taken. In a live app you would be charged once the provider completes the job.',
  },
  {
    q: 'Can I cancel or reschedule?',
    a: 'Yes. Open the booking from the Bookings tab and use Cancel or Reschedule. Cancelling notifies your provider.',
  },
  {
    q: 'What is the platform fee?',
    a: 'Bookit adds a 12% platform fee on top of the service price. You can see it broken down on the review screen.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const [open, setOpen] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const submit = () => {
    showToast('Thanks — we’ll be in touch shortly');
    setName('');
    setMessage('');
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
        <Text style={styles.headerTitle}>Help & support</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Frequently asked</Text>
        <View style={styles.faqCard}>
          {FAQS.map((item, i) => {
            const expanded = open === i;
            return (
              <View key={item.q} style={[styles.faqItem, i < FAQS.length - 1 && styles.faqDivider]}>
                <Pressable
                  style={styles.faqQuestion}
                  onPress={() => setOpen(expanded ? null : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  accessibilityLabel={item.q}
                >
                  <Text style={styles.faqQ}>{item.q}</Text>
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={c.text.muted}
                  />
                </Pressable>
                {expanded ? <Text style={styles.faqA}>{item.a}</Text> : null}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Contact us</Text>
        <View style={styles.form}>
          <Input label="Your name" value={name} onChangeText={setName} placeholder="Alex" />
          <Input
            label="Message"
            value={message}
            onChangeText={setMessage}
            placeholder="How can we help?"
            multiline
          />
          <Button
            label="Send message"
            icon="paper-plane"
            disabled={name.trim().length === 0 || message.trim().length === 0}
            onPress={submit}
          />
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
    headerTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
    },
    content: {
      paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    faqCard: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      paddingHorizontal: spacing.lg,
    },
    faqItem: {
      paddingVertical: spacing.md,
    },
    faqDivider: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    faqQuestion: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      minHeight: 32,
    },
    faqQ: {
      flex: 1,
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    faqA: {
      ...typography.scale.small,
      color: c.text.secondary,
      marginTop: spacing.sm,
    },
    form: {
      gap: spacing.lg,
    },
  });
