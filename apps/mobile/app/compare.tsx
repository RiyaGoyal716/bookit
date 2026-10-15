import { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Icon, IconButton, PressableScale, Rating, EmptyState } from '../src/components/ui';
import { getProviderById } from '../src/mocks';
import { getAvailability } from '../src/mocks/availability';
import { useCompareStore } from '../src/stores/compareStore';
import { route } from '../src/lib/nav';
import { useT, useMoney } from '../src/i18n';
import { useColors, radius, spacing, type Palette } from '../src/theme';

const COL_W = 150;

export default function CompareScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const money = useMoney();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  const providers = useMemo(
    () => ids.map((id) => getProviderById(id)).filter((p): p is NonNullable<typeof p> => !!p),
    [ids],
  );

  const rows: { key: string; label: string; render: (id: string) => string }[] = useMemo(
    () => [
      {
        key: 'rating',
        label: 'Rating',
        render: (id) => {
          const p = getProviderById(id);
          return p ? `${p.rating.toFixed(1)} (${p.reviewCount})` : '—';
        },
      },
      {
        key: 'price',
        label: t('money.from'),
        render: (id) => {
          const p = getProviderById(id);
          return p ? money(p.priceFrom) : '—';
        },
      },
      {
        key: 'distance',
        label: 'Distance',
        render: (id) => {
          const p = getProviderById(id);
          return p ? `${p.distanceKm} km` : '—';
        },
      },
      {
        key: 'response',
        label: 'Responds',
        render: (id) => getProviderById(id)?.stats?.responseTime ?? '—',
      },
      {
        key: 'jobs',
        label: 'Jobs done',
        render: (id) => {
          const n = getProviderById(id)?.stats?.jobsDone;
          return n ? `${n}` : '—';
        },
      },
      {
        key: 'experience',
        label: 'Experience',
        render: (id) => {
          const y = getProviderById(id)?.stats?.yearsExperience;
          return y ? `${y} yrs` : '—';
        },
      },
      {
        key: 'avail',
        label: 'Availability',
        render: (id) =>
          getAvailability(id).availableToday ? 'Today' : getAvailability(id).nextSlot,
      },
      {
        key: 'badges',
        label: 'Trust badges',
        render: (id) => `${getProviderById(id)?.badges?.length ?? 0} badges`,
      },
    ],
    [t, money],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <IconButton
          name="chevron-left"
          size={24}
          variant="subtle"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text variant="title1" style={styles.title}>
          Compare
        </Text>
        {providers.length > 0 ? (
          <PressableScale onPress={clear} accessibilityRole="button" accessibilityLabel="Clear all">
            <Text variant="callout" tone="accent">
              Clear
            </Text>
          </PressableScale>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {providers.length === 0 ? (
        <EmptyState
          art="empty"
          title="Nothing to compare yet"
          message="Add up to three providers from a category to see them side by side."
          actionLabel="Browse providers"
          onAction={() => router.replace(route('/(tabs)'))}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* heads */}
              <View style={styles.row}>
                <View style={styles.rowLabelCell} />
                {providers.map((p) => (
                  <View key={p.id} style={styles.headCell}>
                    <PressableScale
                      style={styles.removeBtn}
                      onPress={() => remove(p.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${p.name}`}
                    >
                      <Icon name="close" size={16} color={c.text.inverse} />
                    </PressableScale>
                    <Image
                      source={{ uri: p.photo }}
                      style={styles.avatar}
                      contentFit="cover"
                      transition={150}
                      cachePolicy="memory-disk"
                    />
                    <Text variant="callout" center numberOfLines={2} style={styles.headName}>
                      {p.name}
                    </Text>
                    <Rating value={p.rating} size={16} />
                  </View>
                ))}
              </View>

              {rows.map((r, idx) => (
                <View key={r.key} style={[styles.row, idx % 2 === 0 && styles.rowAlt]}>
                  <View style={styles.rowLabelCell}>
                    <Text variant="caption" tone="muted">
                      {r.label}
                    </Text>
                  </View>
                  {providers.map((p) => (
                    <View key={p.id} style={styles.valueCell}>
                      <Text variant="callout" center>
                        {r.render(p.id)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

              <View style={styles.row}>
                <View style={styles.rowLabelCell} />
                {providers.map((p) => (
                  <View key={p.id} style={styles.valueCell}>
                    <PressableScale
                      style={styles.viewBtn}
                      onPress={() => router.push(`/provider/${p.id}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${p.name}`}
                    >
                      <Text variant="callout" tone="onPrimary" style={styles.viewBtnText}>
                        View
                      </Text>
                    </PressableScale>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { flex: 1 },
    row: { flexDirection: 'row', borderRadius: radius.md },
    rowAlt: { backgroundColor: c.background.muted },
    rowLabelCell: { width: 96, paddingVertical: spacing.md, justifyContent: 'center' },
    headCell: {
      width: COL_W,
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    removeBtn: {
      position: 'absolute',
      top: 4,
      right: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: c.text.muted,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    avatar: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: c.skeleton },
    headName: {},
    valueCell: {
      width: COL_W,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      minHeight: 40,
      justifyContent: 'center',
    },
    viewBtnText: { fontWeight: '700' },
  });
