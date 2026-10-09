import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button, EmptyState, RatingStars, Screen } from '../../src/components';
import { getProviderById } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
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
