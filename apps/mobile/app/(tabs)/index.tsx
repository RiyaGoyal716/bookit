import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { BottomSheet, Chip, EmptyState, ProviderCard, Skeleton } from '../../src/components';
import { providers as allProviders } from '../../src/mocks';
import type { Provider, ProviderCategory } from '../../src/mocks/types';
import { useAuthStore } from '../../src/stores/authStore';
import { useColors, radius, spacing, typography, type Palette } from '../../src/theme';

type Filter = 'all' | ProviderCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cleaning', label: 'Cleaning' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'tutoring', label: 'Tutoring' },
];

const AREAS = ['Leeds, UK', 'Headingley', 'Hyde Park', 'Chapel Allerton', 'Horsforth', 'Roundhay'];

export default function HomeScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const name = useAuthStore((s) => s.user?.name);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [location, setLocation] = useState('Leeds, UK');
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProviders
      .filter((p) => {
        const matchesCategory = filter === 'all' || p.category === filter;
        const matchesQuery = q === '' || p.name.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => b.rating - a.rating);
  }, [query, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const initial = name?.charAt(0)?.toUpperCase() ?? 'A';

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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>

      <FlashList
        data={loading ? [] : results}
        keyExtractor={(item: Provider) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.greeting}>Hi {name ?? 'there'} 👋</Text>
            <Text style={styles.subtitle}>Find trusted local help in Leeds</Text>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={c.text.muted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
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

            <Text style={styles.sectionTitle}>Top rated near you</Text>
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
              message="Try a different search or category."
              actionLabel="Clear filters"
              onAction={() => {
                setQuery('');
                setFilter('all');
              }}
            />
          )
        }
        renderItem={({ item }: { item: Provider }) => (
          <ProviderCard provider={item} onPress={() => router.push(`/provider/${item.id}`)} />
        )}
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
    searchBar: {
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
