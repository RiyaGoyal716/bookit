import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Button, EmptyState, Screen } from '../../src/components';
import { getProviderById } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import { colors, radius, shadow, spacing, typography } from '../../src/theme';

const CATEGORY_LABEL: Record<Provider['category'], string> = {
  cleaning: 'Cleaning',
  beauty: 'Barber & Beauty',
  tutoring: 'Tutoring',
};

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const provider = getProviderById(id);

  if (!provider) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} style={styles.backPlain} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.text.primary} />
        </Pressable>
        <EmptyState
          icon="alert-circle-outline"
          title="Provider not found"
          message="This provider may no longer be available."
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
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
          <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
          </Pressable>
          {provider.verified ? (
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={14} color={colors.brand.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.category}>{CATEGORY_LABEL[provider.category]}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="star" size={15} color={colors.brand.star} />
            <Text style={styles.rating}>{provider.rating.toFixed(1)}</Text>
            <Text style={styles.meta}>({provider.reviewCount} reviews)</Text>
            <Text style={styles.dot}>·</Text>
            <Ionicons name="location-outline" size={15} color={colors.text.muted} />
            <Text style={styles.meta}>{provider.distanceKm} km away</Text>
          </View>

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
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Book now"
          icon="calendar"
          onPress={() => router.push(`/booking/${provider.id}`)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backPlain: { marginBottom: spacing.lg },
  scroll: { paddingBottom: spacing.xl },
  photoWrap: {
    height: 280,
    backgroundColor: colors.skeleton,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  back: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.background.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
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
    backgroundColor: colors.background.base,
    ...shadow.card,
  },
  verifiedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text.primary,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
  },
  category: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.muted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  rating: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  dot: {
    color: colors.text.muted,
    marginHorizontal: 2,
  },
  bio: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
    color: colors.text.secondary,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.lg,
    fontWeight: '800',
    color: colors.text.primary,
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
    borderColor: colors.border,
    backgroundColor: colors.background.base,
  },
  serviceInfo: {
    flex: 1,
    gap: 2,
  },
  serviceName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  serviceMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
  servicePrice: {
    fontSize: typography.fontSize.md,
    fontWeight: '800',
    color: colors.brand.primary,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.base,
  },
});
