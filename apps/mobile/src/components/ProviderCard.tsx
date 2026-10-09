import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, shadow, spacing, typography } from '../theme';
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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Avatar uri={provider.photo} size={64} rounded={radius.md} />
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {provider.name}
          </Text>
          {provider.verified ? (
            <Ionicons name="checkmark-circle" size={16} color={colors.brand.primary} />
          ) : null}
        </View>
        <Text style={styles.category}>{CATEGORY_LABEL[provider.category]}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color={colors.brand.star} />
          <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
          <Text style={styles.meta}>({provider.reviewCount})</Text>
          <Text style={styles.dot}>·</Text>
          <Ionicons name="location-outline" size={13} color={colors.text.muted} />
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

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
  },
  category: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  rating: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
  },
  meta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  dot: {
    color: colors.text.muted,
    marginHorizontal: 2,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.brand.primary,
  },
});
