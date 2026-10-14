import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  Bell,
  MapPin,
  ChevronDown,
  Mic,
  Search,
  Sparkles,
  Scissors,
  GraduationCap,
  Hammer,
  Droplets,
  Zap,
  Truck,
  PawPrint,
  Star,
  Camera,
  Gift,
  ShieldCheck,
  Lock,
  BadgeCheck,
  Crown,
  Plus,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react-native';

import {
  BottomSheet,
  Skeleton,
  GradientButton,
  Reveal,
  PressableScale,
  BookitRefresh,
} from '../../src/components';
import { AppDrawer } from '../../src/components/AppDrawer';
import { IllustrationSpot } from '../../src/assets/illustrations';
import { providers as allProviders, categories } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import type { Category } from '../../src/mocks/categories';
import { track } from '../../src/lib/analytics';
import { route } from '../../src/lib/nav';
import { useT, useMoney, useDirectionalStyles } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/authStore';
import { useNotificationsStore } from '../../src/stores/notificationsStore';
import { showToast } from '../../src/stores/toastStore';
import {
  useColors,
  useColorSchemeName,
  radius,
  shadow,
  spacing,
  typography,
  type Palette,
} from '../../src/theme';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  cleaning: Sparkles,
  beauty: Scissors,
  tutoring: GraduationCap,
  handyman: Hammer,
  plumbing: Droplets,
  electrician: Zap,
  moving: Truck,
  'pet-care': PawPrint,
};

const AREAS = ['Leeds, UK', 'Headingley', 'Hyde Park', 'Chapel Allerton', 'Horsforth', 'Roundhay'];

interface Deal {
  provider: Provider;
  percent: number;
  /** Milliseconds from mount until the deal ends (avoids Date.now in render). */
  durationMs: number;
}

function greetingKey(): 'home.greetingMorning' | 'home.greetingAfternoon' | 'home.greetingEvening' {
  const h = new Date().getHours();
  if (h < 12) return 'home.greetingMorning';
  if (h < 18) return 'home.greetingAfternoon';
  return 'home.greetingEvening';
}

export default function HomeScreen() {
  const router = useRouter();
  const c = useColors();
  const scheme = useColorSchemeName();
  const t = useT();
  const money = useMoney();
  const dir = useDirectionalStyles();
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
  const [preview, setPreview] = useState<Category | null>(null);
  const [estimate, setEstimate] = useState<{ uri: string; low: number; high: number } | null>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // Parallax hero: the gradient panel stretches + scales when you overscroll
  // (pull down) and lifts away slightly as you scroll into the feed.
  const headerBgStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      transform: [
        { translateY: interpolate(y, [-150, 0], [-75, 0], Extrapolation.CLAMP) },
        { scale: interpolate(y, [-200, 0], [1.35, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  // Frosted sticky bar fades in once the greeting scrolls under the header.
  const stickyBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [60, 130], [0, 1], Extrapolation.CLAMP),
  }));

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    if (refreshing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }, [refreshing]);

  const onScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (e.nativeEvent.contentOffset.y <= -72) onRefresh();
    },
    [onRefresh],
  );

  const topRated = useMemo(
    () => [...allProviders].sort((a, b) => b.rating - a.rating).slice(0, 8),
    [],
  );
  const availableNow = useMemo(
    () => allProviders.filter((p) => (p.stats?.responseTime ?? '').includes('min')).slice(0, 8),
    [],
  );
  const newPros = useMemo(() => allProviders.filter((p) => p.isNew).slice(0, 8), []);
  const deals = useMemo<Deal[]>(
    () =>
      allProviders
        .filter((p) => p.mostBooked)
        .slice(0, 6)
        .map((provider, i) => ({
          provider,
          percent: 15 + ((i * 5) % 25),
          durationMs: (1 + i) * 3600 * 1000 + (i * 37 + 12) * 60 * 1000,
        })),
    [],
  );

  const openCategory = (cat: Category) => {
    Haptics.selectionAsync().catch(() => {});
    if (cat.live) router.push(route(`/category/${cat.slug}`));
    else showToast(`${cat.label} is coming soon`);
  };

  const openProvider = (p: Provider) => {
    track('view_provider', { providerId: p.id, from: 'home' });
    router.push(`/provider/${p.id}`);
  };

  const pickEstimatePhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
      });
      if (res.canceled || !res.assets[0]) return;
      const base = 35 + Math.floor(Math.random() * 40);
      setEstimate({
        uri: res.assets[0].uri,
        low: base,
        high: base + 25 + Math.floor(Math.random() * 30),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {
      showToast('Could not open your photos');
    }
  };

  const initial = name?.charAt(0)?.toUpperCase() ?? 'A';
  const tileWidth = (width - spacing.lg * 2 - spacing.md * 3) / 4;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerBg, { height: insets.top + 150 }, headerBgStyle]}>
        <LinearGradient
          colors={[c.brand.gradient[0], c.brand.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {/* Frosted glass bar that fades in as you scroll into the feed. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.stickyBar, { height: insets.top + 60 }, stickyBarStyle]}
      >
        <BlurView
          intensity={60}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.stickyBarBorder, { top: insets.top + 60 - 1 }]} />
      </Animated.View>
      {/* Custom Bookit pull-to-refresh indicator. */}
      <View style={[styles.refreshWrap, { top: insets.top + 56 }]} pointerEvents="none">
        <BookitRefresh active={refreshing} />
      </View>
      <View style={[styles.header, dir.row, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          style={[styles.location, dir.row]}
          onPress={() => setLocationOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Change location, current ${location}`}
        >
          <MapPin size={16} color={c.text.onBrand} />
          <View>
            <Text style={styles.locationLabel}>{t('home.categories')}</Text>
            <View style={[styles.locationRow, dir.row]}>
              <Text style={styles.locationText}>{location}</Text>
              <ChevronDown size={14} color={c.text.onBrand} />
            </View>
          </View>
        </Pressable>
        <View style={[styles.headerRight, dir.row]}>
          <Pressable
            style={styles.bell}
            onPress={() => router.push(route('/notifications'))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          >
            <Bell size={22} color={c.text.onBrand} />
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

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        onScroll={scrollHandler}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
      >
        <View style={styles.greetBlock}>
          <Text style={[styles.greeting, dir.textAlign]}>
            {t(greetingKey())}, {name ?? 'there'}
          </Text>
        </View>

        {/* AI concierge bar */}
        <PressableScale
          style={[styles.concierge, dir.row]}
          onPress={() => router.push(route('/concierge'))}
          accessibilityRole="button"
          accessibilityLabel={t('home.conciergePlaceholder')}
        >
          <View style={styles.conciergeSpark}>
            <Sparkles size={18} color={c.text.onBrand} />
          </View>
          <Text style={[styles.conciergePlaceholder, dir.textAlign]} numberOfLines={1}>
            {t('home.conciergePlaceholder')}
          </Text>
          <Mic size={20} color={c.brand.primary} />
        </PressableScale>

        <PressableScale
          haptic="none"
          style={[styles.searchBar, dir.row]}
          onPress={() => router.push(route('/search'))}
          accessibilityRole="search"
          accessibilityLabel={t('common.search')}
        >
          <Search size={18} color={c.text.muted} />
          <Text style={styles.searchPlaceholder}>Search cleaners, barbers, tutors…</Text>
        </PressableScale>

        {loading ? (
          <HomeSkeleton styles={styles} />
        ) : (
          <>
            <Reveal index={0}>
              <SectionHeader title={t('home.categories')} styles={styles} />
              <View style={styles.grid}>
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.slug] ?? Sparkles;
                  return (
                    <PressableScale
                      key={cat.slug}
                      haptic="selection"
                      style={[styles.tile, { width: tileWidth }]}
                      onPress={() => openCategory(cat)}
                      onLongPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                        setPreview(cat);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${cat.label}${cat.live ? '' : ', coming soon'}`}
                    >
                      <LinearGradient
                        colors={
                          cat.live
                            ? [c.brand.gradient[0], c.brand.gradient[1]]
                            : [c.background.muted, c.background.muted]
                        }
                        style={styles.tileIcon}
                      >
                        <Icon size={24} color={cat.live ? c.text.onBrand : c.text.muted} />
                      </LinearGradient>
                      <Text style={styles.tileLabel} numberOfLines={1}>
                        {cat.label}
                      </Text>
                      {!cat.live ? <Text style={styles.soonText}>Soon</Text> : null}
                    </PressableScale>
                  );
                })}
              </View>
            </Reveal>

            {/* Instant estimate */}
            <Reveal index={1} style={styles.estimate}>
              <View style={styles.estimateTop}>
                <View style={styles.estimateIcon}>
                  <Camera size={22} color={c.brand.primary} />
                </View>
                <View style={styles.estimateBody}>
                  <Text style={[styles.estimateTitle, dir.textAlign]}>
                    {t('home.instantEstimateTitle')}
                  </Text>
                  <Text style={[styles.estimateText, dir.textAlign]}>
                    {t('home.instantEstimateBody')}
                  </Text>
                </View>
              </View>
              {estimate ? (
                <View style={[styles.estimateResult, dir.row]}>
                  <Image
                    source={{ uri: estimate.uri }}
                    style={styles.estimateThumb}
                    contentFit="cover"
                  />
                  <View style={styles.flex}>
                    <Text style={styles.estimateRangeLabel}>{t('home.estimateRange')}</Text>
                    <Text style={styles.estimateRange}>
                      {money(estimate.low)} – {money(estimate.high)}
                    </Text>
                  </View>
                  <Pressable onPress={pickEstimatePhoto} hitSlop={8} accessibilityRole="button">
                    <Text style={styles.estimateRetry}>{t('home.pickPhoto')}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[styles.estimateBtn, dir.row]}
                  onPress={pickEstimatePhoto}
                  accessibilityRole="button"
                >
                  <Camera size={18} color={c.text.onBrand} />
                  <Text style={styles.estimateBtnText}>{t('home.pickPhoto')}</Text>
                </Pressable>
              )}
            </Reveal>

            <Reveal index={2}>
              <ProviderRail
                title={t('home.topRated')}
                data={topRated}
                onProvider={openProvider}
                styles={styles}
                c={c}
                money={money}
              />
            </Reveal>
            <Reveal index={3}>
              <ProviderRail
                title={t('home.availableNow')}
                data={availableNow}
                onProvider={openProvider}
                styles={styles}
                c={c}
                money={money}
                showLive
              />
            </Reveal>
            <Reveal index={4}>
              <ProviderRail
                title={t('home.newPros')}
                data={newPros}
                onProvider={openProvider}
                styles={styles}
                c={c}
                money={money}
              />
            </Reveal>

            {/* Deals ending soon with live countdown */}
            <Reveal index={5}>
              <SectionHeader title={t('home.dealsEnding')} styles={styles} />
              <FlashList
                data={deals}
                horizontal
                keyExtractor={(d: Deal) => d.provider.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.railContent}
                ItemSeparatorComponent={() => <View style={styles.railGap} />}
                renderItem={({ item }: { item: Deal }) => (
                  <DealCard
                    deal={item}
                    onPress={() => openProvider(item.provider)}
                    styles={styles}
                    c={c}
                    money={money}
                  />
                )}
              />
            </Reveal>

            {/* Bookit Plus */}
            <Reveal index={6}>
              <LinearGradient
                colors={[c.brand.primaryDark, c.brand.gradient[0], c.brand.gradient[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.plus}
              >
                <View style={[styles.plusHead, dir.row]}>
                  <Crown size={22} color={c.text.onBrand} />
                  <Text style={styles.plusTitle}>{t('home.plusTitle')}</Text>
                </View>
                <Text style={styles.plusBody}>{t('home.plusBody')}</Text>
                <Pressable
                  style={styles.plusCta}
                  onPress={() => showToast(t('home.plusCta'))}
                  accessibilityRole="button"
                >
                  <Text style={styles.plusCtaText}>{t('home.plusCta')}</Text>
                </Pressable>
              </LinearGradient>
            </Reveal>

            {/* Trust strip */}
            <Reveal index={7} style={[styles.trustStrip, dir.row]}>
              <TrustItem Icon={ShieldCheck} label={t('home.trustVerified')} styles={styles} c={c} />
              <TrustItem Icon={Lock} label={t('home.trustSecure')} styles={styles} c={c} />
              <TrustItem Icon={BadgeCheck} label={t('home.trustRated')} styles={styles} c={c} />
            </Reveal>

            {/* Referral */}
            <Reveal index={8}>
              <PressableScale
                style={[styles.referral, dir.row]}
                onPress={() => router.push(route('/referrals'))}
                accessibilityRole="button"
                accessibilityLabel={t('home.referralTitle')}
              >
                <View style={styles.referralIcon}>
                  <Gift size={24} color={c.brand.accent} />
                </View>
                <View style={styles.referralBody}>
                  <Text style={[styles.referralTitle, dir.textAlign]}>
                    {t('home.referralTitle')}
                  </Text>
                  <Text style={[styles.referralText, dir.textAlign]}>{t('home.referralBody')}</Text>
                </View>
                <ChevronRight size={20} color={c.text.muted} />
              </PressableScale>
            </Reveal>
          </>
        )}
      </Animated.ScrollView>

      {/* Floating post-a-job */}
      <PressableScale
        haptic="medium"
        style={[styles.fab, dir.row, { bottom: insets.bottom + spacing.lg }]}
        onPress={() => router.push(route('/post-job'))}
        accessibilityRole="button"
        accessibilityLabel={t('home.postJob')}
      >
        <LinearGradient
          colors={[c.brand.gradient[0], c.brand.gradient[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.fabFill, dir.row]}
        >
          <Plus size={20} color={c.text.onBrand} />
          <Text style={styles.fabText}>{t('home.postJob')}</Text>
        </LinearGradient>
      </PressableScale>

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
              style={[styles.areaRow, dir.row]}
              onPress={() => {
                setLocation(area);
                setLocationOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={area}
            >
              <MapPin size={18} color={selected ? c.brand.tint : c.text.muted} />
              <Text style={styles.areaText}>{area}</Text>
            </Pressable>
          );
        })}
      </BottomSheet>

      <BottomSheet
        visible={preview !== null}
        onClose={() => setPreview(null)}
        title={preview?.label}
      >
        {preview ? (
          <View style={styles.previewWrap}>
            <View style={styles.previewArt}>
              <IllustrationSpot size={96} />
            </View>
            <Text style={styles.previewTagline}>{preview.tagline}</Text>
            {preview.subServices.slice(0, 3).map((s) => (
              <View key={s.id} style={[styles.previewRow, dir.row]}>
                <Text style={styles.previewName}>{s.name}</Text>
                <Text style={styles.previewPrice}>
                  {t('money.from')} {money(s.priceFrom)}
                </Text>
              </View>
            ))}
            <GradientButton
              label={preview.live ? t('common.seeAll') : 'Soon'}
              disabled={!preview.live}
              onPress={() => {
                const cat = preview;
                setPreview(null);
                if (cat.live) router.push(route(`/category/${cat.slug}`));
              }}
              style={styles.previewCta}
            />
          </View>
        ) : null}
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
        <Pressable onPress={onSeeAll} hitSlop={8} accessibilityRole="button">
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function TrustItem({
  Icon,
  label,
  styles,
  c,
}: {
  Icon: LucideIcon;
  label: string;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <View style={styles.trustItem}>
      <Icon size={20} color={c.brand.tint} />
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

function ProviderRail({
  title,
  data,
  onProvider,
  styles,
  c,
  money,
  showLive,
}: {
  title: string;
  data: Provider[];
  onProvider: (p: Provider) => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  money: (n: number) => string;
  showLive?: boolean;
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
          <PressableScale
            scaleTo={0.97}
            style={styles.railCard}
            onPress={() => onProvider(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, rated ${item.rating.toFixed(1)}`}
          >
            <View>
              <Image
                source={{ uri: item.photo }}
                style={styles.railPhoto}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              {showLive ? (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.railInfo}>
              <Text style={styles.railName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.railMeta}>
                <Star size={12} color={c.brand.star} fill={c.brand.star} />
                <Text style={styles.railRating}>{item.rating.toFixed(1)}</Text>
                <Text style={styles.railDot}>·</Text>
                <Text style={styles.railArea} numberOfLines={1}>
                  {item.area ?? `${item.distanceKm} km`}
                </Text>
              </View>
              <Text style={styles.railPrice}>{money(item.priceFrom)}</Text>
            </View>
          </PressableScale>
        )}
      />
    </View>
  );
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0:00:00';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function DealCard({
  deal,
  onPress,
  styles,
  c,
  money,
}: {
  deal: Deal;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  money: (n: number) => string;
}) {
  const [remaining, setRemaining] = useState(deal.durationMs);
  const endsAtRef = useRef(0);
  useEffect(() => {
    endsAtRef.current = Date.now() + deal.durationMs;
    const id = setInterval(() => setRemaining(endsAtRef.current - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deal.durationMs]);

  return (
    <PressableScale
      scaleTo={0.97}
      style={styles.dealCard}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${deal.provider.name}, ${deal.percent}% off`}
    >
      <Image
        source={{ uri: deal.provider.photo }}
        style={styles.dealPhoto}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.dealBadge}>
        <Text style={styles.dealBadgeText}>-{deal.percent}%</Text>
      </View>
      <View style={styles.dealInfo}>
        <Text style={styles.railName} numberOfLines={1}>
          {deal.provider.name}
        </Text>
        <Text style={styles.railPrice}>{money(deal.provider.priceFrom)}</Text>
        <View style={styles.dealTimer}>
          <Text style={styles.dealTimerText}>{formatRemaining(remaining)}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

function HomeSkeleton({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.skeletonWrap}>
      <View style={styles.skeletonGrid}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} width={56} height={72} rounded={radius.md} />
        ))}
      </View>
      <Skeleton width="100%" height={120} rounded={radius.xl} />
      <Skeleton width="55%" height={20} />
      <View style={styles.skeletonRow}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width={170} height={190} rounded={radius.lg} />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    flex: { flex: 1 },
    headerBg: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      overflow: 'hidden',
    },
    stickyBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
    },
    stickyBarBorder: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: c.border,
    },
    refreshWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 2,
    },
    header: {
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    location: { alignItems: 'center', gap: spacing.sm },
    locationLabel: { ...typography.scale.caption, color: c.text.onBrand, opacity: 0.8 },
    locationRow: { alignItems: 'center', gap: spacing.xs },
    locationText: { ...typography.scale.bodyMedium, color: c.text.onBrand },
    headerRight: { alignItems: 'center', gap: spacing.md },
    bell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    unreadBadge: {
      position: 'absolute',
      top: 4,
      right: 2,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor: c.brand.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.brand.primaryDark,
    },
    unreadText: {
      ...typography.scale.caption,
      fontSize: 9,
      lineHeight: 12,
      color: c.text.onBrand,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.glass,
      borderWidth: 1.5,
      borderColor: c.text.onBrand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { ...typography.scale.bodyMedium, color: c.text.onBrand },
    greetBlock: { paddingHorizontal: spacing.lg, paddingTop: spacing.xs },
    greeting: { ...typography.scale.h1, color: c.text.onBrand },
    concierge: {
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      height: 60,
      paddingHorizontal: spacing.md,
      borderRadius: radius.xl,
      backgroundColor: c.background.surface,
      ...shadow.card,
    },
    conciergeSpark: {
      width: 40,
      height: 40,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    conciergePlaceholder: { flex: 1, ...typography.scale.body, color: c.text.secondary },
    searchBar: {
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
      height: 48,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.lg,
      backgroundColor: c.background.muted,
    },
    searchPlaceholder: { ...typography.scale.body, color: c.text.muted },
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
      marginTop: spacing.xl,
    },
    tile: { alignItems: 'center', gap: spacing.xs },
    tileIcon: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileLabel: { ...typography.scale.caption, color: c.text.primary, textAlign: 'center' },
    soonText: { ...typography.scale.caption, fontSize: 10, color: c.text.muted },
    estimate: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xxl,
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.md,
      ...shadow.soft,
    },
    estimateTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
    estimateIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    estimateBody: { flex: 1, gap: 2 },
    estimateTitle: { ...typography.scale.bodyMedium, color: c.text.primary },
    estimateText: { ...typography.scale.small, color: c.text.secondary },
    estimateBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      height: 48,
      borderRadius: radius.lg,
      backgroundColor: c.brand.primary,
    },
    estimateBtnText: { ...typography.scale.bodyMedium, color: c.text.onBrand },
    estimateResult: { alignItems: 'center', gap: spacing.md },
    estimateThumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: c.skeleton },
    estimateRangeLabel: { ...typography.scale.caption, color: c.text.muted },
    estimateRange: { ...typography.scale.h2, color: c.brand.tint },
    estimateRetry: { ...typography.scale.smallMedium, color: c.brand.tint },
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
    liveBadge: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
      backgroundColor: c.overlay,
    },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.status.success },
    liveText: { ...typography.scale.caption, fontSize: 10, color: c.text.onBrand },
    railInfo: { padding: spacing.md, gap: 2 },
    railName: { ...typography.scale.smallMedium, color: c.text.primary },
    railMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    railRating: { ...typography.scale.caption, color: c.text.primary },
    railDot: { color: c.text.muted },
    railArea: { ...typography.scale.caption, color: c.text.muted, flexShrink: 1 },
    railPrice: { ...typography.scale.smallMedium, color: c.brand.tint, marginTop: 2 },
    dealCard: {
      width: 170,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      overflow: 'hidden',
      ...shadow.card,
    },
    dealPhoto: { width: '100%', height: 100, backgroundColor: c.skeleton },
    dealBadge: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
      backgroundColor: c.brand.accent,
    },
    dealBadgeText: {
      ...typography.scale.caption,
      color: c.text.onBrand,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    dealInfo: { padding: spacing.md, gap: 2 },
    dealTimer: {
      marginTop: spacing.xs,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
      backgroundColor: c.status.dangerSoft,
    },
    dealTimerText: {
      ...typography.scale.caption,
      color: c.status.danger,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    plus: {
      marginHorizontal: spacing.lg,
      marginTop: spacing.xxl,
      padding: spacing.xl,
      borderRadius: radius.xl,
      gap: spacing.sm,
      ...shadow.glow,
    },
    plusHead: { alignItems: 'center', gap: spacing.sm },
    plusTitle: { ...typography.scale.h2, color: c.text.onBrand },
    plusBody: { ...typography.scale.small, color: c.text.onBrand, opacity: 0.9 },
    plusCta: {
      alignSelf: 'flex-start',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.text.onBrand,
    },
    plusCtaText: { ...typography.scale.smallMedium, color: c.brand.primary },
    trustStrip: {
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.xxl,
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: c.brand.primarySoft,
    },
    trustItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
    trustLabel: { ...typography.scale.caption, color: c.text.primary, textAlign: 'center' },
    referral: {
      alignItems: 'center',
      gap: spacing.md,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      padding: spacing.lg,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      ...shadow.soft,
    },
    referralIcon: {
      width: 52,
      height: 52,
      borderRadius: radius.lg,
      backgroundColor: c.brand.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    referralBody: { flex: 1, gap: 2 },
    referralTitle: { ...typography.scale.bodyMedium, color: c.text.primary },
    referralText: { ...typography.scale.caption, color: c.text.secondary },
    fab: { position: 'absolute', right: spacing.lg, borderRadius: radius.pill, ...shadow.glow },
    fabFill: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      height: 56,
      borderRadius: radius.pill,
    },
    fabText: {
      ...typography.scale.bodyMedium,
      color: c.text.onBrand,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    areaRow: { alignItems: 'center', gap: spacing.md, minHeight: 48 },
    areaText: { ...typography.scale.body, color: c.text.primary },
    previewWrap: { gap: spacing.md, paddingBottom: spacing.md },
    previewArt: { alignItems: 'center' },
    previewTagline: { ...typography.scale.body, color: c.text.secondary, textAlign: 'center' },
    previewRow: {
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    previewName: { ...typography.scale.bodyMedium, color: c.text.primary },
    previewPrice: { ...typography.scale.smallMedium, color: c.brand.tint },
    previewCta: { marginTop: spacing.sm },
    skeletonWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.lg },
    skeletonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      justifyContent: 'space-between',
    },
    skeletonRow: { flexDirection: 'row', gap: spacing.md },
  });
