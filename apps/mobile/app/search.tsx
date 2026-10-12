import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../src/components';
import { providers as allProviders, categories } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { track } from '../src/lib/analytics';
import { route } from '../src/lib/nav';
import { useSearchStore } from '../src/stores/searchStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

const TRENDING = [
  'Deep clean',
  'Skin fade',
  'GCSE maths',
  'Gel manicure',
  'End of tenancy',
  'Piano lessons',
];

interface Suggestion {
  label: string;
  type: 'service' | 'category';
  slug?: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const inputRef = useRef<TextInput>(null);

  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const removeRecent = useSearchStore((s) => s.removeRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const providerResults = useMemo<Provider[]>(() => {
    if (q.length < 1) return [];
    return allProviders
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.area?.toLowerCase().includes(q) ||
          p.services.some((s) => s.name.toLowerCase().includes(q)),
      )
      .slice(0, 12);
  }, [q]);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (q.length < 1) return [];
    const out: Suggestion[] = [];
    categories.forEach((cat) => {
      if (cat.label.toLowerCase().includes(q) && cat.live) {
        out.push({ label: cat.label, type: 'category', slug: cat.slug });
      }
      cat.subServices.forEach((s) => {
        if (s.name.toLowerCase().includes(q)) {
          out.push({ label: s.name, type: 'service', slug: cat.slug });
        }
      });
    });
    return out.slice(0, 6);
  }, [q]);

  const submit = (term: string) => {
    const t = term.trim();
    if (t.length >= 2) {
      addRecent(t);
      track('search', { query: t, results: providerResults.length });
    }
    setQuery(t);
  };

  const openProvider = (p: Provider) => {
    const t = query.trim();
    if (t.length >= 2) addRecent(t);
    track('view_provider', { providerId: p.id, from: 'search' });
    router.push(`/provider/${p.id}`);
  };

  const openCategory = (slug: string, term: string) => {
    if (term.length >= 2) addRecent(term);
    router.push(route(`/category/${slug}`));
  };

  const showDiscovery = q.length < 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.searchRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={c.text.muted} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={(e) => submit(e.nativeEvent.text)}
            placeholder="Search services or providers"
            placeholderTextColor={c.text.muted}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color={c.text.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {showDiscovery ? (
        <ScrollView
          contentContainerStyle={styles.discovery}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {recent.length > 0 ? (
            <View style={styles.block}>
              <View style={styles.blockHeader}>
                <Text style={styles.blockTitle}>Recent searches</Text>
                <Pressable
                  onPress={clearRecent}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear recent searches"
                >
                  <Text style={styles.clear}>Clear</Text>
                </Pressable>
              </View>
              {recent.map((term) => (
                <Pressable
                  key={term}
                  style={styles.recentRow}
                  onPress={() => submit(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search ${term}`}
                >
                  <Ionicons name="time-outline" size={18} color={c.text.muted} />
                  <Text style={styles.recentText}>{term}</Text>
                  <Pressable
                    onPress={() => removeRecent(term)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${term}`}
                  >
                    <Ionicons name="close" size={16} color={c.text.muted} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Trending services</Text>
            <View style={styles.trendingWrap}>
              {TRENDING.map((term) => (
                <Pressable
                  key={term}
                  style={styles.trendingChip}
                  onPress={() => submit(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search ${term}`}
                >
                  <Ionicons name="trending-up" size={14} color={c.brand.tint} />
                  <Text style={styles.trendingText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Browse categories</Text>
            {categories
              .filter((cat) => cat.live)
              .map((cat) => (
                <Pressable
                  key={cat.slug}
                  style={styles.catRow}
                  onPress={() => router.push(route(`/category/${cat.slug}`))}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                >
                  <View style={styles.catIcon}>
                    <Ionicons name={cat.icon} size={18} color={c.brand.tint} />
                  </View>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={c.text.muted} />
                </Pressable>
              ))}
          </View>
        </ScrollView>
      ) : (
        <FlashList
          data={providerResults}
          keyExtractor={(p: Provider) => p.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.results}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            suggestions.length > 0 ? (
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <Pressable
                    key={`${s.type}-${s.label}`}
                    style={styles.suggestionRow}
                    onPress={() => (s.slug ? openCategory(s.slug, s.label) : submit(s.label))}
                    accessibilityRole="button"
                    accessibilityLabel={s.label}
                  >
                    <Ionicons name="search" size={16} color={c.text.muted} />
                    <Text style={styles.suggestionText}>{s.label}</Text>
                    <Text style={styles.suggestionType}>
                      {s.type === 'category' ? 'Category' : 'Service'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No matches"
              message={`We couldn't find anything for “${query.trim()}”. Try another term.`}
            />
          }
          renderItem={({ item }: { item: Provider }) => (
            <Pressable
              style={styles.providerRow}
              onPress={() => openProvider(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, rated ${item.rating.toFixed(1)}`}
            >
              <Image
                source={{ uri: item.photo }}
                style={styles.providerPhoto}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={styles.providerInfo}>
                <Text style={styles.providerName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.providerMeta}>
                  <Ionicons name="star" size={12} color={c.brand.star} />
                  <Text style={styles.providerRating}>{item.rating.toFixed(1)}</Text>
                  <Text style={styles.providerDot}>·</Text>
                  <Text style={styles.providerArea}>{item.area ?? `${item.distanceKm} km`}</Text>
                </View>
              </View>
              <Text style={styles.providerPrice}>from £{item.priceFrom}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 32, height: 44, alignItems: 'center', justifyContent: 'center' },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      height: 48,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: c.background.muted,
      borderWidth: 1,
      borderColor: c.border,
    },
    input: { flex: 1, ...typography.scale.body, color: c.text.primary, padding: 0 },
    discovery: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
    block: { gap: spacing.sm },
    blockHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    blockTitle: { ...typography.scale.smallMedium, color: c.text.secondary },
    clear: { ...typography.scale.smallMedium, color: c.brand.tint },
    recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
    recentText: { flex: 1, ...typography.scale.body, color: c.text.primary },
    trendingWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    trendingChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    trendingText: { ...typography.scale.small, color: c.text.primary },
    catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52 },
    catIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catLabel: { flex: 1, ...typography.scale.body, color: c.text.primary },
    results: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    suggestions: { marginBottom: spacing.md },
    suggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 44,
    },
    suggestionText: { flex: 1, ...typography.scale.body, color: c.text.primary },
    suggestionType: { ...typography.scale.caption, color: c.text.muted },
    providerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    providerPhoto: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.skeleton },
    providerInfo: { flex: 1, gap: 2 },
    providerName: { ...typography.scale.bodyMedium, color: c.text.primary },
    providerMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    providerRating: { ...typography.scale.caption, color: c.text.primary },
    providerDot: { color: c.text.muted },
    providerArea: { ...typography.scale.caption, color: c.text.muted },
    providerPrice: { ...typography.scale.smallMedium, color: c.brand.tint },
  });
