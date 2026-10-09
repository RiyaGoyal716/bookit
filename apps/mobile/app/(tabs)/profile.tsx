import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, Screen } from '../../src/components';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, radius, spacing, typography } from '../../src/theme';

type RowIcon = keyof typeof Ionicons.glyphMap;

const MENU: { icon: RowIcon; label: string }[] = [
  { icon: 'card-outline', label: 'Payment methods' },
  { icon: 'location-outline', label: 'Saved addresses' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & support' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <Screen>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
          <Text style={styles.phone}>+44 {user?.phone ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU.map((item, i) => (
          <View
            key={item.label}
            style={[styles.menuRow, i < MENU.length - 1 && styles.menuDivider]}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={18} color={colors.brand.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
          </View>
        ))}
      </View>

      <View style={styles.spacer} />
      <Button label="Log out" variant="secondary" icon="log-out-outline" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.primarySoft,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.text.inverse,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.text.primary,
  },
  phone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  menu: {
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.base,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  spacer: {
    flex: 1,
  },
});
