import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { providers as allProviders, categories } from '../../src/mocks';
import type { Provider } from '../../src/mocks/types';
import { useMoney } from '../../src/i18n';
import { useTokens, spacing, radius } from '../../src/theme';
import { useCompareStore } from '../../src/stores/compareStore';
import {
  Text,
  Icon,
  IconButton,
  SearchField,
  Chip,
  SegmentedControl,
  Card,
  Avatar,
  Rating,
  Button,
  EmptyState,
  AnimatedListItem,
  ContextMenu,
} from '../../src/components/ui';
import { useProviderCardActions } from '../../src/lib/providerActions';

function ProviderRow({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const t = useTokens();
  const money = useMoney();
  const compare = useCompareStore();
  const selected = compare.has(provider.id);
  const actions = useProviderCardActions(provider);

  return (
    <Card variant="outlined" padding={spacing.md} style={styles.card}>
      <ContextMenu
        onPress={onPress}
        actions={actions}
        scaleTo={0.99}
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
            <Text variant="footnote" tabular style={{ fontWeight: '600' }}>
              {money(provider.priceFrom)}+
            </Text>
          </View>
        </View>
      </ContextMenu>
      <IconButton
        name={selected ? 'check-circle' : 'plus'}
        accessibilityLabel={selected ? 'Remove from compare' : 'Add to compare'}
        variant="subtle"
        diameter={36}
        size={16}
        color={selected ? t.accent : t.textMuted}
        onPress={() => compare.toggle(provider.id)}
      />
    </Card>
  );
}

/** NOVA Explore: categories, list/map toggle and a compare tray. */
export default function Explore() {
  const t = useTokens();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const compareIds = useCompareStore((s) => s.ids);
  const [cat, setCat] = useState<string | null>(null);
  const [mode, setMode] = useState(0); // 0 list, 1 map

  const list = useMemo(() => {
    if (!cat) return allProviders;
    return allProviders.filter((p) => p.category === cat);
  }, [cat]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.sm }}>
      <View style={styles.header}>
        <Text variant="title1">Explore</Text>
        <IconButton
          name="sliders"
          accessibilityLabel="Filters"
          variant="subtle"
          onPress={() => router.push('/search')}
        />
      </View>

      <View style={styles.controls}>
        <SearchField
          placeholder="Deep clean tomorrow under £80"
          onPress={() => router.push('/concierge')}
        />
        <FlashList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { slug: null as string | null, label: 'All' },
            ...categories.map((c) => ({ slug: c.slug, label: c.label })),
          ]}
          keyExtractor={(i) => i.slug ?? 'all'}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => (
            <View style={{ marginRight: spacing.sm }}>
              <Chip
                label={item.label}
                selected={cat === item.slug}
                onPress={() => setCat(item.slug)}
              />
            </View>
          )}
        />
        <SegmentedControl options={['List', 'Map']} value={mode} onChange={setMode} />
      </View>

      {mode === 1 ? (
        <View style={styles.mapWrap}>
          <View style={[styles.map, { backgroundColor: t.bgSubtle, borderColor: t.border }]}>
            <Icon name="map-pin" size={24} color={t.accent} />
            <Text variant="callout" tone="muted" center style={{ marginTop: spacing.sm }}>
              {list.length} pros near you
            </Text>
            <Text variant="footnote" tone="subtle" center>
              Map preview
            </Text>
          </View>
        </View>
      ) : (
        <FlashList
          data={list}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: 140 }}
          ListEmptyComponent={
            <EmptyState art="search" title="No pros here yet" message="Try another category." />
          }
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <ProviderRow provider={item} onPress={() => router.push(`/provider/${item.id}`)} />
            </AnimatedListItem>
          )}
        />
      )}

      {compareIds.length > 0 && (
        <View style={[styles.tray, { bottom: insets.bottom + 86 }]}>
          <Button
            label={`Compare (${compareIds.length})`}
            icon="arrow-right"
            iconPosition="right"
            onPress={() => router.push('/compare')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  controls: { paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  chips: { paddingVertical: spacing.xs },
  card: { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardBody: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mapWrap: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: 140 },
  map: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tray: { position: 'absolute', left: spacing.lg, right: spacing.lg },
});
