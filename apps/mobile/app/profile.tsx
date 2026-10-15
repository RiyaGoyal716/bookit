import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, PressableScale, ScreenHeader, Text, TextField } from '../src/components/ui';
import { showToast } from '../src/stores/toastStore';
import { useAuthStore } from '../src/stores/authStore';
import { useColors, radius, spacing, type Palette } from '../src/theme';

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
      <ScreenHeader title="Edit profile" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text variant="display" tone="onPrimary">
              {initial}
            </Text>
          </View>
          <PressableScale
            style={styles.avatarEdit}
            onPress={() => showToast('Photo upload is a demo')}
            accessibilityRole="button"
            accessibilityLabel="Change photo"
          >
            <Icon name="camera" size={16} color={c.text.inverse} />
          </PressableScale>
        </View>

        <View style={styles.form}>
          <TextField
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <TextField
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
              <Text variant="caption" tone="subtle">
                Phone
              </Text>
              <Text variant="headline">{user?.phone ?? '—'}</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Icon name="check-circle" size={16} color={c.status.success} />
              <Text variant="caption" tone="success">
                Verified
              </Text>
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
    avatarWrap: { alignSelf: 'center', marginVertical: spacing.lg },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
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
    verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    save: { marginTop: spacing.xl },
  });
