import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, Star, Columns3 } from 'lucide-react-native';

import { GradientButton } from '../src/components';
import { useT, useMoney, useDirectionalStyles } from '../src/i18n';
import { providers as allProviders } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { route } from '../src/lib/nav';
import { useColors, radius, spacing, typography, shadow, type Palette } from '../src/theme';

interface Offer {
  provider: Provider;
  quote: number;
  eta: string;
}

export default function OffersScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const money = useMoney();
  const dir = useDirectionalStyles();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [compare, setCompare] = useState(false);

  const offers = useMemo<Offer[]>(() => {
    const picks = [...allProviders].sort((a, b) => b.rating - a.rating).slice(0, 3);
    const etas = ['within 1 hour', 'today, 4pm', 'tomorrow, 9am'];
    return picks.map((provider, i) => ({
      provider,
      quote: provider.priceFrom + 20 + i * 15,
      eta: etas[i],
    }));
  }, []);

  const accept = (o: Offer) => router.replace(route(`/booking/${o.provider.id}`));

  return (
    <View style={styles.root}>
      <View style={[styles.header, dir.row, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={() => router.replace(route('/(tabs)'))}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ChevronLeft size={26} color={c.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('postJob.offersTitle')}</Text>
        <Pressable
          onPress={() => setCompare((v) => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('postJob.compare')}
        >
          <Columns3 size={22} color={compare ? c.brand.primary : c.text.secondary} />
        </Pressable>
      </View>

      <Text style={styles.promise}>{t('postJob.responsePromise')}</Text>

      {compare ? (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.compareCard}>
            <View style={[styles.compareRow, dir.row]}>
              <Text style={[styles.compareHead, styles.flex2]}>{t('postJob.compare')}</Text>
              {offers.map((o) => (
                <Text
                  key={o.provider.id}
                  style={[styles.compareHead, styles.flex1]}
                  numberOfLines={1}
                >
                  {o.provider.name.split(' ')[0]}
                </Text>
              ))}
            </View>
            <CompareLine
              label="Price"
              values={offers.map((o) => money(o.quote))}
              styles={styles}
              dir={dir}
            />
            <CompareLine
              label="Rating"
              values={offers.map((o) => `${o.provider.rating.toFixed(1)}★`)}
              styles={styles}
              dir={dir}
            />
            <CompareLine label="ETA" values={offers.map((o) => o.eta)} styles={styles} dir={dir} />
            <CompareLine
              label="Jobs"
              values={offers.map((o) => `${o.provider.stats?.jobsDone ?? '—'}`)}
              styles={styles}
              dir={dir}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          {offers.map((o) => (
            <View key={o.provider.id} style={styles.card}>
              <View style={[styles.cardTop, dir.row]}>
                <Image
                  source={{ uri: o.provider.photo }}
                  style={styles.photo}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                <View style={styles.flex}>
                  <Text style={[styles.name, dir.textAlign]} numberOfLines={1}>
                    {o.provider.name}
                  </Text>
                  <View style={[styles.meta, dir.row]}>
                    <Star size={13} color={c.brand.star} fill={c.brand.star} />
                    <Text style={styles.metaText}>{o.provider.rating.toFixed(1)}</Text>
                    <Clock size={13} color={c.text.muted} />
                    <Text style={styles.metaText}>{o.eta}</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.quoteLabel}>Quote</Text>
                  <Text style={styles.quote}>{money(o.quote)}</Text>
                </View>
              </View>
              <Text style={[styles.bio, dir.textAlign]} numberOfLines={2}>
                {o.provider.bio}
              </Text>
              <GradientButton label={t('postJob.accept')} onPress={() => accept(o)} glow={false} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function CompareLine({
  label,
  values,
  styles,
  dir,
}: {
  label: string;
  values: string[];
  styles: ReturnType<typeof makeStyles>;
  dir: ReturnType<typeof useDirectionalStyles>;
}) {
  return (
    <View style={[styles.compareRow, dir.row]}>
      <Text style={[styles.compareLabel, styles.flex2]}>{label}</Text>
      {values.map((v, i) => (
        <Text key={i} style={[styles.compareValue, styles.flex1]} numberOfLines={1}>
          {v}
        </Text>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    flex: { flex: 1 },
    flex1: { flex: 1 },
    flex2: { flex: 1.3 },
    header: {
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    headerTitle: { ...typography.scale.h2, color: c.text.primary },
    promise: {
      ...typography.scale.small,
      color: c.status.success,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
    card: {
      backgroundColor: c.background.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadow.card,
    },
    cardTop: { alignItems: 'center', gap: spacing.md },
    photo: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: c.skeleton },
    name: { ...typography.scale.bodyMedium, color: c.text.primary },
    meta: { alignItems: 'center', gap: spacing.xs, marginTop: 2 },
    metaText: { ...typography.scale.caption, color: c.text.secondary },
    quoteLabel: { ...typography.scale.caption, color: c.text.muted, textAlign: 'right' },
    quote: { ...typography.scale.h2, color: c.brand.tint },
    bio: { ...typography.scale.small, color: c.text.secondary },
    compareCard: {
      backgroundColor: c.background.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      ...shadow.card,
    },
    compareRow: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      alignItems: 'center',
      gap: spacing.sm,
    },
    compareHead: { ...typography.scale.smallMedium, color: c.text.primary },
    compareLabel: { ...typography.scale.small, color: c.text.muted },
    compareValue: { ...typography.scale.smallMedium, color: c.text.primary },
  });
