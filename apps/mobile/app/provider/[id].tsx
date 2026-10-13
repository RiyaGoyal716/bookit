import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import {
  Accordion,
  Button,
  EmptyState,
  ImageGalleryViewer,
  RatingStars,
  Screen,
} from '../../src/components';
import { getProviderById, getProvidersByCategory } from '../../src/mocks';
import type { Provider, ProviderBadge, Service } from '../../src/mocks/types';
import { getSlotsForDay } from '../../src/mocks/availability';
import { track } from '../../src/lib/analytics';
import { route } from '../../src/lib/nav';
import { useCompareStore, COMPARE_LIMIT } from '../../src/stores/compareStore';
import { useFavouritesStore } from '../../src/stores/favouritesStore';
import { useReviewsStore, type Review } from '../../src/stores/reviewsStore';
import { useCartStore } from '../../src/stores/cartStore';
import { showToast } from '../../src/stores/toastStore';
import { useT, useMoney } from '../../src/i18n';
import { useColors, radius, shadow, spacing, typography, type Palette } from '../../src/theme';

const CATEGORY_LABEL: Record<Provider['category'], string> = {
  cleaning: 'Cleaning',
  beauty: 'Barber & Beauty',
  tutoring: 'Tutoring',
};

const BADGE_META: Record<ProviderBadge, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  'verified-id': { label: 'Verified ID', icon: 'person-circle' },
  'background-checked': { label: 'Background checked', icon: 'shield-checkmark' },
  'top-rated': { label: 'Top rated', icon: 'ribbon' },
  insured: { label: 'Insured', icon: 'umbrella' },
  'fast-responder': { label: 'Fast responder', icon: 'flash' },
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

export default function ProviderProfileScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const provider = getProviderById(id);

  const isFavourite = useFavouritesStore((s) => (id ? s.ids.includes(id) : false));
  const toggleFavourite = useFavouritesStore((s) => s.toggle);
  const inCompare = useCompareStore((s) => (id ? s.ids.includes(id) : false));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const reviews = useReviewsStore((s) => s.reviews);
  const addItem = useCartStore((s) => s.addItem);
  const decrement = useCartStore((s) => s.decrement);
  const cartItems = useCartStore((s) => s.items);
  const cartProviderId = useCartStore((s) => s.providerId);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const cartTotal = useCartStore((s) => s.breakdown().total);

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStart, setViewerStart] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [selectedDay, setSelectedDay] = useState(0);

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
        <Pressable
          onPress={() => router.back()}
          style={styles.backPlain}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <EmptyState
          icon="alert-circle-outline"
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
  const slots = getSlotsForDay(provider.id, selectedDay);

  const onShare = () => {
    track('share_provider', { providerId: provider.id });
    Share.share({
      message: `Check out ${provider.name} on Bookit — ${provider.rating.toFixed(1)}★, ${t('money.from')} ${money(provider.priceFrom)}.`,
    }).catch(() => {});
  };

  const onToggleFavourite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleFavourite(provider.id);
  };

  const onToggleCompare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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

  const qtyFor = (service: Service): number => {
    if (!sameProviderCart) return 0;
    return cartItems.find((i) => i.key === (service.id ?? service.name))?.quantity ?? 0;
  };

  const addService = (service: Service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addItem({
      key: service.id ?? service.name,
      providerId: provider.id,
      providerName: provider.name,
      name: service.name,
      price: service.price,
      durationMin: service.durationMin,
    });
  };

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const openViewer = (index: number) => {
    setViewerStart(index);
    setViewerOpen(true);
  };

  const bookNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (cartCount > 0 && sameProviderCart) {
      router.push(route('/cart'));
      return;
    }
    // Seed the cart with the most popular (or cheapest) service, then open it.
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
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      >
        {/* Gallery */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onGalleryScroll}
          >
            {gallery.map((uri, i) => (
              <Pressable
                key={`${uri}-${i}`}
                onPress={() => openViewer(i)}
                accessibilityLabel={`Photo ${i + 1}`}
              >
                <Image
                  source={{ uri }}
                  style={{ width, height: 300 }}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            style={[styles.back, { top: insets.top + spacing.sm }]}
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color={c.text.primary} />
          </Pressable>
          <View style={[styles.topActions, { top: insets.top + spacing.sm }]}>
            <Pressable
              style={styles.roundBtn}
              onPress={onToggleCompare}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={inCompare ? 'Remove from compare' : 'Add to compare'}
              accessibilityState={{ selected: inCompare }}
            >
              <Ionicons
                name="git-compare"
                size={22}
                color={inCompare ? c.brand.tint : c.text.primary}
              />
            </Pressable>
            <Pressable
              style={styles.roundBtn}
              onPress={onShare}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Share ${provider.name}`}
            >
              <Ionicons name="share-outline" size={22} color={c.text.primary} />
            </Pressable>
            <Pressable
              style={styles.roundBtn}
              onPress={onToggleFavourite}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              accessibilityState={{ selected: isFavourite }}
            >
              <Ionicons
                name={isFavourite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavourite ? c.status.danger : c.text.primary}
              />
            </Pressable>
          </View>
          {gallery.length > 1 ? (
            <View style={styles.galleryDots}>
              {gallery.map((g, i) => (
                <View
                  key={g}
                  style={[styles.galleryDot, i === galleryIndex && styles.galleryDotActive]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.category}>
            {CATEGORY_LABEL[provider.category]}
            {provider.area ? ` · ${provider.area}` : ''}
          </Text>
          {provider.tagline ? <Text style={styles.tagline}>{provider.tagline}</Text> : null}

          {/* Stats row */}
          <View style={styles.statsRow}>
            <Stat
              value={provider.rating.toFixed(1)}
              label={`${provider.reviewCount} reviews`}
              icon="star"
              styles={styles}
              c={c}
            />
            {stats ? (
              <>
                <View style={styles.statDivider} />
                <Stat
                  value={`${stats.jobsDone}`}
                  label="jobs done"
                  icon="checkmark-done"
                  styles={styles}
                  c={c}
                />
                <View style={styles.statDivider} />
                <Stat
                  value={`${stats.yearsExperience}y`}
                  label="experience"
                  icon="briefcase"
                  styles={styles}
                  c={c}
                />
                <View style={styles.statDivider} />
                <Stat
                  value={stats.responseTime.replace('within ', '')}
                  label="responds"
                  icon="time"
                  styles={styles}
                  c={c}
                />
              </>
            ) : null}
          </View>

          {/* Badges */}
          {badges.length > 0 ? (
            <View style={styles.badges}>
              {badges.map((b) => (
                <View key={b} style={styles.badge}>
                  <Ionicons name={BADGE_META[b].icon} size={14} color={c.brand.tint} />
                  <Text style={styles.badgeText}>{BADGE_META[b].label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* About */}
          <SectionTitle title="About" styles={styles} />
          <Text style={styles.bio}>{provider.bio}</Text>

          {/* Services with add-to-cart */}
          <SectionTitle title="Services" styles={styles} />
          {!sameProviderCart && cartCount > 0 ? (
            <View style={styles.cartNotice}>
              <Ionicons name="information-circle-outline" size={16} color={c.status.info} />
              <Text style={styles.cartNoticeText}>
                Adding a service here will start a new cart.
              </Text>
            </View>
          ) : null}
          <View style={styles.services}>
            {provider.services.map((s) => {
              const qty = qtyFor(s);
              return (
                <View key={s.name} style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceNameRow}>
                      <Text style={styles.serviceName}>{s.name}</Text>
                      {s.popular ? (
                        <View style={styles.popularTag}>
                          <Text style={styles.popularText}>Popular</Text>
                        </View>
                      ) : null}
                    </View>
                    {s.description ? <Text style={styles.serviceDesc}>{s.description}</Text> : null}
                    <Text style={styles.serviceMeta}>
                      {s.durationMin} min · {money(s.price)}
                    </Text>
                  </View>
                  {qty > 0 ? (
                    <View style={styles.stepper}>
                      <Pressable
                        style={styles.stepBtn}
                        onPress={() => decrement(s.id ?? s.name)}
                        hitSlop={6}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove one ${s.name}`}
                      >
                        <Ionicons name="remove" size={18} color={c.brand.tint} />
                      </Pressable>
                      <Text style={styles.stepQty}>{qty}</Text>
                      <Pressable
                        style={styles.stepBtn}
                        onPress={() => addService(s)}
                        hitSlop={6}
                        accessibilityRole="button"
                        accessibilityLabel={`Add one ${s.name}`}
                      >
                        <Ionicons name="add" size={18} color={c.brand.tint} />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.addBtn}
                      onPress={() => addService(s)}
                      accessibilityRole="button"
                      accessibilityLabel={`Add ${s.name} to cart`}
                    >
                      <Ionicons name="add" size={16} color={c.brand.tint} />
                      <Text style={styles.addBtnText}>Add</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          {/* Photos of work */}
          <SectionTitle title="Photos of work" styles={styles} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosRow}
          >
            {gallery.map((uri, i) => (
              <Pressable
                key={`photo-${i}`}
                onPress={() => openViewer(i)}
                accessibilityRole="button"
                accessibilityLabel={`Open photo ${i + 1}`}
              >
                <Image
                  source={{ uri }}
                  style={styles.workPhoto}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <SectionTitle title="Reviews" styles={styles} noMargin />
            <Text style={styles.reviewTotal}>{providerReviews.length} total</Text>
          </View>
          <View style={styles.reviewFilters}>
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'five', label: '5★' },
                { key: 'photos', label: 'With photos' },
              ] as { key: ReviewFilter; label: string }[]
            ).map((f) => {
              const active = reviewFilter === f.key;
              return (
                <Pressable
                  key={f.key}
                  style={[styles.reviewChip, active && styles.reviewChipActive]}
                  onPress={() => setReviewFilter(f.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Filter reviews: ${f.label}`}
                >
                  <Text style={[styles.reviewChipText, active && styles.reviewChipTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {filteredReviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews in this filter yet.</Text>
          ) : (
            <View style={styles.reviews}>
              {filteredReviews.map((r: Review) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <RatingStars value={r.rating} size={13} />
                  <Text style={styles.reviewText}>{r.text}</Text>
                  {r.photo ? (
                    <Pressable onPress={() => openViewer(0)} accessibilityLabel="Review photo">
                      <Image
                        source={{ uri: r.photo }}
                        style={styles.reviewPhoto}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {/* Availability */}
          <SectionTitle title="Availability" styles={styles} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayRow}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => {
              const active = selectedDay === d;
              const label = dayLabel(d);
              return (
                <Pressable
                  key={d}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                  onPress={() => setSelectedDay(d)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={label.full}
                >
                  <Text style={[styles.dayWeekday, active && styles.dayTextActive]}>
                    {label.weekday}
                  </Text>
                  <Text style={[styles.dayNum, active && styles.dayTextActive]}>{label.day}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.slotGrid}>
            {slots.map((slot) => (
              <View
                key={slot.time}
                style={[styles.slot, !slot.available && styles.slotOff]}
                accessibilityLabel={`${slot.time} ${slot.available ? 'available' : 'unavailable'}`}
              >
                <Text style={[styles.slotText, !slot.available && styles.slotTextOff]}>
                  {slot.time}
                </Text>
              </View>
            ))}
          </View>

          {/* Cancellation policy */}
          <SectionTitle title="Cancellation policy" styles={styles} />
          <Pressable
            style={styles.policyCard}
            onPress={() => router.push(route('/policies'))}
            accessibilityRole="button"
            accessibilityLabel="Read the full cancellation policy"
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={c.brand.tint} />
            <Text style={styles.policyText}>
              Free cancellation up to 24 hours before your appointment. Read the full policy.
            </Text>
            <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
          </Pressable>

          {/* FAQ */}
          <SectionTitle title="FAQ" styles={styles} />
          <Accordion items={FAQS} />

          {/* Pros like this */}
          {similar.length > 0 ? (
            <>
              <SectionTitle title="Pros like this" styles={styles} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosRow}
              >
                {similar.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.simCard}
                    onPress={() => router.push(`/provider/${p.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.name}, rated ${p.rating.toFixed(1)}`}
                  >
                    <Image
                      source={{ uri: p.photo }}
                      style={styles.simPhoto}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.simName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <View style={styles.simMeta}>
                      <Ionicons name="star" size={12} color={c.brand.star} />
                      <Text style={styles.simRating}>{p.rating.toFixed(1)}</Text>
                      <Text style={styles.simPrice}>
                        · {t('money.from')} {money(p.priceFrom)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.priceBlock}>
          {cartCount > 0 && sameProviderCart ? (
            <>
              <Text style={styles.priceLabel}>{cartCount} in cart</Text>
              <Text style={styles.priceValue}>{money(cartTotal)}</Text>
            </>
          ) : (
            <>
              <Text style={styles.priceLabel}>from</Text>
              <Text style={styles.priceValue}>{money(fromPrice)}</Text>
            </>
          )}
        </View>
        <Button
          label={cartCount > 0 && sameProviderCart ? 'View cart' : 'Book now'}
          icon={cartCount > 0 && sameProviderCart ? 'cart' : 'calendar'}
          style={styles.bookBtn}
          onPress={bookNow}
        />
      </View>

      <ImageGalleryViewer
        visible={viewerOpen}
        images={gallery}
        initialIndex={viewerStart}
        onClose={() => setViewerOpen(false)}
      />
    </View>
  );
}

function Stat({
  value,
  label,
  icon,
  styles,
  c,
}: {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={c.brand.tint} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({
  title,
  styles,
  noMargin,
}: {
  title: string;
  styles: ReturnType<typeof makeStyles>;
  noMargin?: boolean;
}) {
  return (
    <Text style={[styles.sectionTitle, noMargin && styles.sectionTitleNoMargin]}>{title}</Text>
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function dayLabel(offset: number): { weekday: string; day: string; full: string } {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const weekday = offset === 0 ? 'Today' : WEEKDAYS[d.getDay()];
  return { weekday, day: `${d.getDate()}`, full: `${weekday} ${d.getDate()}` };
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    scroll: { paddingBottom: spacing.xl },
    backPlain: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
    galleryWrap: { height: 300, backgroundColor: c.skeleton },
    back: {
      position: 'absolute',
      left: spacing.lg,
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },
    topActions: { position: 'absolute', right: spacing.lg, flexDirection: 'row', gap: spacing.sm },
    roundBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },
    galleryDots: {
      position: 'absolute',
      bottom: spacing.md,
      alignSelf: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    galleryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.6)',
    },
    galleryDotActive: { width: 18, backgroundColor: '#FFFFFF' },
    body: { padding: spacing.lg },
    name: { ...typography.scale.h1, color: c.text.primary },
    category: { ...typography.scale.smallMedium, color: c.text.muted, marginTop: 2 },
    tagline: { ...typography.scale.body, color: c.text.secondary, marginTop: spacing.xs },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    stat: { flex: 1, alignItems: 'center', gap: 2 },
    statDivider: { width: 1, height: 32, backgroundColor: c.border },
    statValue: { ...typography.scale.bodyMedium, color: c.text.primary },
    statLabel: {
      ...typography.scale.caption,
      fontSize: 10,
      color: c.text.muted,
      textAlign: 'center',
    },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
    },
    badgeText: {
      ...typography.scale.caption,
      color: c.brand.tint,
      fontFamily: typography.font.semibold,
      fontWeight: '600',
    },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    sectionTitleNoMargin: { marginTop: 0, marginBottom: 0 },
    bio: { ...typography.scale.body, color: c.text.secondary },
    cartNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: c.status.infoSoft,
      marginBottom: spacing.md,
    },
    cartNoticeText: { flex: 1, ...typography.scale.caption, color: c.status.info },
    services: { gap: spacing.sm },
    serviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    serviceInfo: { flex: 1, gap: 2 },
    serviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    serviceName: { ...typography.scale.bodyMedium, color: c.text.primary },
    serviceDesc: { ...typography.scale.caption, color: c.text.secondary },
    serviceMeta: { ...typography.scale.caption, color: c.text.muted },
    popularTag: {
      paddingVertical: 1,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.brand.accentSoft,
    },
    popularText: {
      ...typography.scale.caption,
      fontSize: 10,
      color: c.brand.accent,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.brand.primary,
      minHeight: 40,
    },
    addBtnText: { ...typography.scale.smallMedium, color: c.brand.tint },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    stepBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepQty: {
      minWidth: 20,
      textAlign: 'center',
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    photosRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    workPhoto: {
      width: 140,
      height: 100,
      borderRadius: radius.md,
      backgroundColor: c.skeleton,
    },
    simCard: { width: 140, gap: 4 },
    simPhoto: {
      width: 140,
      height: 100,
      borderRadius: radius.md,
      backgroundColor: c.skeleton,
    },
    simName: { ...typography.scale.smallMedium, color: c.text.primary },
    simMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    simRating: { ...typography.scale.caption, color: c.text.primary },
    simPrice: { ...typography.scale.caption, color: c.text.muted },
    reviewsHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
    },
    reviewTotal: { ...typography.scale.small, color: c.text.muted },
    reviewFilters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
    reviewChip: {
      minHeight: 36,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    reviewChipActive: { backgroundColor: c.brand.primary, borderColor: c.brand.primary },
    reviewChipText: { ...typography.scale.smallMedium, color: c.text.secondary },
    reviewChipTextActive: { color: c.text.inverse },
    noReviews: { ...typography.scale.small, color: c.text.muted },
    reviews: { gap: spacing.sm },
    reviewCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.xs,
    },
    reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    reviewAuthor: { ...typography.scale.bodyMedium, color: c.text.primary },
    reviewDate: { ...typography.scale.caption, color: c.text.muted },
    reviewText: { ...typography.scale.small, color: c.text.secondary, marginTop: 2 },
    reviewPhoto: {
      width: 120,
      height: 120,
      borderRadius: radius.md,
      marginTop: spacing.sm,
      backgroundColor: c.skeleton,
    },
    dayRow: { gap: spacing.sm, paddingVertical: spacing.xs },
    dayChip: {
      width: 56,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      gap: 2,
    },
    dayChipActive: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    dayWeekday: { ...typography.scale.caption, color: c.text.muted },
    dayNum: { ...typography.scale.bodyMedium, color: c.text.primary },
    dayTextActive: { color: c.brand.tint },
    slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    slot: {
      minWidth: 72,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
    },
    slotOff: { backgroundColor: c.background.muted, borderColor: c.background.muted },
    slotText: { ...typography.scale.smallMedium, color: c.text.primary },
    slotTextOff: { color: c.text.muted, textDecorationLine: 'line-through' },
    policyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    policyText: { flex: 1, ...typography.scale.small, color: c.text.secondary },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.surface,
    },
    priceBlock: { justifyContent: 'center' },
    priceLabel: { ...typography.scale.caption, color: c.text.muted },
    priceValue: { ...typography.scale.h2, color: c.text.primary },
    bookBtn: { flex: 1 },
  });
