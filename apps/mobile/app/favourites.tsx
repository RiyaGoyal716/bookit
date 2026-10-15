import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Text,
  IconButton,
  Card,
  Avatar,
  Rating,
  PressableScale,
  EmptyState,
} from '../src/components/ui';
import { getProviderById } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { useMoney } from '../src/i18n';
import { useFavouritesStore } from '../src/stores/favouritesStore';
import { useColors, spacing, type Palette } from '../src/theme';

function FavouriteCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const money = useMoney();
  return (
    <Card variant="outlined" padding={spacing.md}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={provider.name}
        style={styles.cardRow}
      >
        <Avatar uri={provider.photo} name={provider.name} size={56} />
        <View style={styles.cardBody}>
          <Text variant="headline" numberOfLines={1}>
            {provider.name}
          </Text>
          <Text variant="footnote" tone="muted" numberOfLines={1}>
            {provider.tagline ?? provider.category} · {provider.area ?? `${provider.distanceKm} km`}
          </Text>
          <View style={styles.metaRow}>
            <Rating value={provider.rating} count={provider.reviewCount} />
            <Text variant="footnote" tone="muted">
              ·
            </Text>
            <Text variant="footnote" tabular style={styles.price}>
              {money(provider.priceFrom)}+
            </Text>
          </View>
        </View>
      </PressableScale>
    </Card>
  );
}

export default function FavouritesScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const favouriteIds = useFavouritesStore((s) => s.ids);

  const favourites = useMemo(
    () => favouriteIds.map((id) => getProviderById(id)).filter((p): p is Provider => Boolean(p)),
    [favouriteIds],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.header}>
        <IconButton
          name="chevron-left"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          variant="subtle"
          size={24}
        />
        <Text variant="title2">Favourites</Text>
        <View style={styles.back} />
      </View>

      <FlashList
        data={favourites}
        keyExtractor={(p: Provider) => p.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            art="empty"
            title="No favourites yet"
            message="Tap the heart on any provider to save them here for quick access."
            actionLabel="Explore providers"
            onAction={() => router.replace('/(tabs)')}
          />
        }
        renderItem={({ item }: { item: Provider }) => (
          <FavouriteCard provider={item} onPress={() => router.push(`/provider/${item.id}`)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardBody: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  price: { fontWeight: '600' },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 44, height: 44 },
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
    separator: { height: spacing.md },
  });
