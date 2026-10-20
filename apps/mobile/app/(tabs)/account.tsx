import { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  EmptyState,
  Icon,
  PressableScale,
  Text,
  type IconName,
} from '../../src/components/ui';
import { route } from '../../src/lib/nav';
import { getProviderById } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import { useAuthStore } from '../../src/stores/authStore';
import { useBookingsStore } from '../../src/stores/bookingsStore';
import { useFavouritesStore } from '../../src/stores/favouritesStore';
import { useWalletStore } from '../../src/stores/walletStore';
import {
  useColors,
  useTokens,
  radius,
  spacing,
  type Palette,
  type NovaTokens,
} from '../../src/theme';
import { useMoney } from '../../src/i18n';

const MENU: { icon: IconName; label: string; href: string }[] = [
  { icon: 'wallet', label: 'Wallet & transactions', href: '/wallet' },
  { icon: 'card', label: 'Payment methods', href: '/payments' },
  { icon: 'map-pin', label: 'Saved addresses', href: '/addresses' },
  { icon: 'star', label: 'Bookit Plus', href: '/plus' },
  { icon: 'briefcase', label: 'Become a pro', href: '/pro' },
  { icon: 'gift', label: 'Refer & earn', href: '/referrals' },
  { icon: 'bell', label: 'Notifications', href: '/notifications' },
  { icon: 'shield', label: 'Safety centre', href: '/safety' },
  { icon: 'file-text', label: 'Booking & cancellation policy', href: '/policies' },
  { icon: 'settings', label: 'Settings', href: '/settings' },
  { icon: 'help', label: 'Help & support', href: '/help' },
  { icon: 'shield-check', label: 'Legal & guidelines', href: '/legal' },
];

/** Distinct IconChip tints — cycled so no two adjacent rows share a colour. */
function chipTints(t: NovaTokens): { bg: string; fg: string }[] {
  return [
    { bg: t.coralSoft, fg: t.coral },
    { bg: t.skySoft, fg: t.sky },
    { bg: t.successSoft, fg: t.success },
    { bg: t.sunshineSoft, fg: t.warning },
    { bg: t.primarySoft, fg: t.text },
  ];
}

export default function AccountScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useTokens();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const favouriteIds = useFavouritesStore((s) => s.ids);
  const bookingCount = useBookingsStore((s) => s.bookings.length);
  const walletBalance = useWalletStore((s) => s.balance());

  const favourites = useMemo(
    () => favouriteIds.map((id) => getProviderById(id)).filter((p): p is Provider => Boolean(p)),
    [favouriteIds],
  );

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

  const confirmLogout = () => {
    Alert.alert('Log out?', "You'll need to sign in again to manage your bookings.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.topBar}>
        <Text variant="title1">Account</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <PressableScale
          style={styles.userCard}
          onPress={() => router.push(route('/profile'))}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <View style={styles.avatar}>
            <Text variant="title2" tone="onPrimary">
              {initial}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text variant="title2">{user?.name ?? 'Guest'}</Text>
            <Text variant="caption" tone="muted">
              {user?.phone ?? '—'}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={c.brand.tint} />
        </PressableScale>

        <View style={styles.statsRow}>
          <Stat value={`${bookingCount}`} label="Bookings" styles={styles} />
          <View style={styles.statDivider} />
          <Stat value={`${favourites.length}`} label="Favourites" styles={styles} />
          <View style={styles.statDivider} />
          <PressableScale
            style={styles.stat}
            onPress={() => router.push(route('/wallet'))}
            accessibilityRole="button"
            accessibilityLabel="Wallet"
          >
            <Text variant="title2" tone="accent" tabular>
              {money(walletBalance)}
            </Text>
            <Text variant="caption" tone="subtle">
              Wallet
            </Text>
          </PressableScale>
        </View>

        <View style={styles.favHeader}>
          <Text variant="title2">Favourites</Text>
          {favourites.length > 0 ? (
            <PressableScale
              onPress={() => router.push(route('/favourites'))}
              accessibilityRole="button"
              accessibilityLabel="See all favourites"
            >
              <Text variant="footnote" tone="accent" style={styles.semibold}>
                See all
              </Text>
            </PressableScale>
          ) : null}
        </View>
        {favourites.length === 0 ? (
          <View style={styles.favEmpty}>
            <EmptyState
              art="empty"
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
                <PressableScale
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
                  <Text variant="footnote" style={styles.semibold} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.favMeta}>
                    <Icon name="star" size={16} color={c.brand.star} />
                    <Text variant="caption" tabular>
                      {item.rating.toFixed(1)}
                    </Text>
                    <Text variant="caption" tone="subtle">
                      · from {money(item.priceFrom)}
                    </Text>
                  </View>
                </PressableScale>
              )}
            />
          </View>
        )}

        <View style={styles.menu}>
          {MENU.map((item, i) => {
            const tint = chipTints(t)[i % chipTints(t).length];
            return (
              <PressableScale
                key={item.label}
                onPress={() => router.push(route(item.href))}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={[styles.menuRow, i < MENU.length - 1 && styles.menuDivider]}
              >
                <View style={[styles.menuIcon, { backgroundColor: tint.bg }]}>
                  <Icon name={item.icon} size={20} color={tint.fg} />
                </View>
                <Text variant="headline" style={styles.menuLabel}>
                  {item.label}
                </Text>
                <Icon name="chevron-right" size={20} color={c.text.muted} />
              </PressableScale>
            );
          })}
        </View>

        <Button
          label="Log out"
          variant="secondary"
          icon="logout"
          onPress={confirmLogout}
          style={styles.logout}
        />
      </ScrollView>
    </View>
  );
}

function Stat({
  value,
  label,
  styles,
}: {
  value: string;
  label: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.stat}>
      <Text variant="title2" tone="accent" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    semibold: { fontWeight: '600' },
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
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
    userInfo: { flex: 1, gap: 2 },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    stat: { flex: 1, alignItems: 'center', gap: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: c.border },
    favHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    favEmpty: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    favList: { height: 150 },
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
    favPhoto: { width: '100%', height: 84, borderRadius: radius.md, backgroundColor: c.skeleton },
    favMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
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
    menuDivider: { borderBottomWidth: 1, borderBottomColor: c.border },
    menuIcon: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuLabel: { flex: 1 },
    logout: { marginTop: spacing.xl },
  });
