import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  providers as allProviders,
  categories,
  getProviderById,
  getCategoryForProvider,
} from '../../src/mocks';
import type { Provider, Service } from '../../src/mocks/types';
import { useColors, useTokens, spacing, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useNotificationsStore } from '../../src/stores/notificationsStore';
import { useBookingsStore, type BookingStatus } from '../../src/stores/bookingsStore';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useCartStore } from '../../src/stores/cartStore';
import { showToast } from '../../src/stores/toastStore';
import {
  Text,
  Icon,
  IconButton,
  Avatar,
  SearchField,
  SectionHeader,
  PressableScale,
  CategoryTile,
  BentoSpotlight,
  ServiceCard,
  ProCard,
  OfferCard,
  LiveChip,
  BookingBar,
  LivePill,
  Coachmark,
  LogoRefresh,
} from '../../src/components/ui';
import type { BentoItem } from '../../src/components/ui';
import { Fluent3D } from '../../src/assets/3d';
import { route } from '../../src/lib/nav';
import { BottomSheet } from '../../src/components/BottomSheet';

const ADDRESSES = [
  'Home · 14 Park Row, Leeds',
  'Work · 1 City Square, Leeds',
  'Headingley, LS6',
  'Chapel Allerton, LS7',
  'Roundhay, LS8',
];
const ACTIVE: BookingStatus[] = ['Requested', 'Accepted', 'On the way'];
const PLACEHOLDERS = [
  'Try “deep clean tomorrow under £80”',
  'Try “haircut this weekend”',
  'Try “maths tutor for GCSE”',
  'Try “leaky tap, today”',
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Representative bookable service for a provider (popular, else cheapest). */
function repService(p: Provider): Service {
  return p.services.find((s) => s.popular) ?? [...p.services].sort((a, b) => a.price - b.price)[0];
}

function slugFor(p: Provider): string {
  return getCategoryForProvider(p.category)?.slug ?? p.category;
}

function pad(n: number): string {
  return `${n}`.padStart(2, '0');
}

/** NOVA v3 Home — Blinkit-style stack with floating basket bar. */
export default function Home() {
  const t = useTokens();
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const unread = useNotificationsStore((s) => s.unreadCount());
  const bookings = useBookingsStore((s) => s.bookings);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [address, setAddress] = useState(ADDRESSES[0]);
  const [pickAddress, setPickAddress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [phIndex, setPhIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhIndex((i) => (i + 1) % PLACEHOLDERS.length), 3500);
    return () => clearInterval(id);
  }, []);

  const active = useMemo(() => bookings.find((b) => ACTIVE.includes(b.status)), [bookings]);
  const activeProvider = active ? getProviderById(active.providerId) : undefined;
  const bookAgain = useMemo(() => allProviders.filter((p) => p.mostBooked).slice(0, 6), []);
  const popular = useMemo(() => [...allProviders].slice(0, 8), []);
  const topRated = useMemo(
    () => [...allProviders].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [],
  );

  const needs = useOnboardingStore((s) => s.needs);
  const orderedCategories = useMemo(() => {
    if (needs.length === 0) return categories;
    const picked = categories.filter((cat) => needs.includes(cat.slug));
    const rest = categories.filter((cat) => !needs.includes(cat.slug));
    return [...picked, ...rest];
  }, [needs]);

  const bento = useMemo<BentoItem[]>(() => {
    const live = categories.filter((cat) => cat.live && cat.subServices.length > 0);
    return live.slice(0, 4).map((cat) => {
      const from = Math.min(...cat.subServices.map((s) => s.priceFrom));
      return {
        categorySlug: cat.slug,
        title: cat.subServices[0].name,
        fromPrice: from,
        onPress: () => router.push(`/category/${cat.slug}`),
      };
    });
  }, [router]);

  const openCategory = (slug: string, live: boolean) => {
    if (live) router.push(`/category/${slug}`);
    else showToast('Coming soon to your area');
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const renderServiceRail = (list: Provider[]) =>
    list.map((p) => {
      const s = repService(p);
      return (
        <ServiceCard
          key={p.id}
          width={220}
          categorySlug={slugFor(p)}
          title={s.name}
          durationMin={s.durationMin}
          price={s.price}
          oldPrice={s.popular ? Math.round(s.price * 1.25) : undefined}
          tag={s.popular ? 'POPULAR' : undefined}
          rating={p.rating}
          ratingCount={p.reviewCount}
          cartKey={s.id ?? s.name}
          providerId={p.id}
          providerName={p.name}
          onPress={() => router.push(`/provider/${p.id}`)}
        />
      );
    });

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <LogoRefresh refreshing={refreshing} topInset={insets.top} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />
        }
      >
        {/* 1. Collapsing header */}
        <View style={styles.header}>
          <View style={styles.flex1}>
            <Text variant="footnote" tone="muted">
              {greeting()}
              {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </Text>
            <PressableScale
              onPress={() => setPickAddress(true)}
              haptic="selection"
              accessibilityRole="button"
              accessibilityLabel={`Address: ${address}`}
              style={styles.addressRow}
            >
              <Icon name="map-pin" size={16} color={t.accent} />
              <Text variant="headline" numberOfLines={1} style={styles.addressText}>
                {address}
              </Text>
              <Icon name="chevron-down" size={16} color={t.textMuted} />
            </PressableScale>
          </View>
          <View>
            <IconButton
              name="bell"
              accessibilityLabel="Notifications"
              variant="subtle"
              onPress={() => router.push('/notifications')}
            />
            {unread > 0 && (
              <View style={[styles.dot, { backgroundColor: t.coral, borderColor: t.bg }]} />
            )}
          </View>
          <PressableScale
            onPress={() => router.push(route('/profile'))}
            haptic="light"
            accessibilityRole="button"
            accessibilityLabel="Your profile"
          >
            <Avatar name={user?.name ?? 'You'} size={40} />
          </PressableScale>
        </View>

        <View style={styles.liveChipWrap}>
          <LiveChip label="42 pros free near you now" />
        </View>

        {/* 2. Smart search */}
        <View style={styles.block}>
          <SearchField
            placeholder={PLACEHOLDERS[phIndex]}
            onPress={() => router.push('/concierge')}
          />
        </View>

        {/* 3. Book a service — categories */}
        <View style={styles.block}>
          <SectionHeader title="Book a service" onSeeAll={() => router.push('/(tabs)/explore')} />
          <View style={styles.grid}>
            {orderedCategories.slice(0, 8).map((cat) => (
              <CategoryTile
                key={cat.slug}
                categorySlug={cat.slug}
                label={cat.label}
                soon={!cat.live}
                onPress={() => openCategory(cat.slug, cat.live)}
              />
            ))}
          </View>
        </View>

        {/* 4. Today's picks — bento */}
        <View style={styles.block}>
          <SectionHeader title="Today's picks" />
          <BentoSpotlight items={bento} />
        </View>

        {/* 5a. Book again */}
        {bookAgain.length > 0 && (
          <View style={styles.block}>
            <SectionHeader title="Book again" onSeeAll={() => router.push('/(tabs)/explore')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {renderServiceRail(bookAgain)}
            </ScrollView>
          </View>
        )}

        {/* 5b. Popular near you */}
        <View style={styles.block}>
          <SectionHeader title="Popular near you" onSeeAll={() => router.push('/(tabs)/explore')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {renderServiceRail(popular)}
          </ScrollView>
        </View>

        {/* 6. Top rated near you — pros */}
        <View style={styles.block}>
          <SectionHeader
            title="Top rated near you"
            onSeeAll={() => router.push('/(tabs)/explore')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {topRated.map((p) => (
              <ProCard
                key={p.id}
                width={240}
                name={p.name}
                avatarUri={p.photo}
                rating={p.rating}
                ratingCount={p.reviewCount}
                distanceKm={p.distanceKm}
                verified={p.verified}
                freeText="Free today 4:30 pm"
                onPress={() => router.push(`/provider/${p.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* 7. For you */}
        <View style={styles.block}>
          <SectionHeader title="For you" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            <OfferCard
              width={240}
              tone="coral"
              art="wrapped_gift"
              title="£10 off your first booking"
              subtitle="New to Bookit"
              code="BOOKIT10"
              onPress={() => router.push('/offers')}
            />
            <PressableScale
              onPress={() => router.push('/plus')}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel="Bookit Plus"
              style={styles.plus}
            >
              <LinearGradient
                colors={c.brand.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.plusGrad}
              >
                <Icon name="crown" size={24} color={t.onInverse} />
                <Text variant="headline" style={[styles.onGrad, styles.plusTitle]}>
                  Bookit Plus
                </Text>
                <Text variant="footnote" style={[styles.onGrad, styles.plusSub]}>
                  Save on every booking
                </Text>
              </LinearGradient>
            </PressableScale>
            <DealsCountdown onPress={() => router.push('/offers')} />
            <OfferCard
              width={240}
              tone="sky"
              art="party_popper"
              title="Give £10, get £10"
              subtitle="Refer a friend"
              onPress={() => router.push('/referrals')}
            />
          </ScrollView>
        </View>

        {/* 8. Trust line */}
        <View style={[styles.block, styles.trust]}>
          <Fluent3D name="shield" size={32} />
          <Text variant="footnote" tone="muted" style={styles.flex1}>
            Every pro is ID-checked and insured · Pay after the job
          </Text>
        </View>
      </ScrollView>

      {/* Floating basket bar (wins) or live booking pill */}
      {cartCount > 0 ? (
        <BookingBar />
      ) : active ? (
        <LivePill
          providerName={active.providerName}
          avatarUri={activeProvider?.photo}
          statusText="is on the way"
          etaLabel="8 min"
          progress={0.6}
          onPress={() => router.push(`/tracking/${active.id}`)}
        />
      ) : null}

      <Coachmark
        coachKey="home"
        title="Find help, fast"
        message="Search in plain English — like “deep clean tomorrow under £80”. Tap a category to browse."
        top={insets.top + 120}
      />

      <BottomSheet visible={pickAddress} onClose={() => setPickAddress(false)}>
        <View style={styles.sheet}>
          <Text variant="title2" style={styles.sheetTitle}>
            Choose address
          </Text>
          {ADDRESSES.map((a) => (
            <PressableScale
              key={a}
              onPress={() => {
                setAddress(a);
                setPickAddress(false);
              }}
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel={a}
              style={styles.addrItem}
            >
              <Icon name="map-pin" size={20} color={a === address ? t.accent : t.textMuted} />
              <Text
                variant="body"
                style={[styles.flex1, { fontWeight: a === address ? '600' : '400' }]}
              >
                {a}
              </Text>
              {a === address && <Icon name="check" size={20} color={t.accent} />}
            </PressableScale>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const DEADLINE = (() => {
  const d = new Date();
  d.setHours(23, 59, 59, 0);
  return d.getTime();
})();

function DealsCountdown({ onPress }: { onPress: () => void }) {
  const t = useTokens();
  const [left, setLeft] = useState(() => Math.max(0, DEADLINE - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, DEADLINE - Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  const secs = Math.floor(left / 1000);
  const hh = pad(Math.floor(secs / 3600));
  const mm = pad(Math.floor((secs % 3600) / 60));
  const ss = pad(secs % 60);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      haptic="selection"
      accessibilityRole="button"
      accessibilityLabel={`Flash deals end in ${hh}:${mm}:${ss}`}
      style={[styles.deals, { backgroundColor: t.coralSoft }]}
    >
      <Fluent3D name="fire" size={56} style={styles.dealsArt} />
      <Text variant="headline">Flash deals</Text>
      <Text variant="footnote" tone="muted">
        Ends in
      </Text>
      <Text variant="title2" tabular style={{ color: t.coral }}>
        {hh}:{mm}:{ss}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  addressText: { flexShrink: 1 },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  liveChipWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  block: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  rail: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.lg },
  plus: { width: 240 },
  plusGrad: {
    height: 128,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  onGrad: { color: '#FFFFFF' },
  plusTitle: { marginTop: spacing.sm },
  plusSub: { opacity: 0.9 },
  deals: {
    width: 180,
    height: 128,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    gap: 2,
  },
  dealsArt: { position: 'absolute', right: -6, top: -6 },
  trust: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.section,
  },
  sheet: { padding: spacing.lg, gap: spacing.xs },
  sheetTitle: { marginBottom: spacing.sm },
  addrItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
});
