import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Button, EmptyState, RatingStars, Screen } from '../../src/components';
import { getProviderById } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import { getAvailability } from '../../src/mocks/availability';
import { track } from '../../src/lib/analytics';
import { useFavouritesStore } from '../../src/stores/favouritesStore';
import { useReviewsStore, type Review } from '../../src/stores/reviewsStore';
import { useColors, radius, shadow, spacing, typography, type Palette } from '../../src/theme';

const CATEGORY_LABEL: Record<Provider['category'], string> = {
  cleaning: 'Cleaning',
  beauty: 'Barber & Beauty',
  tutoring: 'Tutoring',
};

export default function ProviderProfileScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { id } = useLocalSearchParams<{ id: string }>();
  const provider = getProviderById(id);
  const isFavourite = useFavouritesStore((s) => (id ? s.ids.includes(id) : false));
  const toggleFavourite = useFavouritesStore((s) => s.toggle);
  const reviews = useReviewsStore((s) => s.reviews);
  const providerReviews = useMemo(
    () => (id ? reviews.filter((r) => r.providerId === id) : []),
    [reviews, id],
  );
  const availability = useMemo(() => (id ? getAvailability(id) : null), [id]);

  useEffect(() => {
    if (provider) track('view_provider', { providerId: provider.id, from: 'profile' });
  }, [provider]);

  const onShare = () => {
    if (!provider) return;
    track('share_provider', { providerId: provider.id });
    Share.share({
      message: `Check out ${provider.name} on Bookit — ${provider.rating.toFixed(1)}★, from £${provider.priceFrom}.`,
    }).catch(() => {});
  };

  const onToggleFavourite = () => {
    if (!provider) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleFavourite(provider.id);
  };

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

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoWrap}>
          <Image
            source={{ uri: provider.photo }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
          />
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
          {provider.verified ? (
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={14} color={c.brand.tint} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.category}>{CATEGORY_LABEL[provider.category]}</Text>

          <View style={styles.metaRow}>
            <RatingStars value={provider.rating} size={15} />
            <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
            <Text style={styles.meta}>({provider.reviewCount} reviews)</Text>
            <Text style={styles.dot}>·</Text>
            <Ionicons name="location-outline" size={15} color={c.text.muted} />
            <Text style={styles.meta}>{provider.distanceKm} km away</Text>
          </View>

          {availability ? (
            <View
              style={[
                styles.availPill,
                {
                  backgroundColor: availability.availableToday
                    ? c.status.successSoft
                    : c.background.muted,
                },
              ]}
            >
              <Ionicons
                name={availability.availableToday ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={availability.availableToday ? c.status.success : c.text.muted}
              />
              <Text
                style={[
                  styles.availPillText,
                  { color: availability.availableToday ? c.status.success : c.text.secondary },
                ]}
              >
                {availability.availableToday
                  ? `Available today · ${availability.nextSlot}`
                  : `Next free: ${availability.nextSlot}`}
              </Text>
            </View>
          ) : null}

          <Text style={styles.bio}>{provider.bio}</Text>

          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.services}>
            {provider.services.map((s) => (
              <View key={s.name} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{s.name}</Text>
                  <Text style={styles.serviceMeta}>{s.durationMin} min</Text>
                </View>
                <Text style={styles.servicePrice}>£{s.price}</Text>
              </View>
            ))}
          </View>

          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.reviewCount}>{providerReviews.length} total</Text>
          </View>
          {providerReviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet — be the first after your booking.</Text>
          ) : (
            <View style={styles.reviews}>
              {providerReviews.map((r: Review) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <Text style={styles.reviewAuthor}>{r.author}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <RatingStars value={r.rating} size={13} />
                  <Text style={styles.reviewText}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>from</Text>
          <Text style={styles.priceValue}>£{fromPrice}</Text>
        </View>
        <Button
          label="Book now"
          icon="calendar"
          style={styles.bookBtn}
          onPress={() => router.push(`/booking/${provider.id}`)}
        />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    flex: { flex: 1 },
    backPlain: { marginBottom: spacing.lg, alignSelf: 'flex-start' },
    scroll: { paddingBottom: spacing.xl },
    photoWrap: {
      height: 300,
      backgroundColor: c.skeleton,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
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
    topActions: {
      position: 'absolute',
      right: spacing.lg,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    roundBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },
    availPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    availPillText: {
      ...typography.scale.caption,
      fontFamily: typography.font.semibold,
      fontWeight: '600',
    },
    reviewsHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    reviewCount: {
      ...typography.scale.small,
      color: c.text.muted,
    },
    noReviews: {
      ...typography.scale.small,
      color: c.text.muted,
    },
    reviews: {
      gap: spacing.sm,
    },
    reviewCard: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.xs,
    },
    reviewTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reviewAuthor: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    reviewDate: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    reviewText: {
      ...typography.scale.small,
      color: c.text.secondary,
      marginTop: 2,
    },
    verifiedPill: {
      position: 'absolute',
      bottom: spacing.md,
      left: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      ...shadow.card,
    },
    verifiedText: {
      ...typography.scale.caption,
      fontFamily: typography.font.bold,
      fontWeight: '700',
      color: c.text.primary,
    },
    body: {
      padding: spacing.lg,
      gap: spacing.xs,
    },
    name: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    category: {
      ...typography.scale.smallMedium,
      color: c.text.muted,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.sm,
    },
    rating: {
      ...typography.scale.smallMedium,
      color: c.text.primary,
      marginLeft: spacing.xs,
    },
    meta: {
      ...typography.scale.small,
      color: c.text.secondary,
    },
    dot: {
      color: c.text.muted,
      marginHorizontal: 2,
    },
    bio: {
      marginTop: spacing.md,
      ...typography.scale.body,
      color: c.text.secondary,
    },
    sectionTitle: {
      marginTop: spacing.xl,
      marginBottom: spacing.sm,
      ...typography.scale.h2,
      color: c.text.primary,
    },
    services: {
      gap: spacing.sm,
    },
    serviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    serviceInfo: {
      flex: 1,
      gap: 2,
    },
    serviceName: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    serviceMeta: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    servicePrice: {
      ...typography.scale.bodyMedium,
      color: c.brand.tint,
    },
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
    priceBlock: {
      justifyContent: 'center',
    },
    priceLabel: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    priceValue: {
      ...typography.scale.h2,
      color: c.text.primary,
    },
    bookBtn: {
      flex: 1,
    },
  });
