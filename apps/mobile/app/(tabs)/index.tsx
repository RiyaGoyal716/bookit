import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  BottomSheet,
  Chip,
  EmptyState,
  ProviderCard,
  Skeleton,
  SortFilterSheet,
  DEFAULT_SORT_FILTER,
  activeFilterCount,
  type SortFilterValue,
} from '../../src/components';
import { providers as allProviders } from '../../src/mocks';
import type { Provider, ProviderCategory } from '../../src/mocks/types';
import { getAvailability } from '../../src/mocks/availability';
import { track } from '../../src/lib/analytics';
import { route } from '../../src/lib/nav';
import { useAuthStore } from '../../src/stores/authStore';
import { useNotificationsStore } from '../../src/stores/notificationsStore';
import { useSearchStore } from '../../src/stores/searchStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

type Filter = 'all' | ProviderCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cleaning', label: 'Cleaning' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'tutoring', label: 'Tutoring' },
];

const AREAS = ['Leeds, UK', 'Headingley', 'Hyde Park', 'Chapel Allerton', 'Horsforth', 'Roundhay'];

function priceMatches(range: SortFilterValue['priceRange'], priceFrom: number): boolean {
  switch (range) {
    case 'low':
      return priceFrom <= 25;
    case 'mid':
      return priceFrom > 25 && priceFrom <= 50;
    case 'high':
      return priceFrom > 50;
    default:
      return true;
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const name = useAuthStore((s) => s.user?.name);
  const unread = useNotificationsStore((s) => s.items.filter((n) => !n.read).length);
  const recent = useSearchStore((s) => s.recent);
  const addRecent = useSearchStore((s) => s.addRecent);
  const removeRecent = useSearchStore((s) => s.removeRecent);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [sortFilter, setSortFilter] = useState<SortFilterValue>(DEFAULT_SORT_FILTER);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [location, setLocation] = useState('Leeds, UK');
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = allProviders.filter((p) => {
      const matchesCategory = filter === 'all' || p.category === filter;
      const matchesQuery =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.services.some((s) => s.name.toLowerCase().includes(q));
      const matchesPrice = priceMatches(sortFilter.priceRange, p.priceFrom);
      const matchesRating = !sortFilter.minRating4 || p.rating >= 4;
      const matchesAvail = !sortFilter.availableToday || getAvailability(p.id).availableToday;
      return matchesCategory && matchesQuery && matchesPrice && matchesRating && matchesAvail;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sortFilter.sort) {
        case 'price':
          return a.priceFrom - b.priceFrom;
        case 'distance':
          return a.distanceKm - b.distanceKm;
        default:
          return b.rating - a.rating;
      }
    });
    return sorted;
  }, [query, filter, sortFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const commitSearch = (term: string) => {
    const t = term.trim();
    if (t.length >= 2) {
      addRecent(t);
      track('search', { query: t, results: results.length });
    }
  };

  const openProvider = (provider: Provider) => {
    track('view_provider', { providerId: provider.id, from: 'home' });
    if (query.trim().length >= 2) addRecent(query.trim());
    router.push(`/provider/${provider.id}`);
  };

  const initial = name?.charAt(0)?.toUpperCase() ?? 'A';
  const filterCount = activeFilterCount(sortFilter);
  const showRecent = searchFocused && query.trim().length === 0 && recent.length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          style={styles.location}
          onPress={() => setLocationOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Change location, current ${location}`}
        >
          <Ionicons name="location" size={16} color={c.brand.tint} />
          <Text style={styles.locationText}>{location}</Text>
          <Ionicons name="chevron-down" size={14} color={c.text.muted} />
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.bell}
            onPress={() => router.push(route('/notifications'))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          >
            <Ionicons name="notifications-outline" size={22} color={c.text.primary} />
            {unread > 0 ? <View style={styles.unreadDot} /> : null}
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
      </View>

      <FlashList
        data={loading ? [] : results}
        keyExtractor={(item: Provider) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.greeting}>Hi {name ?? 'there'} 👋</Text>
            <Text style={styles.subtitle}>Find trusted local help in Leeds</Text>

            <View style={styles.searchRow}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={c.text.muted} />
                <TextInput
                  style={styles.searchInput}
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onSubmitEditing={(e) => commitSearch(e.nativeEvent.text)}
                  placeholder="Search cleaners, barbers, tutors…"
                  placeholderTextColor={c.text.muted}
                  returnKeyType="search"
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
              <Pressable
                style={styles.filterBtn}
                onPress={() => setSheetOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Sort and filter"
              >
                <Ionicons name="options-outline" size={20} color={c.text.primary} />
                {filterCount > 0 ? (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{filterCount}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>

            {showRecent ? (
              <View style={styles.recentBlock}>
                <Text style={styles.recentTitle}>Recent searches</Text>
                <View style={styles.recentChips}>
                  {recent.map((term) => (
                    <Pressable
                      key={term}
                      style={styles.recentChip}
                      onPress={() => setQuery(term)}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${term}`}
                    >
                      <Ionicons name="time-outline" size={14} color={c.text.muted} />
                      <Text style={styles.recentText}>{term}</Text>
                      <Pressable
                        onPress={() => removeRecent(term)}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${term}`}
                      >
                        <Ionicons name="close" size={14} color={c.text.muted} />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              keyboardShouldPersistTaps="handled"
            >
              {FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  active={filter === f.key}
                  onPress={() => setFilter(f.key)}
                />
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>
              {query.trim() ? `Results for “${query.trim()}”` : 'Top rated near you'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonList}>
              {[0, 1, 2, 3, 4].map((i) => (
                <ProviderSkeleton key={i} styles={styles} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No providers found"
              message="Try a different search or adjust your filters."
              actionLabel="Clear filters"
              onAction={() => {
                setQuery('');
                setFilter('all');
                setSortFilter(DEFAULT_SORT_FILTER);
              }}
            />
          )
        }
        renderItem={({ item }: { item: Provider }) => (
          <ProviderCard provider={item} onPress={() => openProvider(item)} />
        )}
      />

      <SortFilterSheet
        visible={sheetOpen}
        value={sortFilter}
        onClose={() => setSheetOpen(false)}
        onApply={(v) => {
          setSortFilter(v);
          setSheetOpen(false);
        }}
      />

      <BottomSheet
        visible={locationOpen}
        onClose={() => setLocationOpen(false)}
        title="Choose area"
      >
        {AREAS.map((area) => {
          const selected = area === location;
          return (
            <Pressable
              key={area}
              style={styles.areaRow}
              onPress={() => {
                setLocation(area);
                setLocationOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={area}
            >
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selected ? c.brand.tint : c.text.muted}
              />
              <Text style={styles.areaText}>{area}</Text>
            </Pressable>
          );
        })}
      </BottomSheet>
    </View>
  );
}

function ProviderSkeleton({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton width={64} height={64} rounded={radius.md} />
      <View style={styles.skeletonBody}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="55%" height={12} />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background.base,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      backgroundColor: c.background.base,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    location: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    locationText: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    bell: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadDot: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.status.danger,
      borderWidth: 2,
      borderColor: c.background.base,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typography.scale.bodyMedium,
      color: c.brand.tint,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    separator: { height: spacing.md },
    greeting: {
      ...typography.scale.h1,
      color: c.text.primary,
    },
    subtitle: {
      ...typography.scale.body,
      color: c.text.secondary,
      marginTop: 2,
      marginBottom: spacing.lg,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      height: 52,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: c.background.muted,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchInput: {
      flex: 1,
      ...typography.scale.body,
      color: c.text.primary,
      padding: 0,
    },
    filterBtn: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 3,
      borderRadius: 8,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: {
      ...typography.scale.caption,
      fontSize: 10,
      color: c.text.inverse,
    },
    recentBlock: {
      marginTop: spacing.md,
    },
    recentTitle: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
      marginBottom: spacing.sm,
    },
    recentChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    recentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.background.muted,
      borderWidth: 1,
      borderColor: c.border,
    },
    recentText: {
      ...typography.scale.small,
      color: c.text.primary,
    },
    chips: {
      gap: spacing.sm,
      paddingVertical: spacing.lg,
    },
    sectionTitle: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginBottom: spacing.md,
    },
    skeletonList: { gap: spacing.md },
    skeletonCard: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    skeletonBody: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.sm,
    },
    areaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: 48,
    },
    areaText: {
      ...typography.scale.body,
      color: c.text.primary,
    },
  });
