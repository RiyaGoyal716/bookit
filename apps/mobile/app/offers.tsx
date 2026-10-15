import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, IconButton, Text } from '../src/components/ui';
import { useT, useMoney, useDirectionalStyles } from '../src/i18n';
import { providers as allProviders } from '../src/mocks';
import type { Provider } from '../src/mocks/types';
import { route } from '../src/lib/nav';
import { useColors, radius, spacing, shadow, type Palette } from '../src/theme';

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
        <IconButton
          name="chevron-left"
          size={24}
          onPress={() => router.replace(route('/(tabs)'))}
          accessibilityLabel={t('common.back')}
        />
        <Text variant="title2">{t('postJob.offersTitle')}</Text>
        <IconButton
          name="compare"
          size={24}
          onPress={() => setCompare((v) => !v)}
          accessibilityLabel={t('postJob.compare')}
          color={compare ? c.brand.primary : c.text.secondary}
        />
      </View>

      <Text variant="footnote" tone="success" style={styles.promise}>
        {t('postJob.responsePromise')}
      </Text>

      {compare ? (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.compareCard}>
            <View style={[styles.compareRow, dir.row]}>
              <Text variant="footnote" style={styles.flex2}>
                {t('postJob.compare')}
              </Text>
              {offers.map((o) => (
                <Text key={o.provider.id} variant="footnote" style={styles.flex1} numberOfLines={1}>
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
              values={offers.map((o) => `${o.provider.rating.toFixed(1)}`)}
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
                  <Text variant="headline" style={dir.textAlign} numberOfLines={1}>
                    {o.provider.name}
                  </Text>
                  <View style={[styles.meta, dir.row]}>
                    <Icon name="star" size={16} color={c.brand.star} />
                    <Text variant="caption" tone="muted">
                      {o.provider.rating.toFixed(1)}
                    </Text>
                    <Icon name="clock" size={16} color={c.text.muted} />
                    <Text variant="caption" tone="muted">
                      {o.eta}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text variant="caption" tone="muted" style={styles.quoteLabel}>
                    Quote
                  </Text>
                  <Text variant="title2" tone="accent" tabular>
                    {money(o.quote)}
                  </Text>
                </View>
              </View>
              <Text variant="callout" tone="muted" style={dir.textAlign} numberOfLines={2}>
                {o.provider.bio}
              </Text>
              <Button label={t('postJob.accept')} onPress={() => accept(o)} />
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
      <Text variant="callout" tone="muted" style={styles.flex2}>
        {label}
      </Text>
      {values.map((v, i) => (
        <Text key={i} variant="footnote" style={styles.flex1} numberOfLines={1}>
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
    promise: {
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
    meta: { alignItems: 'center', gap: spacing.xs, marginTop: 2 },
    quoteLabel: { textAlign: 'right' },
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
  });
