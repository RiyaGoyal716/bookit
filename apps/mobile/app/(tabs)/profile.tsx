import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, EmptyState } from '../../src/components';
import { route } from '../../src/lib/nav';
import { getProviderById } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import { useAuthStore } from '../../src/stores/authStore';
import { useFavouritesStore } from '../../src/stores/favouritesStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

type RowIcon = keyof typeof Ionicons.glyphMap;

const MENU: { icon: RowIcon; label: string; href: string }[] = [
  { icon: 'notifications-outline', label: 'Notifications', href: '/notifications' },
  { icon: 'location-outline', label: 'Saved addresses', href: '/addresses' },
  { icon: 'settings-outline', label: 'Settings', href: '/settings' },
  { icon: 'help-circle-outline', label: 'Help & support', href: '/help' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const favouriteIds = useFavouritesStore((s) => s.ids);

  const favourites = useMemo(
    () => favouriteIds.map((id) => getProviderById(id)).filter((p): p is Provider => Boolean(p)),
    [favouriteIds],
  );

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

        <View style={styles.favHeader}>
          <Text style={styles.sectionTitle}>Favourites</Text>
          {favourites.length > 0 ? (
            <Text style={styles.favCount}>{favourites.length} saved</Text>
          ) : null}
        </View>
        {favourites.length === 0 ? (
          <View style={styles.favEmpty}>
            <EmptyState
              icon="heart-outline"
              title="No favourites yet"
              message="Tap the heart on a provider to save them here."
            />
          </View>
        ) : (
          <View style={styles.favList}>
            <FlashList
              data={favourites}
              horizontal
              keyExtractor={(p: Provider) => p.id}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.favSeparator} />}
              renderItem={({ item }: { item: Provider }) => (
                <Pressable
                  style={styles.favCard}
                  onPress={() => router.push(`/provider/${item.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, favourite`}
                >
                  <Image
                    source={{ uri: item.photo }}
                    style={styles.favPhoto}
                    contentFit="cover"
                    transition={200}
                    cachePolicy="memory-disk"
                  />
                  <Text style={styles.favName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.favMeta}>
                    <Ionicons name="star" size={12} color={c.brand.star} />
                    <Text style={styles.favRating}>{item.rating.toFixed(1)}</Text>
                    <Text style={styles.favPrice}>· from £{item.priceFrom}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}

        <View style={styles.menu}>
          {MENU.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(route(item.href))}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.menuRow,
                i < MENU.length - 1 && styles.menuDivider,
                pressed && styles.menuPressed,
              ]}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={c.brand.tint} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
            </Pressable>
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
    favHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
    },
    favCount: {
      ...typography.scale.small,
      color: c.text.muted,
    },
    favEmpty: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    favList: {
      height: 150,
    },
    favSeparator: { width: spacing.md },
    favCard: {
      width: 150,
      padding: spacing.sm,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.xs,
    },
    favPhoto: {
      width: '100%',
      height: 84,
      borderRadius: radius.md,
      backgroundColor: c.skeleton,
    },
    favName: {
      ...typography.scale.smallMedium,
      color: c.text.primary,
    },
    favMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    favRating: {
      ...typography.scale.caption,
      color: c.text.primary,
    },
    favPrice: {
      ...typography.scale.caption,
      color: c.text.muted,
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
    menuPressed: {
      backgroundColor: c.background.muted,
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
