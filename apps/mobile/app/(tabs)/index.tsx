import { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { providers as allProviders, categories, getProviderById } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import { useMoney } from '../../src/i18n';
import { useColors, useTokens, spacing, radius } from '../../src/theme';
import { useAuthStore } from '../../src/stores/authStore';
import { useNotificationsStore } from '../../src/stores/notificationsStore';
import { useBookingsStore, type BookingStatus } from '../../src/stores/bookingsStore';
import {
  Text,
  Icon,
  IconButton,
  SearchField,
  Card,
  Rating,
  StatusPill,
  PressableScale,
  SectionHeader,
  LiveActivityPill,
  Coachmark,
} from '../../src/components/ui';
import { CategoryIcon } from '../../src/assets/icons/categories';
import { BottomSheet } from '../../src/components/BottomSheet';

const AREAS = ['Leeds, UK', 'Headingley', 'Hyde Park', 'Chapel Allerton', 'Horsforth', 'Roundhay'];
const ACTIVE: BookingStatus[] = ['Requested', 'Accepted', 'On the way'];

const STATUS_TONE: Record<BookingStatus, 'info' | 'success' | 'warning' | 'neutral'> = {
  Requested: 'warning',
  Accepted: 'info',
  'On the way': 'info',
  Completed: 'success',
  Cancelled: 'neutral',
};

function RailCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const t = useTokens();
  const money = useMoney();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={provider.name}
      style={styles.railCard}
    >
      <Image
        source={provider.photo}
        style={[styles.railImg, { backgroundColor: t.bgSubtle }]}
        contentFit="cover"
        transition={150}
      />
      <Text
        variant="callout"
        numberOfLines={1}
        style={{ fontWeight: '600', marginTop: spacing.sm }}
      >
        {provider.name}
      </Text>
      <Text variant="footnote" tone="muted" numberOfLines={1}>
        {provider.tagline ?? provider.category}
      </Text>
      <View style={styles.railMeta}>
        <Rating value={provider.rating} />
        <Text variant="footnote" tabular tone="muted">
          {money(provider.priceFrom)}+
        </Text>
      </View>
    </PressableScale>
  );
}

/** NOVA Home — six compact blocks: header, smart search, live booking, categories, two rails, one carousel. */
export default function Home() {
  const t = useTokens();
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const unread = useNotificationsStore((s) => s.unreadCount());
  const bookings = useBookingsStore((s) => s.bookings);
  const [area, setArea] = useState(AREAS[0]);
  const [pickArea, setPickArea] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const active = useMemo(() => bookings.find((b) => ACTIVE.includes(b.status)), [bookings]);
  const activeProvider = active ? getProviderById(active.providerId) : undefined;
  const onTheWay = active?.status === 'On the way';
  const bookAgain = useMemo(() => allProviders.filter((p) => p.mostBooked).slice(0, 6), []);
  const topRated = useMemo(
    () => [...allProviders].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [],
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />
        }
      >
        {/* 1. Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="footnote" tone="muted">
              {user?.name ? `Hi, ${user.name}` : 'Welcome back'}
            </Text>
            <PressableScale
              onPress={() => setPickArea(true)}
              haptic="selection"
              accessibilityRole="button"
              accessibilityLabel={`Location: ${area}`}
              style={styles.locationPill}
            >
              <Icon name="map-pin" size={16} color={t.accent} />
              <Text variant="headline" numberOfLines={1}>
                {area}
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
              <View style={[styles.dot, { backgroundColor: t.danger, borderColor: t.bg }]} />
            )}
          </View>
        </View>

        {/* 2. Smart search / concierge */}
        <View style={styles.block}>
          <SearchField
            placeholder="Try “deep clean tomorrow under £80”"
            onPress={() => router.push('/concierge')}
          />
        </View>

        {/* 3. Live booking */}
        {active && (
          <View style={styles.block}>
            <PressableScale
              onPress={() => router.push(`/booking-detail/${active.id}`)}
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel="Your active booking"
            >
              <Card variant="outlined" padding={spacing.md}>
                <View style={styles.liveRow}>
                  <StatusPill label={active.status} tone={STATUS_TONE[active.status]} />
                  <Text variant="footnote" tone="muted" tabular>
                    {active.date} · {active.time}
                  </Text>
                </View>
                <Text variant="headline" style={{ marginTop: spacing.xs }}>
                  {active.serviceName}
                </Text>
                <Text variant="footnote" tone="muted">
                  with {active.providerName}
                </Text>
              </Card>
            </PressableScale>
          </View>
        )}

        {/* 4. Categories */}
        <View style={styles.block}>
          <SectionHeader title="Categories" onSeeAll={() => router.push('/(tabs)/explore')} />
          <View style={styles.grid}>
            {categories.map((cat) => (
              <PressableScale
                key={cat.slug}
                onPress={() => router.push(`/category/${cat.slug}`)}
                haptic="selection"
                scaleTo={0.95}
                accessibilityRole="button"
                accessibilityLabel={cat.label}
                style={styles.tile}
              >
                <CategoryIcon slug={cat.slug} size={56} />
                <Text variant="caption" numberOfLines={1} style={{ fontWeight: '600' }}>
                  {cat.label}
                </Text>
              </PressableScale>
            ))}
          </View>
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
              {bookAgain.map((p) => (
                <RailCard
                  key={p.id}
                  provider={p}
                  onPress={() => router.push(`/provider/${p.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* 5b. Top rated near you */}
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
              <RailCard key={p.id} provider={p} onPress={() => router.push(`/provider/${p.id}`)} />
            ))}
          </ScrollView>
        </View>

        {/* 6. For you */}
        <View style={styles.block}>
          <SectionHeader title="For you" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            <PressableScale
              onPress={() => router.push('/plus')}
              scaleTo={0.98}
              accessibilityRole="button"
              accessibilityLabel="Bookit Plus"
              style={styles.promo}
            >
              <LinearGradient
                colors={c.brand.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.promoGrad}
              >
                <Icon name="award" size={24} color="#FFFFFF" />
                <Text variant="headline" style={{ color: '#FFFFFF', marginTop: spacing.sm }}>
                  Bookit Plus
                </Text>
                <Text variant="footnote" style={{ color: '#FFFFFF', opacity: 0.9 }}>
                  Save on every booking
                </Text>
              </LinearGradient>
            </PressableScale>
            <PromoCard
              icon="percent"
              title="Deals & offers"
              subtitle="Limited-time savings"
              onPress={() => router.push('/offers')}
            />
            <PromoCard
              icon="gift"
              title="Refer a friend"
              subtitle="Give £10, get £10"
              onPress={() => router.push('/referrals')}
            />
          </ScrollView>
        </View>
      </ScrollView>

      {onTheWay && active && (
        <View
          style={[styles.liveActivity, { bottom: insets.bottom + 86 }]}
          pointerEvents="box-none"
        >
          <LiveActivityPill
            providerName={active.providerName}
            avatarUri={activeProvider?.photo}
            eta="8 min"
            progress={0.6}
            onPress={() => router.push(`/booking-detail/${active.id}`)}
          />
        </View>
      )}

      <Coachmark
        coachKey="home"
        title="Find help, fast"
        message="Search in plain English — like “deep clean tomorrow under £80”. Tap a category to browse."
        top={insets.top + 120}
      />

      <BottomSheet visible={pickArea} onClose={() => setPickArea(false)}>
        <View style={{ padding: spacing.lg, gap: spacing.xs }}>
          <Text variant="title2" style={{ marginBottom: spacing.sm }}>
            Choose area
          </Text>
          {AREAS.map((a) => (
            <PressableScale
              key={a}
              onPress={() => {
                setArea(a);
                setPickArea(false);
              }}
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel={a}
              style={styles.areaRow}
            >
              <Icon name="map-pin" size={20} color={a === area ? t.accent : t.textMuted} />
              <Text variant="body" style={{ flex: 1, fontWeight: a === area ? '600' : '400' }}>
                {a}
              </Text>
              {a === area && <Icon name="check" size={20} color={t.accent} />}
            </PressableScale>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

function PromoCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: 'percent' | 'gift';
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const t = useTokens();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={styles.promo}
    >
      <Card variant="outlined" padding={spacing.md} style={styles.promoCard}>
        <View style={[styles.promoIcon, { backgroundColor: t.accentSoft }]}>
          <Icon name={icon} size={20} color={t.accent} />
        </View>
        <Text variant="headline" style={{ marginTop: spacing.sm }}>
          {title}
        </Text>
        <Text variant="footnote" tone="muted">
          {subtitle}
        </Text>
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  block: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  liveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  tile: { width: '25%', alignItems: 'center', gap: spacing.xs },
  rail: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.lg },
  railCard: { width: 148 },
  railImg: { width: 148, height: 104, borderRadius: radius.md },
  railMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  promo: { width: 220 },
  promoGrad: {
    height: 128,
    borderRadius: radius.lg,
    padding: spacing.lg,
    justifyContent: 'flex-end',
  },
  promoCard: { height: 128, justifyContent: 'flex-end' },
  promoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
  liveActivity: { position: 'absolute', left: spacing.lg, right: spacing.lg },
});
