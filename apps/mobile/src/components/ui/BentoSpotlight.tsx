import { View, StyleSheet } from 'react-native';

import {
  useTokens,
  radius,
  spacing,
  categoryStyle,
  categoryTint,
  useColorSchemeName,
} from '../../theme';
import { useMoney, useIsRTL } from '../../i18n';
import { Fluent3D, type Fluent3DKey } from '../../assets/3d';
import { Text } from './Text';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

export interface BentoItem {
  categorySlug: string;
  title: string;
  /** "from" price in whole GBP. */
  fromPrice: number;
  onPress?: () => void;
}

export interface BentoSpotlightProps {
  /** First item renders as the large 2×2 tile; the next three as small tiles. */
  items: BentoItem[];
}

/** NOVA v3 "Today's picks" bento: one large tile + three small tiles. */
export function BentoSpotlight({ items }: BentoSpotlightProps) {
  const [big, ...rest] = items;
  const small = rest.slice(0, 3);
  if (!big) return null;
  return (
    <View style={styles.row}>
      <View style={styles.bigCol}>
        <Tile item={big} large />
      </View>
      <View style={styles.smallCol}>
        {small.map((it) => (
          <Tile key={it.categorySlug + it.title} item={it} />
        ))}
      </View>
    </View>
  );
}

function Tile({ item, large }: { item: BentoItem; large?: boolean }) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const money = useMoney();
  const rtl = useIsRTL();
  const art = categoryStyle(item.categorySlug).art as Fluent3DKey;
  const tint = categoryTint(item.categorySlug, scheme);
  const dir = rtl ? ('row-reverse' as const) : ('row' as const);

  return (
    <PressableScale
      onPress={item.onPress}
      haptic="selection"
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, from ${money(item.fromPrice)}`}
      style={[large ? styles.bigTile : styles.smallTile, { backgroundColor: tint }]}
    >
      <Fluent3D
        name={art}
        size={large ? 128 : 72}
        style={[styles.art, large ? styles.artBig : styles.artSmall]}
      />
      <View style={styles.content}>
        <Text variant={large ? 'title2' : 'headline'} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={[styles.footer, { flexDirection: dir }]}>
          <Text variant="footnote" tabular style={styles.from}>
            from {money(item.fromPrice)}
          </Text>
          <Icon name={rtl ? 'arrow-left' : 'arrow-right'} size={16} color={t.text} />
        </View>
      </View>
    </PressableScale>
  );
}

const SMALL_H = 72;
const BIG_H = SMALL_H * 3 + spacing.sm * 2;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  bigCol: { flex: 1 },
  smallCol: { flex: 1, gap: spacing.sm },
  bigTile: {
    height: BIG_H,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  smallTile: {
    height: SMALL_H,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  art: { position: 'absolute' },
  artBig: { right: -20, top: -12 },
  artSmall: { right: -12, bottom: -10, opacity: 0.9 },
  content: { gap: spacing.xs },
  footer: { alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  from: { fontWeight: '700' },
});
