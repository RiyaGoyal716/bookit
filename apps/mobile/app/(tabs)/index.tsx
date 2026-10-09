import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Chip, EmptyState, ProviderCard, Skeleton } from '../../src/components';
import { providers as allProviders } from '../../src/mocks';
import type { ProviderCategory } from '../../src/mocks/types';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, radius, spacing, typography } from '../../src/theme';

type Filter = 'all' | ProviderCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cleaning', label: 'Cleaning' },
  { key: 'beauty', label: 'Beauty' },
  { key: 'tutoring', label: 'Tutoring' },
];

export default function HomeScreen() {
  const router = useRouter();
  const name = useAuthStore((s) => s.user?.name);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    // Simulate a brief first-mount fetch so skeletons show.
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProviders.filter((p) => {
      const matchesCategory = filter === 'all' || p.category === filter;
      const matchesQuery = q === '' || p.name.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, filter]);

  return (
    <View style={styles.container}>
      <FlatList
        data={loading ? [] : results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.greeting}>Hi {name ?? 'there'} 👋</Text>
            <Text style={styles.subtitle}>Find trusted local help in Leeds</Text>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={colors.text.muted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search cleaners, barbers, tutors…"
                placeholderTextColor={colors.text.muted}
                returnKeyType="search"
              />
              {query.length > 0 ? (
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.text.muted}
                  onPress={() => setQuery('')}
                />
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
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: spacing.md }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <ProviderSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptyState title="No providers found" message="Try a different search or category." />
          )
        }
        renderItem={({ item }) => (
          <ProviderCard provider={item} onPress={() => router.push(`/provider/${item.id}`)} />
        )}
      />
    </View>
  );
}

function ProviderSkeleton() {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
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
    backgroundColor: colors.background.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  chips: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  skeletonCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background.base,
  },
  skeletonBody: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
