import { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, Text, Icon, PressableScale, IconButton } from '../src/components/ui';
import { providers as allProviders, categories } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { track } from '../src/lib/analytics';
import { route } from '../src/lib/nav';
import { useSearchStore } from '../src/stores/searchStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';
import { useMoney } from '../src/i18n';

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
  const money = useMoney();
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
        <IconButton
          name="chevron-left"
          size={24}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={c.text.muted} />
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
            <PressableScale
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Icon name="close-circle" size={20} color={c.text.muted} />
            </PressableScale>
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
                <Text variant="footnote" tone="muted">
                  Recent searches
                </Text>
                <PressableScale
                  onPress={clearRecent}
                  accessibilityRole="button"
                  accessibilityLabel="Clear recent searches"
                >
                  <Text variant="footnote" tone="accent">
                    Clear
                  </Text>
                </PressableScale>
              </View>
              {recent.map((term) => (
                <PressableScale
                  key={term}
                  style={styles.recentRow}
                  onPress={() => submit(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search ${term}`}
                >
                  <Icon name="clock" size={20} color={c.text.muted} />
                  <Text variant="body" style={styles.flex1}>
                    {term}
                  </Text>
                  <PressableScale
                    onPress={() => removeRecent(term)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${term}`}
                  >
                    <Icon name="close" size={16} color={c.text.muted} />
                  </PressableScale>
                </PressableScale>
              ))}
            </View>
          ) : null}

          <View style={styles.block}>
            <Text variant="footnote" tone="muted">
              Trending services
            </Text>
            <View style={styles.trendingWrap}>
              {TRENDING.map((term) => (
                <PressableScale
                  key={term}
                  style={styles.trendingChip}
                  onPress={() => submit(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`Search ${term}`}
                >
                  <Icon name="trending-up" size={16} color={c.brand.tint} />
                  <Text variant="caption">{term}</Text>
                </PressableScale>
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <Text variant="footnote" tone="muted">
              Browse categories
            </Text>
            {categories
              .filter((cat) => cat.live)
              .map((cat) => (
                <PressableScale
                  key={cat.slug}
                  style={styles.catRow}
                  onPress={() => router.push(route(`/category/${cat.slug}`))}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                >
                  <View style={styles.catIcon}>
                    <Icon name={cat.icon} size={20} color={c.brand.tint} />
                  </View>
                  <Text variant="body" style={styles.flex1}>
                    {cat.label}
                  </Text>
                  <Icon name="chevron-right" size={20} color={c.text.muted} />
                </PressableScale>
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
                  <PressableScale
                    key={`${s.type}-${s.label}`}
                    style={styles.suggestionRow}
                    onPress={() => (s.slug ? openCategory(s.slug, s.label) : submit(s.label))}
                    accessibilityRole="button"
                    accessibilityLabel={s.label}
                  >
                    <Icon name="search" size={16} color={c.text.muted} />
                    <Text variant="body" style={styles.flex1}>
                      {s.label}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {s.type === 'category' ? 'Category' : 'Service'}
                    </Text>
                  </PressableScale>
                ))}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              art="search"
              title="No matches"
              message={`We couldn't find anything for “${query.trim()}”. Try another term.`}
            />
          }
          renderItem={({ item }: { item: Provider }) => (
            <PressableScale
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
                <Text variant="headline" numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.providerMeta}>
                  <Icon name="star" size={16} color={c.brand.star} />
                  <Text variant="caption">{item.rating.toFixed(1)}</Text>
                  <Text variant="caption" tone="muted">
                    ·
                  </Text>
                  <Text variant="caption" tone="muted">
                    {item.area ?? `${item.distanceKm} km`}
                  </Text>
                </View>
              </View>
              <Text variant="footnote" tone="accent">
                from {money(item.priceFrom)}
              </Text>
            </PressableScale>
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
    back: { width: 44, height: 44 },
    flex1: { flex: 1 },
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
    recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
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
    catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52 },
    catIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    results: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
    suggestions: { marginBottom: spacing.md },
    suggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 44,
    },
    providerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    providerPhoto: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.skeleton },
    providerInfo: { flex: 1, gap: 2 },
    providerMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  });
