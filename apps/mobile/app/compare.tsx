import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState, RatingStars } from '../src/components';
import { getProviderById } from '../src/mocks';
import { getAvailability } from '../src/mocks/availability';
import { useCompareStore } from '../src/stores/compareStore';
import { route } from '../src/lib/nav';
import { useT, useMoney } from '../src/i18n';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

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
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.title}>Compare</Text>
        {providers.length > 0 ? (
          <Pressable
            onPress={clear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear all"
          >
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>

      {providers.length === 0 ? (
        <EmptyState
          icon="git-compare-outline"
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
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => remove(p.id)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${p.name}`}
                    >
                      <Ionicons name="close" size={14} color={c.text.inverse} />
                    </Pressable>
                    <Image
                      source={{ uri: p.photo }}
                      style={styles.avatar}
                      contentFit="cover"
                      transition={150}
                      cachePolicy="memory-disk"
                    />
                    <Text style={styles.headName} numberOfLines={2}>
                      {p.name}
                    </Text>
                    <RatingStars value={p.rating} size={12} />
                  </View>
                ))}
              </View>

              {rows.map((r, idx) => (
                <View key={r.key} style={[styles.row, idx % 2 === 0 && styles.rowAlt]}>
                  <View style={styles.rowLabelCell}>
                    <Text style={styles.rowLabel}>{r.label}</Text>
                  </View>
                  {providers.map((p) => (
                    <View key={p.id} style={styles.valueCell}>
                      <Text style={styles.value}>{r.render(p.id)}</Text>
                    </View>
                  ))}
                </View>
              ))}

              <View style={styles.row}>
                <View style={styles.rowLabelCell} />
                {providers.map((p) => (
                  <View key={p.id} style={styles.valueCell}>
                    <Pressable
                      style={styles.viewBtn}
                      onPress={() => router.push(`/provider/${p.id}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${p.name}`}
                    >
                      <Text style={styles.viewBtnText}>View</Text>
                    </Pressable>
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
    title: { flex: 1, ...typography.scale.h1, color: c.text.primary },
    clear: { ...typography.scale.smallMedium, color: c.brand.tint },
    row: { flexDirection: 'row', borderRadius: radius.md },
    rowAlt: { backgroundColor: c.background.muted },
    rowLabelCell: { width: 96, paddingVertical: spacing.md, justifyContent: 'center' },
    rowLabel: { ...typography.scale.caption, color: c.text.muted },
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
    headName: { ...typography.scale.smallMedium, color: c.text.primary, textAlign: 'center' },
    valueCell: {
      width: COL_W,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: { ...typography.scale.small, color: c.text.primary, textAlign: 'center' },
    viewBtn: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.brand.primary,
      minHeight: 40,
      justifyContent: 'center',
    },
    viewBtnText: {
      ...typography.scale.smallMedium,
      color: c.text.inverse,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
  });
