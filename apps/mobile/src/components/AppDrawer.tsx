import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, spacing, typography, type Palette } from '../theme';
import { route } from '../lib/nav';
import { useAuthStore } from '../stores/authStore';
import { SideDrawer } from './SideDrawer';

type IconName = keyof typeof Ionicons.glyphMap;

const MENU: { icon: IconName; label: string; href: string }[] = [
  { icon: 'person-outline', label: 'Profile', href: '/(tabs)/account' },
  { icon: 'location-outline', label: 'Addresses', href: '/addresses' },
  { icon: 'card-outline', label: 'Payment methods', href: '/payments' },
  { icon: 'heart-outline', label: 'Favourites', href: '/favourites' },
  { icon: 'gift-outline', label: 'Refer & earn', href: '/referrals' },
  { icon: 'help-circle-outline', label: 'Help & support', href: '/help' },
  { icon: 'settings-outline', label: 'Settings', href: '/settings' },
  { icon: 'shield-checkmark-outline', label: 'Legal & guidelines', href: '/legal' },
];

export interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

/** The app-wide side drawer (avatar menu). Shared by Home and Account. */
export function AppDrawer({ visible, onClose }: AppDrawerProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'A';

  const go = (href: string) => {
    onClose();
    // Let the drawer begin closing before navigating.
    setTimeout(() => router.push(route(href)), 60);
  };

  return (
    <SideDrawer
      visible={visible}
      onClose={onClose}
      header={
        <Pressable
          style={styles.userCard}
          onPress={() => go('/(tabs)/account')}
          accessibilityRole="button"
          accessibilityLabel="View profile"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
            <Text style={styles.phone}>{user?.phone ?? 'View profile'}</Text>
          </View>
        </Pressable>
      }
    >
      {MENU.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => go(item.href)}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <View style={styles.rowIcon}>
            <Ionicons name={item.icon} size={18} color={c.brand.tint} />
          </View>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={16} color={c.text.muted} />
        </Pressable>
      ))}
    </SideDrawer>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
    },
    avatar: {
      width: 48,
      height: 48,
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
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    phone: {
      ...typography.scale.caption,
      color: c.text.secondary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 48,
      paddingHorizontal: spacing.xs,
    },
    rowPressed: {
      opacity: 0.6,
    },
    rowIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: {
      flex: 1,
      ...typography.scale.body,
      color: c.text.primary,
    },
  });
