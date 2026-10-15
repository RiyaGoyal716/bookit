import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Share, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Button, TextField, Text, Icon, PressableScale, IconButton } from '../src/components/ui';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useSafetyStore } from '../src/stores/safetyStore';
import { useBookingsStore } from '../src/stores/bookingsStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

export default function SafetyScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const contacts = useSafetyStore((s) => s.trustedContacts);
  const addContact = useSafetyStore((s) => s.addContact);
  const removeContact = useSafetyStore((s) => s.removeContact);
  const activeBooking = useBookingsStore((s) =>
    s.bookings.find((b) => b.status === 'Accepted' || b.status === 'On the way'),
  );

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const shareLive = () => {
    const where = activeBooking
      ? `${activeBooking.providerName} · ${activeBooking.date} ${activeBooking.time}`
      : 'an upcoming Bookit booking';
    Share.share({
      message: `I'm sharing my live Bookit booking with you for safety: ${where}. Track: bookit.app/track`,
    }).catch(() => {});
  };

  const openEmergency = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    Alert.alert(
      'Call emergency services?',
      'This is a demo. In a real emergency, call 999. We’ll also notify your trusted contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 999',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:999').catch(() => showToast('Calling unavailable')),
        },
      ],
    );
  };

  const addNewContact = () => {
    if (name.trim().length < 2 || phone.trim().length < 6) return;
    addContact(name.trim(), phone.trim());
    setName('');
    setPhone('');
    showToast('Trusted contact added');
  };

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
          Safety centre
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PressableScale
          style={styles.emergency}
          haptic={null}
          onPress={openEmergency}
          accessibilityRole="button"
          accessibilityLabel="Emergency help"
        >
          <View style={styles.emergencyIcon}>
            <Icon name="alert-triangle" size={24} color={c.status.danger} />
          </View>
          <View style={styles.flex1}>
            <Text variant="headline" tone="danger">
              Emergency
            </Text>
            <Text variant="caption" tone="muted">
              Call for help and alert your trusted contacts
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={c.status.danger} />
        </PressableScale>

        <Text variant="title2" style={styles.sectionTitle}>
          Share your trip
        </Text>
        <PressableScale
          style={styles.actionCard}
          onPress={shareLive}
          accessibilityRole="button"
          accessibilityLabel="Share live booking"
        >
          <View style={styles.actionIcon}>
            <Icon name="share" size={20} color={c.brand.tint} />
          </View>
          <View style={styles.flex1}>
            <Text variant="headline">Share live booking</Text>
            <Text variant="caption" tone="muted">
              {activeBooking
                ? `${activeBooking.providerName} · ${activeBooking.time}`
                : 'Send details to someone you trust'}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={c.text.muted} />
        </PressableScale>

        <Text variant="title2" style={styles.sectionTitle}>
          Trusted contacts
        </Text>
        {contacts.map((ct) => (
          <View key={ct.id} style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Icon name="user" size={20} color={c.brand.tint} />
            </View>
            <View style={styles.flex1}>
              <Text variant="headline">{ct.name}</Text>
              <Text variant="caption" tone="muted">
                {ct.phone}
              </Text>
            </View>
            <IconButton
              name="trash"
              size={20}
              color={c.text.muted}
              onPress={() => {
                removeContact(ct.id);
                showToast('Contact removed');
              }}
              accessibilityLabel={`Remove ${ct.name}`}
            />
          </View>
        ))}

        <View style={styles.addCard}>
          <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Sam" />
          <TextField
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+44 7700 900000"
            keyboardType="phone-pad"
          />
          <Button
            label="Add contact"
            icon="plus"
            variant="secondary"
            disabled={name.trim().length < 2 || phone.trim().length < 6}
            onPress={addNewContact}
          />
        </View>

        <PressableScale
          style={styles.guideLink}
          onPress={() => router.push(route('/legal/safety-guidelines'))}
          accessibilityRole="button"
          accessibilityLabel="Read safety guidelines"
        >
          <Icon name="shield-check" size={20} color={c.brand.tint} />
          <Text variant="footnote" tone="accent" style={styles.flex1}>
            Read our safety guidelines
          </Text>
          <Icon name="chevron-right" size={20} color={c.text.muted} />
        </PressableScale>
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
    flex1: { flex: 1 },
    emergency: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.status.danger,
      backgroundColor: c.status.dangerSoft,
    },
    emergencyIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      marginBottom: spacing.sm,
    },
    contactAvatar: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addCard: {
      marginTop: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.md,
    },
    guideLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
    },
  });
