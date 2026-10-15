import { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, type ViewStyle, type StyleProp } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '../../src/components';
import {
  Text,
  Icon,
  IconButton,
  PressableScale,
  Chip,
  Card,
  Avatar,
  Rating,
  Button,
  SegmentedControl,
  Toggle,
  EmptyState,
} from '../../src/components/ui';
import { getCategoryBySlug, getProvidersByCategory } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import type { SubService } from '../../src/mocks/categories';
import { getAvailability } from '../../src/mocks/availability';
import { route } from '../../src/lib/nav';
import { useCartStore } from '../../src/stores/cartStore';
import { useCompareStore, COMPARE_LIMIT } from '../../src/stores/compareStore';
import { showToast } from '../../src/stores/toastStore';
import { useT, useMoney } from '../../src/i18n';
import { useColors, radius, shadow, spacing, type Palette } from '../../src/theme';

// ---------------------------------------------------------------------------
// Sort & filter model (previously src/components/SortFilterSheet, now inlined).
// ---------------------------------------------------------------------------
type SortKey = 'rating' | 'price' | 'distance';
type PriceRange = 'all' | 'low' | 'mid' | 'high';

export interface SortFilterValue {
  sort: SortKey;
  priceRange: PriceRange;
  minRating4: boolean;
  availableToday: boolean;
}

const DEFAULT_SORT_FILTER: SortFilterValue = {
  sort: 'rating',
  priceRange: 'all',
  minRating4: false,
  availableToday: false,
};

function activeFilterCount(v: SortFilterValue): number {
  let n = 0;
  if (v.priceRange !== 'all') n += 1;
  if (v.minRating4) n += 1;
  if (v.availableToday) n += 1;
  return n;
}

const SORT_KEYS: SortKey[] = ['rating', 'price', 'distance'];
const SORT_LABELS = ['Top rated', 'Price', 'Distance'];
const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: 'Any', value: 'all' },
  { label: 'Budget', value: 'low' },
  { label: 'Mid', value: 'mid' },
  { label: 'Premium', value: 'high' },
];

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
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.backPlain}
        />
        <EmptyState art="error" title="Category not found" />
      </View>
    );
  }

  const filterCount = activeFilterCount(sortFilter);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          style={styles.back}
        />
        <View style={styles.headerText}>
          <Text variant="title1">{category.label}</Text>
          <Text variant="callout" tone="muted">
            {category.tagline}
          </Text>
        </View>
        <IconButton
          name="compare"
          size={24}
          onPress={() => setCompareMode((v) => !v)}
          accessibilityLabel="Toggle compare mode"
          color={compareMode ? c.brand.tint : c.text.primary}
          style={[styles.headerBtn, compareMode && styles.headerBtnActive]}
        />
        <IconButton
          name={showMap ? 'list-checks' : 'map'}
          size={24}
          onPress={() => setShowMap((v) => !v)}
          accessibilityLabel={showMap ? 'Hide map' : 'Show map'}
          color={showMap ? c.brand.tint : c.text.primary}
          style={[styles.headerBtn, showMap && styles.headerBtnActive]}
        />
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
              <InlineMap
                height={200}
                style={{ marginTop: spacing.lg }}
                caption={`${results.length} providers near ${category.label.toLowerCase()} in your area`}
                c={c}
              />
            ) : null}

            {category.packages && category.packages.length > 0 ? (
              <>
                <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
                  Bundles &amp; packages
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pkgRow}
                >
                  {category.packages.map((pkg) => (
                    <View key={pkg.id} style={styles.pkgCard}>
                      <View style={styles.pkgTop}>
                        <Text variant="headline" numberOfLines={1} style={styles.pkgName}>
                          {pkg.name}
                        </Text>
                        {pkg.popular ? (
                          <View style={styles.popularTag}>
                            <Text variant="micro" tone="accent">
                              Popular
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {pkg.includes.map((inc) => (
                        <View key={inc} style={styles.pkgIncRow}>
                          <Icon name="check" size={16} color={c.status.success} />
                          <Text
                            variant="caption"
                            tone="muted"
                            numberOfLines={1}
                            style={styles.flex1}
                          >
                            {inc}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.pkgPriceRow}>
                        <Text variant="title2" tone="accent">
                          {money(pkg.price)}
                        </Text>
                        <Text variant="callout" tone="subtle" style={styles.pkgWas}>
                          {money(pkg.wasPrice)}
                        </Text>
                        <View style={styles.saveTag}>
                          <Text variant="micro" tone="success">
                            Save {money(pkg.wasPrice - pkg.price)}
                          </Text>
                        </View>
                      </View>
                      <Text variant="caption" tone="subtle">
                        {pkg.durationMin} min total
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
              Popular services
            </Text>
            <View style={styles.subGrid}>
              {category.subServices.map((sub) => {
                const selected = activeSub === sub.id;
                return (
                  <PressableScale
                    key={sub.id}
                    style={[styles.subCard, selected && styles.subCardActive]}
                    onPress={() => setActiveSub(selected ? null : sub.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${sub.name}, ${t('money.from')} ${money(sub.priceFrom)}`}
                  >
                    {sub.popular ? (
                      <View style={styles.popularTag}>
                        <Text variant="micro" tone="accent">
                          Popular
                        </Text>
                      </View>
                    ) : null}
                    <Text variant="headline">{sub.name}</Text>
                    <Text variant="caption" tone="muted" numberOfLines={2} style={styles.subDesc}>
                      {sub.description}
                    </Text>
                    <View style={styles.subMeta}>
                      <Text variant="callout" tone="accent">
                        {t('money.from')} {money(sub.priceFrom)}
                      </Text>
                      <Text variant="caption" tone="subtle">
                        · {sub.durationMin} min
                      </Text>
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
                <Chip
                  label="All"
                  selected={activeSub === null}
                  onPress={() => setActiveSub(null)}
                />
                {category.subServices.map((sub) => (
                  <Chip
                    key={sub.id}
                    label={sub.name}
                    selected={activeSub === sub.id}
                    onPress={() => setActiveSub(activeSub === sub.id ? null : sub.id)}
                  />
                ))}
              </ScrollView>
              <PressableScale
                style={styles.sortBtn}
                onPress={() => setSheetOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Sort and filter"
              >
                <Icon name="sliders" size={20} color={c.text.primary} />
                {filterCount > 0 ? (
                  <View style={styles.sortBadge}>
                    <Text variant="micro" tone="onPrimary">
                      {filterCount}
                    </Text>
                  </View>
                ) : null}
              </PressableScale>
            </View>

            <Text variant="footnote" tone="muted" style={styles.sectionLabel}>
              {results.length} {results.length === 1 ? 'provider' : 'providers'} available
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            art="search"
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
          <ProviderRowCard
            provider={item}
            onPress={() => router.push(`/provider/${item.id}`)}
            onCompareToggle={compareMode ? () => onToggleCompare(item.id) : undefined}
            compareSelected={compareIds.includes(item.id)}
          />
        )}
      />

      {compareIds.length > 0 ? (
        <PressableScale
          style={[styles.compareBar, { paddingBottom: insets.bottom + spacing.sm }]}
          onPress={() => router.push(route('/compare'))}
          accessibilityRole="button"
          accessibilityLabel={`Compare ${compareIds.length} providers`}
        >
          <View style={styles.cartBadge}>
            <Text variant="callout" tone="onPrimary" style={styles.cartBadgeText}>
              {compareIds.length}
            </Text>
          </View>
          <Text variant="headline" tone="onPrimary" style={styles.cartBarText}>
            Compare providers
          </Text>
          <Icon name="compare" size={20} color={c.text.inverse} />
        </PressableScale>
      ) : null}

      {cartCount > 0 && compareIds.length === 0 ? (
        <PressableScale
          style={[styles.cartBar, { paddingBottom: insets.bottom + spacing.sm }]}
          onPress={() => router.push(route('/cart'))}
          accessibilityRole="button"
          accessibilityLabel={`View cart, ${cartCount} items, ${money(cartTotal)}`}
        >
          <View style={styles.cartBadge}>
            <Text variant="callout" tone="onPrimary" style={styles.cartBadgeText}>
              {cartCount}
            </Text>
          </View>
          <Text variant="headline" tone="onPrimary" style={styles.cartBarText}>
            View cart
          </Text>
          <Text variant="headline" tone="onPrimary" style={styles.cartBarTotal}>
            {money(cartTotal)}
          </Text>
          <Icon name="arrow-right" size={20} color={c.text.inverse} />
        </PressableScale>
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

// ---------------------------------------------------------------------------
// Inline provider card (replaces the removed ProviderCard component).
// ---------------------------------------------------------------------------
function ProviderRowCard({
  provider,
  onPress,
  onCompareToggle,
  compareSelected,
}: {
  provider: Provider;
  onPress: () => void;
  onCompareToggle?: () => void;
  compareSelected?: boolean;
}) {
  const c = useColors();
  const money = useMoney();
  return (
    <Card variant="outlined" padding={spacing.md} style={pcStyles.card}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={provider.name}
        style={pcStyles.row}
      >
        <Avatar uri={provider.photo} name={provider.name} size={56} />
        <View style={pcStyles.body}>
          <Text variant="headline" numberOfLines={1}>
            {provider.name}
          </Text>
          <Text variant="footnote" tone="muted" numberOfLines={1}>
            {provider.tagline ?? provider.category} · {provider.area ?? `${provider.distanceKm} km`}
          </Text>
          <View style={pcStyles.meta}>
            <Rating value={provider.rating} count={provider.reviewCount} />
            <Text variant="footnote" tone="muted">
              ·
            </Text>
            <Text variant="footnote" tabular style={pcStyles.price}>
              {money(provider.priceFrom)}+
            </Text>
          </View>
        </View>
      </PressableScale>
      {onCompareToggle ? (
        <IconButton
          name={compareSelected ? 'check-circle' : 'plus'}
          accessibilityLabel={compareSelected ? 'Remove from compare' : 'Add to compare'}
          variant="subtle"
          diameter={36}
          size={16}
          color={compareSelected ? c.brand.tint : c.text.muted}
          onPress={onCompareToggle}
        />
      ) : null}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Inline map placeholder (replaces the removed MapPlaceholder component).
// ---------------------------------------------------------------------------
function InlineMap({
  height,
  caption,
  style,
  c,
}: {
  height: number;
  caption: string;
  style?: StyleProp<ViewStyle>;
  c: Palette;
}) {
  return (
    <View
      style={[
        {
          height,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.border,
          backgroundColor: c.background.muted,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.lg,
        },
        style,
      ]}
    >
      <Icon name="map-pin" size={24} color={c.brand.tint} />
      <Text variant="callout" tone="muted" center style={{ marginTop: spacing.sm }}>
        {caption}
      </Text>
      <Text variant="footnote" tone="subtle" center>
        Map preview
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Inline sort & filter sheet (replaces the removed SortFilterSheet component).
// ---------------------------------------------------------------------------
function SortFilterSheet({
  visible,
  value,
  onClose,
  onApply,
}: {
  visible: boolean;
  value: SortFilterValue;
  onClose: () => void;
  onApply: (v: SortFilterValue) => void;
}) {
  const [draft, setDraft] = useState<SortFilterValue>(value);
  const [wasVisible, setWasVisible] = useState(visible);

  // Re-seed the draft from the applied value each time the sheet opens
  // (render-time state sync — the React-recommended alternative to an effect).
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(value);
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Sort & filter">
      <Text variant="footnote" tone="muted" style={sfStyles.label}>
        Sort by
      </Text>
      <SegmentedControl
        options={SORT_LABELS}
        value={Math.max(0, SORT_KEYS.indexOf(draft.sort))}
        onChange={(i) => setDraft({ ...draft, sort: SORT_KEYS[i] })}
      />

      <Text variant="footnote" tone="muted" style={[sfStyles.label, sfStyles.labelSpaced]}>
        Price
      </Text>
      <View style={sfStyles.chipRow}>
        {PRICE_OPTIONS.map((o) => (
          <Chip
            key={o.value}
            label={o.label}
            selected={draft.priceRange === o.value}
            onPress={() => setDraft({ ...draft, priceRange: o.value })}
          />
        ))}
      </View>

      <View style={[sfStyles.toggleRow, sfStyles.labelSpaced]}>
        <Text variant="body">Rated 4 stars &amp; up</Text>
        <Toggle
          value={draft.minRating4}
          onChange={(v) => setDraft({ ...draft, minRating4: v })}
          accessibilityLabel="Rated 4 stars and up"
        />
      </View>
      <View style={sfStyles.toggleRow}>
        <Text variant="body">Available today</Text>
        <Toggle
          value={draft.availableToday}
          onChange={(v) => setDraft({ ...draft, availableToday: v })}
          accessibilityLabel="Available today"
        />
      </View>

      <Button label="Show results" onPress={() => onApply(draft)} style={sfStyles.applyBtn} />
    </BottomSheet>
  );
}

const pcStyles = StyleSheet.create({
  card: { marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  body: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  price: { fontWeight: '600' },
});

const sfStyles = StyleSheet.create({
  label: { marginBottom: spacing.sm },
  labelSpaced: { marginTop: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  applyBtn: { marginTop: spacing.xl },
});

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
    back: { marginLeft: -spacing.xs },
    backPlain: { alignSelf: 'flex-start', marginBottom: spacing.lg, marginLeft: spacing.sm },
    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
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
    pkgName: { flex: 1 },
    pkgIncRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    flex1: { flex: 1 },
    pkgPriceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    pkgWas: {
      textDecorationLine: 'line-through',
    },
    saveTag: {
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.status.successSoft,
    },
    sep: { height: spacing.md },
    sectionLabel: {
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
    subDesc: { minHeight: 32 },
    subMeta: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    filterChips: { gap: spacing.sm, paddingRight: spacing.sm },
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
    cartBar: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: 0,
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
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      bottom: 0,
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
      backgroundColor: c.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadgeText: { fontWeight: '700' },
    cartBarText: { flex: 1 },
    cartBarTotal: { fontWeight: '700' },
  });
