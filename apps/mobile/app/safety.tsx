import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, ConfirmModal, Input } from '../src/components';
import { route } from '../src/lib/nav';
import { showToast } from '../src/stores/toastStore';
import { useSafetyStore } from '../src/stores/safetyStore';
import { useBookingsStore } from '../src/stores/bookingsStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

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

  const [emergencyOpen, setEmergencyOpen] = useState(false);
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
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Safety centre</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={styles.emergency}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            setEmergencyOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Emergency help"
        >
          <View style={styles.emergencyIcon}>
            <Ionicons name="alert" size={28} color={c.status.danger} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.emergencyTitle}>Emergency</Text>
            <Text style={styles.emergencySub}>Call for help and alert your trusted contacts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.status.danger} />
        </Pressable>

        <Text style={styles.sectionTitle}>Share your trip</Text>
        <Pressable
          style={styles.actionCard}
          onPress={shareLive}
          accessibilityRole="button"
          accessibilityLabel="Share live booking"
        >
          <View style={styles.actionIcon}>
            <Ionicons name="share-social" size={20} color={c.brand.tint} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.actionTitle}>Share live booking</Text>
            <Text style={styles.actionSub}>
              {activeBooking
                ? `${activeBooking.providerName} · ${activeBooking.time}`
                : 'Send details to someone you trust'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
        </Pressable>

        <Text style={styles.sectionTitle}>Trusted contacts</Text>
        {contacts.map((ct) => (
          <View key={ct.id} style={styles.contactRow}>
            <View style={styles.contactAvatar}>
              <Ionicons name="person" size={18} color={c.brand.tint} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.contactName}>{ct.name}</Text>
              <Text style={styles.contactPhone}>{ct.phone}</Text>
            </View>
            <Pressable
              onPress={() => {
                removeContact(ct.id);
                showToast('Contact removed');
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${ct.name}`}
            >
              <Ionicons name="trash-outline" size={20} color={c.text.muted} />
            </Pressable>
          </View>
        ))}

        <View style={styles.addCard}>
          <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Sam" />
          <Input
            containerStyle={{ marginTop: spacing.md }}
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+44 7700 900000"
            keyboardType="phone-pad"
          />
          <Button
            label="Add contact"
            icon="add"
            variant="secondary"
            style={{ marginTop: spacing.md }}
            disabled={name.trim().length < 2 || phone.trim().length < 6}
            onPress={addNewContact}
          />
        </View>

        <Pressable
          style={styles.guideLink}
          onPress={() => router.push(route('/legal/safety-guidelines'))}
          accessibilityRole="button"
          accessibilityLabel="Read safety guidelines"
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={c.brand.tint} />
          <Text style={styles.guideText}>Read our safety guidelines</Text>
          <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={emergencyOpen}
        icon="call"
        title="Call emergency services?"
        message="This is a demo. In a real emergency, call 999. We’ll also notify your trusted contacts."
        confirmLabel="Call 999"
        destructive
        onConfirm={() => {
          setEmergencyOpen(false);
          Linking.openURL('tel:999').catch(() => showToast('Calling unavailable'));
        }}
        onCancel={() => setEmergencyOpen(false)}
      />
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
    emergencyTitle: {
      ...typography.scale.bodyMedium,
      color: c.status.danger,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    emergencySub: { ...typography.scale.caption, color: c.text.secondary },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
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
    actionTitle: { ...typography.scale.bodyMedium, color: c.text.primary },
    actionSub: { ...typography.scale.caption, color: c.text.muted },
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
    contactName: { ...typography.scale.bodyMedium, color: c.text.primary },
    contactPhone: { ...typography.scale.caption, color: c.text.muted },
    addCard: {
      marginTop: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
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
    guideText: { flex: 1, ...typography.scale.smallMedium, color: c.brand.tint },
  });
