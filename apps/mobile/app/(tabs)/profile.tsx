import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../../src/components';
import { useAuthStore } from '../../src/stores/authStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

type RowIcon = keyof typeof Ionicons.glyphMap;

const MENU: { icon: RowIcon; label: string }[] = [
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'card-outline', label: 'Payment methods' },
  { icon: 'location-outline', label: 'Saved addresses' },
  { icon: 'help-circle-outline', label: 'Help & support' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.phone}>{user?.phone ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {MENU.map((item, i) => (
            <View
              key={item.label}
              style={[styles.menuRow, i < MENU.length - 1 && styles.menuDivider]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={c.brand.tint} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
            </View>
          ))}
        </View>

        <Button
          label="Log out"
          variant="secondary"
          icon="log-out-outline"
          onPress={handleLogout}
          style={styles.logout}
        />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background.base,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
    },
    heading: {
      ...typography.scale.h1,
      color: c.text.primary,
      marginBottom: spacing.lg,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typography.scale.h2,
      color: c.text.inverse,
    },
    userInfo: {
      flex: 1,
      gap: 2,
    },
    name: {
      ...typography.scale.h2,
      color: c.text.primary,
    },
    phone: {
      ...typography.scale.small,
      color: c.text.secondary,
    },
    menu: {
      marginTop: spacing.xl,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      overflow: 'hidden',
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
    },
    menuDivider: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    menuIcon: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: {
      flex: 1,
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    logout: {
      marginTop: spacing.xl,
    },
  });
