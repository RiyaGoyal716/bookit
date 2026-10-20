import { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Text,
  Icon,
  IconButton,
  Button,
  PressableScale,
  Card,
  Chip,
  Rating,
  SegmentedControl,
  EmptyState,
  Screen,
  ServiceCard,
  BookingBar,
} from '../../src/components/ui';
import type { IconName } from '../../src/components/ui';
import { getProviderById, getProvidersByCategory, getCategoryForProvider } from '../../src/mocks';
import type { Provider, ProviderBadge } from '../../src/mocks/types';
import { getSlotsForDay } from '../../src/mocks/availability';
import { track } from '../../src/lib/analytics';
import { route } from '../../src/lib/nav';
import { haptics } from '../../src/lib/haptics';
import { useCompareStore, COMPARE_LIMIT } from '../../src/stores/compareStore';
import { useFavouritesStore } from '../../src/stores/favouritesStore';
import { useReviewsStore, type Review } from '../../src/stores/reviewsStore';
import { useCartStore } from '../../src/stores/cartStore';
import { showToast } from '../../src/stores/toastStore';
import { useT, useMoney } from '../../src/i18n';
import { useTokens, useColorSchemeName, radius, spacing, shadow } from '../../src/theme';

const HERO_H = 300;

const CATEGORY_LABEL: Record<Provider['category'], string> = {
  cleaning: 'Cleaning',
  beauty: 'Barber & Beauty',
  tutoring: 'Tutoring',
};

const BADGE_META: Record<ProviderBadge, { label: string; icon: IconName }> = {
  'verified-id': { label: 'Verified ID', icon: 'badge-check' },
  'background-checked': { label: 'Background checked', icon: 'shield-check' },
  'top-rated': { label: 'Top rated', icon: 'award' },
  insured: { label: 'Insured', icon: 'shield' },
  'fast-responder': { label: 'Fast responder', icon: 'zap' },
};

const FAQS = [
  {
    question: 'What happens after I book?',
    answer:
      'Your request is sent to the provider, who confirms within their usual response time. You can message them and track the status from your Bookings tab.',
  },
  {
    question: 'Can I reschedule or cancel?',
    answer:
      'Yes. Free cancellation up to 24 hours before your appointment. See the cancellation policy for details.',
  },
  {
    question: 'How do payments work?',
    answer:
      'You can pay securely in the app, or choose "Pay after service". A 12% platform fee supports secure payments and our satisfaction guarantee.',
  },
];

type ReviewFilter = 'all' | 'five' | 'photos';
const TABS = ['Services', 'Reviews', 'About', 'Work'];

export default function ProviderProfileScreen() {
  const router = useRouter();
  const t = useTokens();
  const scheme = useColorSchemeName();
  const tr = useT();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const provider = getProviderById(id);

  const isFavourite = useFavouritesStore((s) => (id ? s.ids.includes(id) : false));
  const toggleFavourite = useFavouritesStore((s) => s.toggle);
  const inCompare = useCompareStore((s) => (id ? s.ids.includes(id) : false));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const reviews = useReviewsStore((s) => s.reviews);
  const addItem = useCartStore((s) => s.addItem);
  const cartProviderId = useCartStore((s) => s.providerId);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [tab, setTab] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [selectedDay, setSelectedDay] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [HERO_H - 120, HERO_H - 40], [0, 1], Extrapolation.CLAMP),
  }));

  const providerReviews = useMemo(
    () => (id ? reviews.filter((r) => r.providerId === id) : []),
    [reviews, id],
  );

  const filteredReviews = useMemo(() => {
    switch (reviewFilter) {
      case 'five':
        return providerReviews.filter((r) => r.rating === 5);
      case 'photos':
        return providerReviews.filter((r) => Boolean(r.photo));
      default:
        return providerReviews;
    }
  }, [providerReviews, reviewFilter]);

  useEffect(() => {
    if (provider) track('view_provider', { providerId: provider.id, from: 'profile' });
  }, [provider]);

  const gallery = useMemo(() => {
    if (!provider) return [];
    return provider.gallery && provider.gallery.length > 0 ? provider.gallery : [provider.photo];
  }, [provider]);

  if (!provider) {
    return (
      <Screen>
        <IconButton
          name="chevron-left"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
        />
        <EmptyState
          art="error"
          title="Provider not found"
          message="This provider may no longer be available."
        />
      </Screen>
    );
  }

  const fromPrice = Math.min(...provider.services.map((s) => s.price));
  const badges = provider.badges ?? [];
  const stats = provider.stats;
  const sameProviderCart = cartProviderId === provider.id;
  const categorySlug = getCategoryForProvider(provider.category)?.slug ?? provider.category;
  const slots = getSlotsForDay(provider.id, selectedDay);

  const onShare = () => {
    track('share_provider', { providerId: provider.id });
    Share.share({
      message: `Check out ${provider.name} on Bookit — ${provider.rating.toFixed(1)} stars, ${tr('money.from')} ${money(provider.priceFrom)}.`,
    }).catch(() => {});
  };

  const onToggleFavourite = () => {
    haptics.light();
    toggleFavourite(provider.id);
  };

  const onToggleCompare = () => {
    haptics.light();
    const ok = toggleCompare(provider.id);
    if (!ok) {
      showToast(`You can compare up to ${COMPARE_LIMIT} providers`);
      return;
    }
    showToast(inCompare ? 'Removed from compare' : 'Added to compare');
  };

  const similar = getProvidersByCategory(provider.category)
    .filter((p) => p.id !== provider.id)
    .slice(0, 6);

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const bookNow = () => {
    haptics.medium();
    if (cartCount > 0 && sameProviderCart) {
      router.push(route('/cart'));
      return;
    }
    const seed =
      provider.services.find((s) => s.popular) ??
      [...provider.services].sort((a, b) => a.price - b.price)[0];
    addItem({
      key: seed.id ?? seed.name,
      providerId: provider.id,
      providerName: provider.name,
      name: seed.name,
      price: seed.price,
      durationMin: seed.durationMin,
    });
    showToast(`${seed.name} added to cart`);
    router.push(route('/cart'));
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Collapsing blurred header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top, height: insets.top + 52 },
          headerStyle,
        ]}
        pointerEvents="none"
      >
        <BlurView intensity={40} tint={scheme} style={StyleSheet.absoluteFill} />
        <View style={[styles.stickyInner, { borderBottomColor: t.border }]}>
          <Text variant="headline" numberOfLines={1}>
            {provider.name}
          </Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gallery hero */}
        <View style={[styles.galleryWrap, { backgroundColor: t.bgSubtle }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onGalleryScroll}
          >
            {gallery.map((uri, i) => (
              <Image
                key={`${uri}-${i}`}
                source={{ uri }}
                style={{ width, height: HERO_H }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ))}
          </ScrollView>

          <View style={[styles.heroTop, { top: insets.top + spacing.sm }]}>
            <IconButton
              name="chevron-left"
              accessibilityLabel="Go back"
              variant="surface"
              onPress={() => router.back()}
            />
            <View style={styles.heroActions}>
              <IconButton
                name="compare"
                accessibilityLabel={inCompare ? 'Remove from compare' : 'Add to compare'}
                variant="surface"
                color={inCompare ? t.accent : t.text}
                onPress={onToggleCompare}
              />
              <IconButton
                name="share"
                accessibilityLabel={`Share ${provider.name}`}
                variant="surface"
                onPress={onShare}
              />
              <IconButton
                name="heart"
                accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                variant="surface"
                color={isFavourite ? t.danger : t.text}
                onPress={onToggleFavourite}
              />
            </View>
          </View>

          {gallery.length > 1 ? (
            <View style={styles.dots}>
              {gallery.map((g, i) => (
                <View
                  key={g}
                  style={[
                    styles.dot,
                    { backgroundColor: t.onPrimary, opacity: i === galleryIndex ? 1 : 0.5 },
                    i === galleryIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        {/* Identity + stats + badges */}
        <View style={styles.body}>
          <Text variant="title1">{provider.name}</Text>
          <Text variant="footnote" tone="muted">
            {CATEGORY_LABEL[provider.category]}
            {provider.area ? ` · ${provider.area}` : ''}
          </Text>

          <Card variant="outlined" padding={spacing.md} style={styles.statsCard}>
            <Stat
              value={provider.rating.toFixed(1)}
              label={`${provider.reviewCount} reviews`}
              icon="star"
              tint={t.warning}
            />
            {stats ? (
              <>
                <View style={[styles.vLine, { backgroundColor: t.border }]} />
                <Stat value={`${stats.jobsDone}`} label="jobs" icon="check-all" tint={t.accent} />
                <View style={[styles.vLine, { backgroundColor: t.border }]} />
                <Stat
                  value={`${stats.yearsExperience}y`}
                  label="experience"
                  icon="briefcase"
                  tint={t.accent}
                />
                <View style={[styles.vLine, { backgroundColor: t.border }]} />
                <Stat
                  value={stats.responseTime.replace('within ', '')}
                  label="responds"
                  icon="clock"
                  tint={t.accent}
                />
              </>
            ) : null}
          </Card>

          {badges.length > 0 ? (
            <View style={styles.badges}>
              {badges.map((b) => (
                <View key={b} style={[styles.badgeChip, { backgroundColor: t.accentSoft }]}>
                  <Icon name={BADGE_META[b].icon} size={16} color={t.accent} />
                  <Text variant="caption" tone="accent">
                    {BADGE_META[b].label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.tabs}>
            <SegmentedControl options={TABS} value={tab} onChange={setTab} />
          </View>

          {tab === 0 ? (
            <ServicesTab
              provider={provider}
              categorySlug={categorySlug}
              sameProviderCart={sameProviderCart}
              cartCount={cartCount}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              slots={slots}
            />
          ) : null}

          {tab === 1 ? (
            <ReviewsTab
              providerReviews={providerReviews}
              filteredReviews={filteredReviews}
              reviewFilter={reviewFilter}
              setReviewFilter={setReviewFilter}
            />
          ) : null}

          {tab === 2 ? (
            <AboutTab
              provider={provider}
              faqOpen={faqOpen}
              setFaqOpen={setFaqOpen}
              onPolicy={() => router.push(route('/policies'))}
            />
          ) : null}

          {tab === 3 ? (
            <WorkTab
              gallery={gallery}
              similar={similar}
              money={money}
              tr={tr}
              onOpen={(pid) => router.push(`/provider/${pid}`)}
            />
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Floating basket bar once a service is added; otherwise the book bar. */}
      {cartCount > 0 && sameProviderCart ? (
        <BookingBar offset={spacing.sm} />
      ) : (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: t.surface,
              borderTopColor: t.border,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          <View>
            <Text variant="caption" tone="muted">
              from
            </Text>
            <Text variant="title2" tabular>
              {money(fromPrice)}
            </Text>
          </View>
          <Button label="Book now" icon="calendar" style={styles.bookBtn} onPress={bookNow} />
        </View>
      )}
    </View>
  );
}

function Stat({
  value,
  label,
  icon,
  tint,
}: {
  value: string;
  label: string;
  icon: IconName;
  tint: string;
}) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={16} color={tint} />
      <Text variant="headline">{value}</Text>
      <Text variant="micro" tone="muted" center>
        {label}
      </Text>
    </View>
  );
}

function ServicesTab({
  provider,
  categorySlug,
  sameProviderCart,
  cartCount,
  selectedDay,
  setSelectedDay,
  slots,
}: {
  provider: Provider;
  categorySlug: string;
  sameProviderCart: boolean;
  cartCount: number;
  selectedDay: number;
  setSelectedDay: (d: number) => void;
  slots: { time: string; available: boolean }[];
}) {
  const t = useTokens();
  const { width } = useWindowDimensions();
  const cardW = (width - spacing.lg * 2 - spacing.md) / 2;
  return (
    <View style={styles.section}>
      {!sameProviderCart && cartCount > 0 ? (
        <View style={[styles.notice, { backgroundColor: t.bgSubtle }]}>
          <Icon name="info" size={16} color={t.info} />
          <Text variant="caption" tone="muted" style={styles.flex1}>
            Adding a service here will start a new cart.
          </Text>
        </View>
      ) : null}

      <View style={styles.serviceGrid}>
        {provider.services.map((s) => (
          <ServiceCard
            key={s.id ?? s.name}
            width={cardW}
            categorySlug={categorySlug}
            title={s.name}
            durationMin={s.durationMin}
            price={s.price}
            tag={s.popular ? 'POPULAR' : undefined}
            rating={provider.rating}
            ratingCount={provider.reviewCount}
            cartKey={s.id ?? s.name}
            providerId={provider.id}
            providerName={provider.name}
          />
        ))}
      </View>

      <Text variant="headline" style={styles.subhead}>
        Availability
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayRow}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((d) => {
          const label = dayLabel(d);
          const active = selectedDay === d;
          return (
            <PressableScale
              key={d}
              haptic="selection"
              onPress={() => setSelectedDay(d)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label.full}
              style={[
                styles.dayChip,
                {
                  borderColor: active ? t.primary : t.border,
                  backgroundColor: active ? t.accentSoft : t.surface,
                },
              ]}
            >
              <Text variant="micro" tone={active ? 'accent' : 'muted'}>
                {label.weekday}
              </Text>
              <Text variant="headline" tone={active ? 'accent' : 'default'} tabular>
                {label.day}
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
      <View style={styles.slotGrid}>
        {slots.map((slot) => (
          <View
            key={slot.time}
            style={[
              styles.slot,
              { borderColor: t.border, backgroundColor: slot.available ? t.surface : t.bgSubtle },
            ]}
            accessibilityLabel={`${slot.time} ${slot.available ? 'available' : 'unavailable'}`}
          >
            <Text
              variant="footnote"
              tone={slot.available ? 'default' : 'subtle'}
              tabular
              style={!slot.available && styles.strike}
            >
              {slot.time}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ReviewsTab({
  providerReviews,
  filteredReviews,
  reviewFilter,
  setReviewFilter,
}: {
  providerReviews: Review[];
  filteredReviews: Review[];
  reviewFilter: ReviewFilter;
  setReviewFilter: (f: ReviewFilter) => void;
}) {
  const t = useTokens();
  const filters: { key: ReviewFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'five', label: '5 star' },
    { key: 'photos', label: 'With photos' },
  ];
  return (
    <View style={styles.section}>
      <View style={styles.reviewFilters}>
        {filters.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            selected={reviewFilter === f.key}
            onPress={() => setReviewFilter(f.key)}
          />
        ))}
      </View>
      {filteredReviews.length === 0 ? (
        <Text variant="footnote" tone="muted">
          No reviews in this filter yet.
        </Text>
      ) : (
        filteredReviews.map((r) => (
          <Card key={r.id} variant="outlined" style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <Text variant="headline">{r.author}</Text>
              <Text variant="caption" tone="muted">
                {r.date}
              </Text>
            </View>
            <Rating value={r.rating} size={16} />
            <Text variant="footnote" tone="muted">
              {r.text}
            </Text>
            {r.photo ? (
              <Image
                source={{ uri: r.photo }}
                style={[styles.reviewPhoto, { backgroundColor: t.bgSubtle }]}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ) : null}
          </Card>
        ))
      )}
      <Text variant="caption" tone="muted" center style={styles.subhead}>
        {providerReviews.length} reviews total
      </Text>
    </View>
  );
}

function AboutTab({
  provider,
  faqOpen,
  setFaqOpen,
  onPolicy,
}: {
  provider: Provider;
  faqOpen: number | null;
  setFaqOpen: (n: number | null) => void;
  onPolicy: () => void;
}) {
  const t = useTokens();
  return (
    <View style={styles.section}>
      <Text variant="body" tone="muted">
        {provider.bio}
      </Text>

      <Text variant="headline" style={styles.subhead}>
        Cancellation policy
      </Text>
      <PressableScale
        onPress={onPolicy}
        accessibilityRole="button"
        accessibilityLabel="Read the full cancellation policy"
        style={[styles.policyCard, { borderColor: t.border, backgroundColor: t.surface }]}
      >
        <Icon name="shield-check" size={20} color={t.accent} />
        <Text variant="footnote" tone="muted" style={styles.flex1}>
          Free cancellation up to 24 hours before your appointment. Read the full policy.
        </Text>
        <Icon name="chevron-right" size={16} color={t.textMuted} />
      </PressableScale>

      <Text variant="headline" style={styles.subhead}>
        FAQ
      </Text>
      {FAQS.map((f, i) => {
        const open = faqOpen === i;
        return (
          <View key={f.question} style={[styles.faq, { borderColor: t.border }]}>
            <PressableScale
              onPress={() => setFaqOpen(open ? null : i)}
              accessibilityRole="button"
              accessibilityLabel={f.question}
              accessibilityState={{ expanded: open }}
              style={styles.faqHead}
            >
              <Text variant="footnote" style={styles.flex1}>
                {f.question}
              </Text>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={20} color={t.textMuted} />
            </PressableScale>
            {open ? (
              <Text variant="footnote" tone="muted" style={styles.faqBody}>
                {f.answer}
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function WorkTab({
  gallery,
  similar,
  money,
  tr,
  onOpen,
}: {
  gallery: string[];
  similar: Provider[];
  money: (n: number) => string;
  tr: (k: string) => string;
  onOpen: (id: string) => void;
}) {
  const t = useTokens();
  return (
    <View style={styles.section}>
      <View style={styles.workGrid}>
        {gallery.map((uri, i) => (
          <Image
            key={`w-${i}`}
            source={{ uri }}
            style={[styles.workPhoto, { backgroundColor: t.bgSubtle }]}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ))}
      </View>

      {similar.length > 0 ? (
        <>
          <Text variant="headline" style={styles.subhead}>
            Pros like this
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.simRow}
          >
            {similar.map((p) => (
              <PressableScale
                key={p.id}
                onPress={() => onOpen(p.id)}
                accessibilityRole="button"
                accessibilityLabel={`${p.name}, rated ${p.rating.toFixed(1)}`}
                style={styles.simCard}
              >
                <Image
                  source={{ uri: p.photo }}
                  style={[styles.simPhoto, { backgroundColor: t.bgSubtle }]}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <Text variant="footnote" numberOfLines={1}>
                  {p.name}
                </Text>
                <View style={styles.simMeta}>
                  <Icon name="star" size={16} color={t.warning} />
                  <Text variant="caption" tabular>
                    {p.rating.toFixed(1)}
                  </Text>
                  <Text variant="caption" tone="muted" tabular>
                    · {tr('money.from')} {money(p.priceFrom)}
                  </Text>
                </View>
              </PressableScale>
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function dayLabel(offset: number): { weekday: string; day: string; full: string } {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const weekday = offset === 0 ? 'Today' : WEEKDAYS[d.getDay()];
  return { weekday, day: `${d.getDate()}`, full: `${weekday} ${d.getDate()}` };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyHeader: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 10 },
  stickyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  galleryWrap: { height: HERO_H },
  heroTop: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 18 },
  body: { padding: spacing.lg, gap: spacing.xs },
  statsCard: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  vLine: { width: StyleSheet.hairlineWidth, height: 32 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  tabs: { marginTop: spacing.lg },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  subhead: { marginTop: spacing.md },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  flex1: { flex: 1 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  serviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  qty: { minWidth: 20, textAlign: 'center' },
  dayRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  dayChip: {
    width: 56,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 2,
  },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  slot: {
    minWidth: 72,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  strike: { textDecorationLine: 'line-through' },
  reviewFilters: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  reviewCard: { gap: spacing.xs },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewPhoto: { width: 120, height: 120, borderRadius: radius.md, marginTop: spacing.sm },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  faq: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: spacing.sm },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  faqBody: { marginTop: spacing.xs },
  workGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  workPhoto: { width: '48%', height: 120, borderRadius: radius.md },
  simRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  simCard: { width: 140, gap: 4 },
  simPhoto: { width: 140, height: 100, borderRadius: radius.md },
  simMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...shadow.floating,
  },
  bookBtn: { flex: 1 },
});
