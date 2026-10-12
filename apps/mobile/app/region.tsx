import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Search } from 'lucide-react-native';

import { AuroraBackground, GradientButton } from '../src/components';
import {
  useT,
  useDirectionalStyles,
  REGIONS,
  CURRENCIES,
  regionFlag,
  type Region,
} from '../src/i18n';
import { useRegionStore } from '../src/stores/regionStore';
import { dialCodeFor } from '../src/lib/countries';
import { route } from '../src/lib/nav';
import { useColors, typography, spacing, radius, type Palette } from '../src/theme';

export default function RegionScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const dir = useDirectionalStyles();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const setRegion = useRegionStore((s) => s.setRegion);
  const currentCode = useRegionStore((s) => s.regionCode);
  const [selected, setSelected] = useState<string>(currentCode);
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REGIONS;
    return REGIONS.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q),
    );
  }, [query]);

  const onContinue = () => {
    setRegion(selected);
    router.replace(route('/login'));
  };

  const renderItem = ({ item }: { item: Region }) => {
    const active = item.code === selected;
    const cur = CURRENCIES[item.currency];
    return (
      <Pressable
        onPress={() => {
          setSelected(item.code);
          setRegion(item.code);
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={[styles.row, dir.row, active && styles.rowActive]}
      >
        <Text style={styles.flag}>{regionFlag(item.code)}</Text>
        <View style={styles.rowBody}>
          <Text style={[styles.rowName, dir.textAlign]}>{item.name}</Text>
          <Text style={[styles.rowMeta, dir.textAlign]}>
            {cur.symbol} {item.currency} · +{dialCodeFor(item.code)}
          </Text>
        </View>
        {active ? <Check size={22} color={c.brand.primary} /> : null}
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <AuroraBackground blobs={false} />
        <View style={[styles.heroInner, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={[styles.title, dir.textAlign]}>{t('region.title')}</Text>
          <Text style={[styles.subtitle, dir.textAlign]}>{t('region.subtitle')}</Text>
          <View style={[styles.search, dir.row]}>
            <Search size={18} color={c.text.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('region.searchPlaceholder')}
              placeholderTextColor={c.text.muted}
              style={[styles.searchInput, dir.textAlign]}
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(r) => r.code}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <GradientButton label={t('common.continue')} onPress={onContinue} />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background.base },
    hero: {
      overflow: 'hidden',
      borderBottomLeftRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
    },
    heroInner: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.sm },
    title: { ...typography.scale.display, color: c.text.onBrand },
    subtitle: { ...typography.scale.body, color: c.text.onBrand, opacity: 0.88 },
    search: {
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.background.surface,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      height: 52,
      marginTop: spacing.md,
    },
    searchInput: { flex: 1, ...typography.scale.body, color: c.text.primary },
    list: { padding: spacing.lg, gap: spacing.sm },
    row: {
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.background.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    rowActive: { borderColor: c.brand.primary, backgroundColor: c.brand.primarySoft },
    flag: { fontSize: 30 },
    rowBody: { flex: 1, gap: 2 },
    rowName: { ...typography.scale.bodyMedium, color: c.text.primary },
    rowMeta: { ...typography.scale.small, color: c.text.muted },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background.base,
    },
  });
