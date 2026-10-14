import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  AnimatedCounter,
  EmptyState,
  MapPlaceholder,
  PressableScale,
  ProviderCard,
  SortFilterSheet,
  DEFAULT_SORT_FILTER,
  activeFilterCount,
  type SortFilterValue,
} from '../../src/components';
import { getCategoryBySlug, getProvidersByCategory } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import type { SubService } from '../../src/mocks/categories';
import { getAvailability } from '../../src/mocks/availability';
import { route } from '../../src/lib/nav';
import { useCartStore } from '../../src/stores/cartStore';
import { useCompareStore, COMPARE_LIMIT } from '../../src/stores/compareStore';
import { showToast } from '../../src/stores/toastStore';
import { useT, useMoney } from '../../src/i18n';
import { useColors, radius, shadow, spacing, typography, type Palette } from '../../src/theme';

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

function subServiceKeywords(sub: SubService): string[] {
  return sub.name
    .toLowerCase()
    .split(/[\s&]+/)
    .filter((w) => w.length > 3);
}

export default function CategoryScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = getCategoryBySlug(slug);

  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const cartTotal = useCartStore((s) => s.breakdown().total);

  const compareIds = useCompareStore((s) => s.ids);
  const toggleCompare = useCompareStore((s) => s.toggle);

  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState<SortFilterValue>(DEFAULT_SORT_FILTER);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const onToggleCompare = (id: string) => {
    const ok = toggleCompare(id);
    if (!ok) showToast(`You can compare up to ${COMPARE_LIMIT} providers`);
  };

  const providers = useMemo(() => {
    if (!category?.providerCategory) return [];
    return getProvidersByCategory(category.providerCategory);
  }, [category]);

  const results = useMemo(() => {
    const sub = category?.subServices.find((s) => s.id === activeSub);
    const keywords = sub ? subServiceKeywords(sub) : [];
    const filtered = providers.filter((p) => {
      const matchesSub =
        keywords.length === 0 ||
        p.services.some((s) => keywords.some((k) => s.name.toLowerCase().includes(k)));
      const matchesPrice = priceMatches(sortFilter.priceRange, p.priceFrom);
      const matchesRating = !sortFilter.minRating4 || p.rating >= 4;
      const matchesAvail = !sortFilter.availableToday || getAvailability(p.id).availableToday;
      return matchesSub && matchesPrice && matchesRating && matchesAvail;
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
  }, [providers, category, activeSub, sortFilter]);

  if (!category) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backPlain}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <EmptyState icon="alert-circle-outline" title="Category not found" />
      </View>
    );
  }

  const filterCount = activeFilterCount(sortFilter);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>{category.label}</Text>
          <Text style={styles.tagline}>{category.tagline}</Text>
        </View>
        <PressableScale
          haptic="selection"
          onPress={() => setCompareMode((v) => !v)}
          style={[styles.headerBtn, compareMode && styles.headerBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Toggle compare mode"
          accessibilityState={{ selected: compareMode }}
        >
          <Ionicons
            name="git-compare-outline"
            size={22}
            color={compareMode ? c.brand.tint : c.text.primary}
          />
        </PressableScale>
        <PressableScale
          haptic="selection"
          onPress={() => setShowMap((v) => !v)}
          style={[styles.headerBtn, showMap && styles.headerBtnActive]}
          accessibilityRole="button"
          accessibilityLabel={showMap ? 'Hide map' : 'Show map'}
          accessibilityState={{ selected: showMap }}
        >
          <Ionicons
            name={showMap ? 'list-outline' : 'map-outline'}
            size={22}
            color={showMap ? c.brand.tint : c.text.primary}
          />
        </PressableScale>
      </View>

      <FlashList
        data={results}
        keyExtractor={(p: Provider) => p.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={
          <View>
            {showMap ? (
              <MapPlaceholder
                height={200}
                style={{ marginTop: spacing.lg }}
                caption={`${results.length} providers near ${category.label.toLowerCase()} in your area`}
                pins={results.slice(0, 6).map((p, i) => ({
                  id: p.id,
                  x: 0.15 + ((i * 0.37) % 0.7),
                  y: 0.2 + ((i * 0.29) % 0.6),
                  tone: getAvailability(p.id).availableToday ? 'brand' : 'muted',
                }))}
              />
            ) : null}

            {category.packages && category.packages.length > 0 ? (
              <>
                <Text style={styles.sectionLabel}>Bundles &amp; packages</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pkgRow}
                >
                  {category.packages.map((pkg) => (
                    <View key={pkg.id} style={styles.pkgCard}>
                      <View style={styles.pkgTop}>
                        <Text style={styles.pkgName} numberOfLines={1}>
                          {pkg.name}
                        </Text>
                        {pkg.popular ? (
                          <View style={styles.popularTag}>
                            <Text style={styles.popularText}>Popular</Text>
                          </View>
                        ) : null}
                      </View>
                      {pkg.includes.map((inc) => (
                        <View key={inc} style={styles.pkgIncRow}>
                          <Ionicons name="checkmark" size={13} color={c.status.success} />
                          <Text style={styles.pkgInc} numberOfLines={1}>
                            {inc}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.pkgPriceRow}>
                        <Text style={styles.pkgPrice}>{money(pkg.price)}</Text>
                        <Text style={styles.pkgWas}>{money(pkg.wasPrice)}</Text>
                        <View style={styles.saveTag}>
                          <Text style={styles.saveText}>
                            Save {money(pkg.wasPrice - pkg.price)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.pkgDuration}>{pkg.durationMin} min total</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Text style={styles.sectionLabel}>Popular services</Text>
            <View style={styles.subGrid}>
              {category.subServices.map((sub) => {
                const selected = activeSub === sub.id;
                return (
                  <PressableScale
                    key={sub.id}
                    haptic="selection"
                    scaleTo={0.97}
                    style={[styles.subCard, selected && styles.subCardActive]}
                    onPress={() => setActiveSub(selected ? null : sub.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${sub.name}, ${t('money.from')} ${money(sub.priceFrom)}`}
                  >
                    {sub.popular ? (
                      <View style={styles.popularTag}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    ) : null}
                    <Text style={styles.subName}>{sub.name}</Text>
                    <Text style={styles.subDesc} numberOfLines={2}>
                      {sub.description}
                    </Text>
                    <View style={styles.subMeta}>
                      <Text style={styles.subPrice}>
                        {t('money.from')} {money(sub.priceFrom)}
                      </Text>
                      <Text style={styles.subDuration}>· {sub.durationMin} min</Text>
                    </View>
                  </PressableScale>
                );
              })}
            </View>

            <View style={styles.filterRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChips}
              >
                <FilterChip
                  label="All"
                  active={activeSub === null}
                  onPress={() => setActiveSub(null)}
                  styles={styles}
                />
                {category.subServices.map((sub) => (
                  <FilterChip
                    key={sub.id}
                    label={sub.name}
                    active={activeSub === sub.id}
                    onPress={() => setActiveSub(activeSub === sub.id ? null : sub.id)}
                    styles={styles}
                  />
                ))}
              </ScrollView>
              <PressableScale
                style={styles.sortBtn}
                onPress={() => setSheetOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Sort and filter"
              >
                <Ionicons name="options-outline" size={20} color={c.text.primary} />
                {filterCount > 0 ? (
                  <View style={styles.sortBadge}>
                    <Text style={styles.sortBadgeText}>{filterCount}</Text>
                  </View>
                ) : null}
              </PressableScale>
            </View>

            <Text style={styles.sectionLabel}>
              {results.length} {results.length === 1 ? 'provider' : 'providers'} available
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No providers match"
            message="Try clearing the filters to see more results."
            actionLabel="Clear filters"
            onAction={() => {
              setActiveSub(null);
              setSortFilter(DEFAULT_SORT_FILTER);
            }}
          />
        }
        renderItem={({ item }: { item: Provider }) => (
          <ProviderCard
            provider={item}
            onPress={() => router.push(`/provider/${item.id}`)}
            onCompareToggle={compareMode ? () => onToggleCompare(item.id) : undefined}
            compareSelected={compareIds.includes(item.id)}
          />
        )}
      />

      {compareIds.length > 0 ? (
        <MotiView
          from={{ opacity: 0, translateY: 60 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          style={styles.barWrap}
        >
          <PressableScale
            haptic="medium"
            style={[styles.compareBar, { paddingBottom: insets.bottom + spacing.sm }]}
            onPress={() => router.push(route('/compare'))}
            accessibilityRole="button"
            accessibilityLabel={`Compare ${compareIds.length} providers`}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{compareIds.length}</Text>
            </View>
            <Text style={styles.cartBarText}>Compare providers</Text>
            <Ionicons name="git-compare" size={18} color={c.text.inverse} />
          </PressableScale>
        </MotiView>
      ) : null}

      {cartCount > 0 && compareIds.length === 0 ? (
        <MotiView
          from={{ opacity: 0, translateY: 60 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 200 }}
          style={styles.barWrap}
        >
          <PressableScale
            haptic="medium"
            style={[styles.cartBar, { paddingBottom: insets.bottom + spacing.sm }]}
            onPress={() => router.push(route('/cart'))}
            accessibilityRole="button"
            accessibilityLabel={`View cart, ${cartCount} items, ${money(cartTotal)}`}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarText}>View cart</Text>
            <AnimatedCounter
              value={cartTotal}
              format={(v) => money(v)}
              style={styles.cartBarTotal}
            />
            <Ionicons name="arrow-forward" size={18} color={c.text.inverse} />
          </PressableScale>
        </MotiView>
      ) : null}

      <SortFilterSheet
        visible={sheetOpen}
        value={sortFilter}
        onClose={() => setSheetOpen(false)}
        onApply={(v) => {
          setSortFilter(v);
          setSheetOpen(false);
        }}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  styles,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <PressableScale
      haptic="selection"
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </PressableScale>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    back: { width: 32, height: 44, alignItems: 'center', justifyContent: 'center' },
    backPlain: { alignSelf: 'flex-start', marginBottom: spacing.lg, marginLeft: spacing.lg },
    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerBtnActive: { backgroundColor: c.brand.primarySoft },
    headerText: { flex: 1 },
    pkgRow: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.lg },
    pkgCard: {
      width: 230,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: spacing.xs,
      ...shadow.soft,
    },
    pkgTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    pkgName: { flex: 1, ...typography.scale.bodyMedium, color: c.text.primary },
    pkgIncRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    pkgInc: { flex: 1, ...typography.scale.caption, color: c.text.secondary },
    pkgPriceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    pkgPrice: { ...typography.scale.h2, color: c.brand.tint },
    pkgWas: {
      ...typography.scale.small,
      color: c.text.muted,
      textDecorationLine: 'line-through',
    },
    saveTag: {
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.status.successSoft,
    },
    saveText: {
      ...typography.scale.caption,
      fontSize: 10,
      color: c.status.success,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    pkgDuration: { ...typography.scale.caption, color: c.text.muted },
    title: { ...typography.scale.h1, color: c.text.primary },
    tagline: { ...typography.scale.small, color: c.text.secondary },
    sep: { height: spacing.md },
    sectionLabel: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    subCard: {
      width: '47%',
      flexGrow: 1,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      gap: 2,
    },
    subCardActive: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    popularTag: {
      alignSelf: 'flex-start',
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.brand.accentSoft,
      marginBottom: spacing.xs,
    },
    popularText: {
      ...typography.scale.caption,
      fontSize: 10,
      color: c.brand.accent,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    subName: { ...typography.scale.bodyMedium, color: c.text.primary },
    subDesc: { ...typography.scale.caption, color: c.text.secondary, minHeight: 32 },
    subMeta: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    subPrice: { ...typography.scale.smallMedium, color: c.brand.tint },
    subDuration: { ...typography.scale.caption, color: c.text.muted },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    filterChips: { gap: spacing.sm, paddingRight: spacing.sm },
    chip: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1.5,
    },
    chipActive: { backgroundColor: c.brand.primary, borderColor: c.brand.primary },
    chipInactive: { backgroundColor: c.background.surface, borderColor: c.border },
    chipText: { ...typography.scale.smallMedium, color: c.text.secondary },
    chipTextActive: { color: c.text.inverse },
    sortBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sortBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 3,
      borderRadius: 8,
      backgroundColor: c.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sortBadgeText: { ...typography.scale.caption, fontSize: 10, color: c.text.inverse },
    barWrap: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: 0,
    },
    cartBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      backgroundColor: c.brand.primary,
      ...shadow.floating,
    },
    compareBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      backgroundColor: c.brand.primaryDark,
      ...shadow.floating,
    },
    cartBadge: {
      minWidth: 24,
      height: 24,
      paddingHorizontal: 6,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadgeText: {
      ...typography.scale.smallMedium,
      color: c.text.inverse,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
    cartBarText: { flex: 1, ...typography.scale.bodyMedium, color: c.text.inverse },
    cartBarTotal: {
      ...typography.scale.bodyMedium,
      color: c.text.inverse,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
  });
