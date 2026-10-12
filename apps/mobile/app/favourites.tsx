import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState, ProviderCard } from '../src/components';
import { getProviderById } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { useFavouritesStore } from '../src/stores/favouritesStore';
import { useColors, spacing, typography, type Palette } from '../src/theme';

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
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Favourites</Text>
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
            icon="heart-outline"
            title="No favourites yet"
            message="Tap the heart on any provider to save them here for quick access."
            actionLabel="Explore providers"
            onAction={() => router.replace('/(tabs)')}
          />
        }
        renderItem={({ item }: { item: Provider }) => (
          <ProviderCard provider={item} onPress={() => router.push(`/provider/${item.id}`)} />
        )}
      />
    </View>
  );
}

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
    back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.scale.h2, color: c.text.primary },
    content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl },
    separator: { height: spacing.md },
  });
