import { useMemo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useColors, radius, shadow, spacing, typography, type Palette } from '../theme';
import { Avatar } from './Avatar';
import type { Provider } from '../mocks/types';
import { getAvailability } from '../mocks/availability';
import { useFavouritesStore } from '../stores/favouritesStore';

const CATEGORY_LABEL: Record<Provider['category'], string> = {
  cleaning: 'Cleaning',
  beauty: 'Barber & Beauty',
  tutoring: 'Tutoring',
};

export interface ProviderCardProps {
  provider: Provider;
  onPress?: () => void;
  /** Show the favourite heart toggle. Default: true. */
  showFavourite?: boolean;
}

/** List card: photo, name, verified tick, rating, availability, price + heart. */
export function ProviderCard({ provider, onPress, showFavourite = true }: ProviderCardProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const isFavourite = useFavouritesStore((s) => s.ids.includes(provider.id));
  const toggle = useFavouritesStore((s) => s.toggle);
  const availability = useMemo(() => getAvailability(provider.id), [provider.id]);

  const onHeart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggle(provider.id);
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${provider.name}, ${CATEGORY_LABEL[provider.category]}, rated ${provider.rating.toFixed(1)}, from £${provider.priceFrom}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar uri={provider.photo} size={64} rounded={radius.md} />
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {provider.name}
          </Text>
          {provider.verified ? (
            <Ionicons name="checkmark-circle" size={16} color={c.brand.tint} />
          ) : null}
        </View>
        <Text style={styles.category}>{CATEGORY_LABEL[provider.category]}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color={c.brand.star} />
          <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
          <Text style={styles.meta}>({provider.reviewCount})</Text>
          <Text style={styles.dot}>·</Text>
          <Ionicons name="location-outline" size={13} color={c.text.muted} />
          <Text style={styles.meta}>{provider.distanceKm} km</Text>
        </View>
        {availability.availableToday ? (
          <View style={styles.availRow}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Available today · {availability.nextSlot}</Text>
          </View>
        ) : (
          <Text style={styles.nextSlot}>Next free: {availability.nextSlot}</Text>
        )}
      </View>
      <View style={styles.rightCol}>
        {showFavourite ? (
          <Pressable
            onPress={onHeart}
            hitSlop={8}
            style={styles.heart}
            accessibilityRole="button"
            accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            accessibilityState={{ selected: isFavourite }}
          >
            <Ionicons
              name={isFavourite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavourite ? c.status.danger : c.text.muted}
            />
          </Pressable>
        ) : null}
        <View style={styles.priceCol}>
          <Text style={styles.priceLabel}>from</Text>
          <Text style={styles.price}>£{provider.priceFrom}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.background.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.md,
      ...shadow.card,
    },
    pressed: {
      opacity: 0.9,
      transform: [{ scale: 0.995 }],
    },
    body: {
      flex: 1,
      gap: 2,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    name: {
      flexShrink: 1,
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    category: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      marginTop: 2,
    },
    rating: {
      ...typography.scale.smallMedium,
      color: c.text.primary,
    },
    meta: {
      ...typography.scale.caption,
      color: c.text.secondary,
    },
    dot: {
      color: c.text.muted,
      marginHorizontal: 2,
    },
    availRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: 3,
    },
    availDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.status.success,
    },
    availText: {
      ...typography.scale.caption,
      color: c.status.success,
    },
    nextSlot: {
      ...typography.scale.caption,
      color: c.text.muted,
      marginTop: 3,
    },
    rightCol: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
    },
    heart: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    priceCol: {
      alignItems: 'flex-end',
    },
    priceLabel: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    price: {
      ...typography.scale.h2,
      color: c.brand.tint,
    },
  });
