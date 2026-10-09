import { useMemo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, shadow, spacing, typography, type Palette } from '../theme';
import { Avatar } from './Avatar';
import type { Provider } from '../mocks/types';

const CATEGORY_LABEL: Record<Provider['category'], string> = {
  cleaning: 'Cleaning',
  beauty: 'Barber & Beauty',
  tutoring: 'Tutoring',
};

export interface ProviderCardProps {
  provider: Provider;
  onPress?: () => void;
}

/** List card: photo, name, verified tick, rating, price and distance. */
export function ProviderCard({ provider, onPress }: ProviderCardProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

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
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.priceLabel}>from</Text>
        <Text style={styles.price}>£{provider.priceFrom}</Text>
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
