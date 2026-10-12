import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { BottomSheet, HeroCarousel, Skeleton, type HeroBanner } from '../../src/components';
import { AppDrawer } from '../../src/components/AppDrawer';
import { providers as allProviders, categories } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import type { Category } from '../../src/mocks/categories';
import { track } from '../../src/lib/analytics';
import { route } from '../../src/lib/nav';
import { useAuthStore } from '../../src/stores/authStore';
import { useNotificationsStore } from '../../src/stores/notificationsStore';
import { showToast } from '../../src/stores/toastStore';
import { useColors, radius, shadow, spacing, typography, type Palette } from '../../src/theme';

const AREAS = ['Leeds, UK', 'Headingley', 'Hyde Park', 'Chapel Allerton', 'Horsforth', 'Roundhay'];

const TRUST = [
  { icon: 'shield-checkmark' as const, label: 'Verified pros' },
  { icon: 'lock-closed' as const, label: 'Secure payments' },
  { icon: 'ribbon' as const, label: 'Satisfaction guarantee' },
];

export default function HomeScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { width } = useWindowDimensions();
  const name = useAuthStore((s) => s.user?.name);
  const unread = useNotificationsStore((s) => s.items.filter((n) => !n.read).length);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState('Leeds, UK');
  const [locationOpen, setLocationOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const banners = useMemo<HeroBanner[]>(
    () => [
      {
        id: 'b1',
        title: '20% off your first clean',
        subtitle: 'New customers · code SPARKLE20',
        cta: 'Book cleaning',
        icon: 'sparkles',
        colors: [c.brand.primary, c.brand.primaryDark],
        onPress: () => router.push(route('/category/cleaning')),
      },
      {
        id: 'b2',
        title: 'Top-rated barbers',
        subtitle: 'Fresh cuts across Leeds',
        cta: 'Explore beauty',
        icon: 'cut',
        colors: ['#7C3AED', '#4F46E5'],
        onPress: () => router.push(route('/category/beauty')),
      },
      {
        id: 'b3',
        title: 'Ace your exams',
        subtitle: 'Expert tutors from £22/hr',
        cta: 'Find a tutor',
        icon: 'school',
        colors: ['#0EA5E9', '#2563EB'],
        onPress: () => router.push(route('/category/tutoring')),
      },
    ],
    [c, router],
  );

  const mostBooked = useMemo(() => allProviders.filter((p) => p.mostBooked).slice(0, 10), []);
  const topRated = useMemo(
    () => [...allProviders].sort((a, b) => b.rating - a.rating).slice(0, 10),
    [],
  );
  const newOnBookit = useMemo(() => allProviders.filter((p) => p.isNew).slice(0, 10), []);

  const openCategory = (cat: Category) => {
    Haptics.selectionAsync().catch(() => {});
    if (cat.live) {
      router.push(route(`/category/${cat.slug}`));
    } else {
      showToast(`${cat.label} is coming soon to Leeds`);
    }
  };

  const openProvider = (p: Provider) => {
    track('view_provider', { providerId: p.id, from: 'home' });
    router.push(`/provider/${p.id}`);
  };

  const initial = name?.charAt(0)?.toUpperCase() ?? 'A';
  // Two rows of 4 category tiles.
  const tileWidth = (width - spacing.lg * 2 - spacing.md * 3) / 4;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          style={styles.location}
          onPress={() => setLocationOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Change location, current ${location}`}
        >
          <Ionicons name="location" size={16} color={c.brand.tint} />
          <View>
            <Text style={styles.locationLabel}>Location</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>{location}</Text>
              <Ionicons name="chevron-down" size={14} color={c.text.muted} />
            </View>
          </View>
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.bell}
            onPress={() => router.push(route('/notifications'))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          >
            <Ionicons name="notifications-outline" size={22} color={c.text.primary} />
            {unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            style={styles.avatar}
            onPress={() => setDrawerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.brand.tint}
            colors={[c.brand.primary]}
          />
        }
      >
        <View style={styles.greetBlock}>
          <Text style={styles.greeting}>Hi {name ?? 'there'} 👋</Text>
          <Text style={styles.subtitle}>What do you need done today?</Text>
        </View>

        <Pressable
          style={styles.searchBar}
          onPress={() => router.push(route('/search'))}
          accessibilityRole="search"
          accessibilityLabel="Search services and providers"
        >
          <Ionicons name="search" size={18} color={c.text.muted} />
          <Text style={styles.searchPlaceholder}>Search cleaners, barbers, tutors…</Text>
        </Pressable>

        {loading ? (
          <HomeSkeleton styles={styles} />
        ) : (
          <>
            <View style={styles.carousel}>
              <HeroCarousel banners={banners} />
            </View>

            <SectionHeader title="Services" styles={styles} />
            <View style={styles.grid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.slug}
                  style={[styles.tile, { width: tileWidth }]}
                  onPress={() => openCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`${cat.label}${cat.live ? '' : ', coming soon'}`}
                >
                  <View style={[styles.tileIcon, !cat.live && styles.tileIconMuted]}>
                    <Ionicons
                      name={cat.icon}
                      size={24}
                      color={cat.live ? c.brand.tint : c.text.muted}
                    />
                    {!cat.live ? (
                      <View style={styles.soonDot}>
                        <Ionicons name="time" size={10} color={c.text.inverse} />
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.tileLabel} numberOfLines={1}>
                    {cat.label}
                  </Text>
                  {!cat.live ? <Text style={styles.soonText}>Soon</Text> : null}
                </Pressable>
              ))}
            </View>

            <Rail
              title="Most booked near you"
              data={mostBooked}
              onProvider={openProvider}
              styles={styles}
              c={c}
            />
            <Rail
              title="Top rated"
              data={topRated}
              onProvider={openProvider}
              styles={styles}
              c={c}
            />
            <Rail
              title="New on Bookit"
              data={newOnBookit}
              onProvider={openProvider}
              styles={styles}
              c={c}
            />

            <View style={styles.trustStrip}>
              {TRUST.map((t) => (
                <View key={t.label} style={styles.trustItem}>
                  <Ionicons name={t.icon} size={20} color={c.brand.tint} />
                  <Text style={styles.trustLabel}>{t.label}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={styles.referral}
              onPress={() => router.push(route('/referrals'))}
              accessibilityRole="button"
              accessibilityLabel="Refer a friend: give £10, get £10"
            >
              <View style={styles.referralIcon}>
                <Ionicons name="gift" size={26} color={c.brand.tint} />
              </View>
              <View style={styles.referralBody}>
                <Text style={styles.referralTitle}>Give £10, get £10</Text>
                <Text style={styles.referralText}>
                  Invite a friend to Bookit and you both save on your next booking.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={c.text.muted} />
            </Pressable>
          </>
        )}
      </ScrollView>

      <BottomSheet
        visible={locationOpen}
        onClose={() => setLocationOpen(false)}
        title="Choose area"
      >
        {AREAS.map((area) => {
          const selected = area === location;
          return (
            <Pressable
              key={area}
              style={styles.areaRow}
              onPress={() => {
                setLocation(area);
                setLocationOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={area}
            >
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? c.brand.tint : c.text.muted}
              />
              <Text style={styles.areaText}>{area}</Text>
            </Pressable>
          );
        })}
      </BottomSheet>

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

function SectionHeader({
  title,
  styles,
  onSeeAll,
}: {
  title: string;
  styles: ReturnType<typeof makeStyles>;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll ? (
        <Pressable
          onPress={onSeeAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`See all ${title}`}
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Rail({
  title,
  data,
  onProvider,
  styles,
  c,
}: {
  title: string;
  data: Provider[];
  onProvider: (p: Provider) => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  if (data.length === 0) return null;
  return (
    <View style={styles.rail}>
      <SectionHeader title={title} styles={styles} />
      <FlashList
        data={data}
        horizontal
        keyExtractor={(p: Provider) => p.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.railContent}
        ItemSeparatorComponent={() => <View style={styles.railGap} />}
        renderItem={({ item }: { item: Provider }) => (
          <Pressable
            style={styles.railCard}
            onPress={() => onProvider(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, rated ${item.rating.toFixed(1)}, from £${item.priceFrom}`}
          >
            <Image
              source={{ uri: item.photo }}
              style={styles.railPhoto}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View style={styles.railInfo}>
              <Text style={styles.railName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.railMeta}>
                <Ionicons name="star" size={12} color={c.brand.star} />
                <Text style={styles.railRating}>{item.rating.toFixed(1)}</Text>
                <Text style={styles.railDot}>·</Text>
                <Text style={styles.railArea} numberOfLines={1}>
                  {item.area ?? `${item.distanceKm} km`}
                </Text>
              </View>
              <Text style={styles.railPrice}>from £{item.priceFrom}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function HomeSkeleton({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.skeletonWrap}>
      <Skeleton width="100%" height={150} rounded={radius.xl} />
      <View style={styles.skeletonGrid}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} width={56} height={72} rounded={radius.md} />
        ))}
      </View>
      <Skeleton width="55%" height={20} />
      <View style={styles.skeletonRow}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width={160} height={190} rounded={radius.lg} />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      backgroundColor: c.background.base,
    },
    location: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    locationLabel: { ...typography.scale.caption, color: c.text.muted },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    locationText: { ...typography.scale.bodyMedium, color: c.text.primary },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    bell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    unreadBadge: {
      position: 'absolute',
      top: 4,
      right: 2,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor: c.status.danger,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.background.base,
    },
    unreadText: {
      ...typography.scale.caption,
      fontSize: 9,
      lineHeight: 12,
      color: c.text.inverse,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...typography.scale.bodyMedium, color: c.brand.tint },
    greetBlock: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    greeting: { ...typography.scale.h1, color: c.text.primary },
    subtitle: { ...typography.scale.body, color: c.text.secondary, marginTop: 2 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      height: 52,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: c.background.muted,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchPlaceholder: { ...typography.scale.body, color: c.text.muted },
    carousel: { marginTop: spacing.xl },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    sectionTitle: { ...typography.scale.h2, color: c.text.primary },
    seeAll: { ...typography.scale.smallMedium, color: c.brand.tint },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    tile: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    tileIcon: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileIconMuted: {
      backgroundColor: c.background.muted,
    },
    soonDot: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.brand.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileLabel: { ...typography.scale.caption, color: c.text.primary, textAlign: 'center' },
    soonText: { ...typography.scale.caption, fontSize: 10, color: c.text.muted },
    rail: { marginTop: spacing.xs },
    railContent: { paddingHorizontal: spacing.lg },
    railGap: { width: spacing.md },
    railCard: {
      width: 170,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      overflow: 'hidden',
      ...shadow.card,
    },
    railPhoto: { width: '100%', height: 110, backgroundColor: c.skeleton },
    railInfo: { padding: spacing.md, gap: 2 },
    railName: { ...typography.scale.smallMedium, color: c.text.primary },
    railMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    railRating: { ...typography.scale.caption, color: c.text.primary },
    railDot: { color: c.text.muted },
    railArea: { ...typography.scale.caption, color: c.text.muted, flexShrink: 1 },
    railPrice: { ...typography.scale.smallMedium, color: c.brand.tint, marginTop: 2 },
    trustStrip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.xxl,
      padding: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
    },
    trustItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
    trustLabel: { ...typography.scale.caption, color: c.text.primary, textAlign: 'center' },
    referral: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      ...shadow.card,
    },
    referralIcon: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      backgroundColor: c.brand.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    referralBody: { flex: 1, gap: 2 },
    referralTitle: { ...typography.scale.bodyMedium, color: c.text.primary },
    referralText: { ...typography.scale.caption, color: c.text.secondary },
    areaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
    areaText: { ...typography.scale.body, color: c.text.primary },
    skeletonWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.lg },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      justifyContent: 'space-between',
    },
    skeletonRow: { flexDirection: 'row', gap: spacing.md },
  });
