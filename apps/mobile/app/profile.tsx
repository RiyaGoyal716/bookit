import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, Input } from '../src/components';
import { showToast } from '../src/stores/toastStore';
import { useAuthStore } from '../src/stores/authStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const initial = name.charAt(0)?.toUpperCase() || 'U';
  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    updateProfile({ name: name.trim(), email: email.trim() || undefined });
    showToast('Profile updated');
    router.back();
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
        <Text style={styles.title}>Edit profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Pressable
            style={styles.avatarEdit}
            onPress={() => showToast('Photo upload is a demo')}
            accessibilityRole="button"
            accessibilityLabel="Change photo"
          >
            <Ionicons name="camera" size={16} color={c.text.inverse} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <Input label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.phoneRow}>
            <View style={styles.flex1}>
              <Text style={styles.phoneLabel}>Phone</Text>
              <Text style={styles.phoneValue}>{user?.phone ?? '—'}</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={14} color={c.status.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>

        <Button label="Save changes" disabled={!canSave} onPress={save} style={styles.save} />
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
    avatarWrap: { alignSelf: 'center', marginVertical: spacing.lg },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...typography.scale.hero, color: c.text.inverse },
    avatarEdit: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.brand.primaryDark,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.background.base,
    },
    form: { gap: spacing.lg },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    flex1: { flex: 1 },
    phoneLabel: { ...typography.scale.caption, color: c.text.muted },
    phoneValue: { ...typography.scale.bodyMedium, color: c.text.primary },
    verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    verifiedText: { ...typography.scale.caption, color: c.status.success },
    save: { marginTop: spacing.xl },
  });
