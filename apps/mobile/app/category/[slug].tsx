import { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type LayoutChangeEvent,
} from 'react-native';

import { BottomSheet } from '../../src/components';
import {
  Text,
  Icon,
  IconButton,
  PressableScale,
  Chip,
  Button,
  SegmentedControl,
  Toggle,
  EmptyState,
  ServiceCard,
  BookingBar,
} from '../../src/components/ui';
import { Fluent3D, type Fluent3DKey } from '../../src/assets/3d';
import { getCategoryBySlug, getProvidersByCategory } from '../../src/mocks';
import type { Provider, Service } from '../../src/mocks/types';
import type { SubService } from '../../src/mocks/categories';
import { useMoney } from '../../src/i18n';
import {
  useTokens,
  radius,
  spacing,
  categoryStyle,
  categoryTint,
  useColorSchemeName,
} from '../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

type SortKey = 'rating' | 'price' | 'distance';
type PriceRange = 'all' | 'low' | 'mid' | 'high';

interface SortFilterValue {
  sort: SortKey;
  priceRange: PriceRange;
  minRating4: boolean;
}

const DEFAULT_SORT_FILTER: SortFilterValue = {
  sort: 'rating',
  priceRange: 'all',
  minRating4: false,
};
const SORT_KEYS: SortKey[] = ['rating', 'price', 'distance'];
const SORT_LABELS = ['Top rated', 'Price', 'Distance'];
const PRICE_OPTIONS: { label: string; value: PriceRange }[] = [
  { label: 'Any', value: 'all' },
  { label: 'Budget', value: 'low' },
  { label: 'Mid', value: 'mid' },
  { label: 'Premium', value: 'high' },
];

function activeFilterCount(v: SortFilterValue): number {
  let n = 0;
  if (v.priceRange !== 'all') n += 1;
  if (v.minRating4) n += 1;
  return n;
}

function priceMatches(range: PriceRange, priceFrom: number): boolean {
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

function subKeywords(sub: SubService): string[] {
  return sub.name
    .toLowerCase()
    .split(/[\s&]+/)
    .filter((w) => w.length > 3);
}

/** The provider's concrete service for a sub-category (keyword match, else the sub itself). */
function serviceForSub(provider: Provider, sub: SubService): Service {
  const kws = subKeywords(sub);
  const match = provider.services.find((s) => kws.some((k) => s.name.toLowerCase().includes(k)));
  return match ?? { name: sub.name, price: sub.priceFrom, durationMin: sub.durationMin };
}

const CHIPBAR_H = 52;

export default function CategoryScreen() {
  const router = useRouter();
  const t = useTokens();
  const scheme = useColorSchemeName();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const category = getCategoryBySlug(slug);

  const [sortFilter, setSortFilter] = useState<SortFilterValue>(DEFAULT_SORT_FILTER);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<number[]>([]);

  const providers = useMemo(
    () => (category?.providerCategory ? getProvidersByCategory(category.providerCategory) : []),
    [category],
  );

  const sorted = useMemo(() => {
    const filtered = providers.filter(
      (p) =>
        priceMatches(sortFilter.priceRange, p.priceFrom) &&
        (!sortFilter.minRating4 || p.rating >= 4),
    );
    return [...filtered].sort((a, b) => {
      switch (sortFilter.sort) {
        case 'price':
          return a.priceFrom - b.priceFrom;
        case 'distance':
          return a.distanceKm - b.distanceKm;
        default:
          return b.rating - a.rating;
      }
    });
  }, [providers, sortFilter]);

  if (!category) {
    return (
      <View
        style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top + spacing.sm }]}
      >
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

  const art = categoryStyle(category.slug).art as Fluent3DKey;
  const tint = categoryTint(category.slug, scheme);
  const avgRating =
    providers.length > 0
      ? (providers.reduce((n, p) => n + p.rating, 0) / providers.length).toFixed(1)
      : '4.8';
  const filterCount = activeFilterCount(sortFilter);
  const cardW = (width - spacing.lg * 2 - spacing.md) / 2;

  // Section 0 = Packages (when present), then one per sub-service.
  const hasPackages = Boolean(category.packages && category.packages.length > 0);
  const sections = [
    ...(hasPackages ? [{ id: 'packages', label: 'Packages', art }] : []),
    ...category.subServices.map((sub) => ({ id: sub.id, label: sub.name, art })),
  ];

  const onSectionLayout = (index: number) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    // Written from a layout callback (runs after render), not during render.
    // eslint-disable-next-line react-hooks/refs
    positions.current[index] = y;
  };

  const scrollToSection = (index: number) => {
    const y = positions.current[index] ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - CHIPBAR_H - spacing.sm), animated: true });
    setActiveSection(index);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y + CHIPBAR_H + spacing.lg;
    let current = 0;
    positions.current.forEach((pos, i) => {
      if (pos <= y) current = i;
    });
    if (current !== activeSection) setActiveSection(current);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text variant="headline" numberOfLines={1} style={styles.flex1}>
          {category.label}
        </Text>
        <PressableScale
          onPress={() => setSheetOpen(true)}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel="Sort and filter"
          style={[styles.sortBtn, { borderColor: t.border, backgroundColor: t.surface }]}
        >
          <Icon name="sliders" size={20} color={t.text} />
          {filterCount > 0 ? (
            <View style={[styles.sortBadge, { backgroundColor: t.primary }]}>
              <Text variant="micro" style={{ color: t.onPrimary }}>
                {filterCount}
              </Text>
            </View>
          ) : null}
        </PressableScale>
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tint hero card */}
        <View style={styles.heroWrap}>
          <View style={[styles.hero, { backgroundColor: tint }]}>
            <Fluent3D name={art} size={72} />
            <View style={styles.flex1}>
              <Text variant="title1">{category.label}</Text>
              <View style={styles.heroMeta}>
                <Icon name="star" size={16} color={t.star} weight="fill" />
                <Text variant="footnote" tabular style={styles.bold}>
                  {avgRating}
                </Text>
                <Text variant="footnote" tone="muted">
                  · 12k bookings in Leeds
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sticky scroll-spy chips */}
        <View style={[styles.chipBar, { backgroundColor: t.bg, borderBottomColor: t.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {sections.map((sec, i) => {
              const selected = activeSection === i;
              return (
                <PressableScale
                  key={sec.id}
                  onPress={() => scrollToSection(i)}
                  haptic="selection"
                  scaleTo={0.96}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={sec.label}
                  style={[
                    styles.spyChip,
                    {
                      backgroundColor: selected ? t.primary : t.bgSubtle,
                      borderColor: selected ? t.primary : t.border,
                    },
                  ]}
                >
                  <Fluent3D name={sec.art} size={16} />
                  <Text
                    variant="caption"
                    style={{ color: selected ? t.onPrimary : t.text, fontWeight: '600' }}
                  >
                    {sec.label}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* Packages */}
        {hasPackages ? (
          <View style={styles.section} onLayout={onSectionLayout(0)}>
            <Text variant="title2" style={styles.sectionTitle}>
              Packages
            </Text>
            <View style={styles.pkgList}>
              {(category.packages ?? []).map((pkg) => (
                <View
                  key={pkg.id}
                  style={[styles.pkgCard, { borderColor: t.border, backgroundColor: t.surface }]}
                >
                  <View style={styles.pkgTop}>
                    <Text variant="headline" numberOfLines={1} style={styles.flex1}>
                      {pkg.name}
                    </Text>
                    <View style={[styles.saveTag, { backgroundColor: t.successSoft }]}>
                      <Text variant="micro" tone="success">
                        SAVE {money(pkg.wasPrice - pkg.price)}
                      </Text>
                    </View>
                  </View>
                  {pkg.includes.map((inc) => (
                    <View key={inc} style={styles.pkgIncRow}>
                      <Icon name="check" size={16} color={t.success} />
                      <Text variant="caption" tone="muted" numberOfLines={1} style={styles.flex1}>
                        {inc}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.pkgPriceRow}>
                    <Text variant="title2" tabular>
                      {money(pkg.price)}
                    </Text>
                    <Text variant="footnote" tone="subtle" tabular style={styles.strike}>
                      {money(pkg.wasPrice)}
                    </Text>
                    <Text variant="caption" tone="subtle" tabular style={styles.flex1}>
                      {pkg.durationMin} min total
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* One section per sub-category: 2-col ServiceCard grid */}
        {category.subServices.map((sub, i) => {
          const sectionIndex = (hasPackages ? 1 : 0) + i;
          return (
            <View key={sub.id} style={styles.section} onLayout={onSectionLayout(sectionIndex)}>
              <Text variant="title2" style={styles.sectionTitle}>
                {sub.name}
              </Text>
              <Text variant="footnote" tone="muted" style={styles.sectionSub}>
                {sub.description}
              </Text>
              {sorted.length === 0 ? (
                <Text variant="footnote" tone="muted">
                  No pros match your filters.
                </Text>
              ) : (
                <View style={styles.grid}>
                  {sorted.map((p) => {
                    const svc = serviceForSub(p, sub);
                    return (
                      <ServiceCard
                        key={p.id + sub.id}
                        width={cardW}
                        categorySlug={category.slug}
                        title={`${sub.name} · ${p.name}`}
                        durationMin={svc.durationMin}
                        price={svc.price}
                        oldPrice={p.mostBooked ? Math.round(svc.price * 1.2) : undefined}
                        tag={p.mostBooked ? 'POPULAR' : sub.popular ? 'TOP PICK' : undefined}
                        rating={p.rating}
                        ratingCount={p.reviewCount}
                        cartKey={sub.id}
                        providerId={p.id}
                        providerName={p.name}
                        onPress={() => router.push(`/provider/${p.id}`)}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <BookingBar offset={spacing.sm} />

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
      <Text variant="footnote" tone="muted" style={[sfStyles.label, sfStyles.spaced]}>
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
      <View style={[sfStyles.toggleRow, sfStyles.spaced]}>
        <Text variant="body">Rated 4 stars &amp; up</Text>
        <Toggle
          value={draft.minRating4}
          onChange={(v) => setDraft({ ...draft, minRating4: v })}
          accessibilityLabel="Rated 4 stars and up"
        />
      </View>
      <Button label="Show results" onPress={() => onApply(draft)} style={sfStyles.applyBtn} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  bold: { fontWeight: '700' },
  strike: { textDecorationLine: 'line-through' },
  backPlain: { alignSelf: 'flex-start', marginBottom: spacing.lg, marginLeft: spacing.sm },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  chipBar: { borderBottomWidth: StyleSheet.hairlineWidth },
  chipRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  spyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.xs },
  sectionSub: { marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  pkgList: { gap: spacing.md },
  pkgCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  pkgTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  saveTag: { paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  pkgIncRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pkgPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});

const sfStyles = StyleSheet.create({
  label: { marginBottom: spacing.sm },
  spaced: { marginTop: spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  applyBtn: { marginTop: spacing.xl },
});
