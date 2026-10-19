import { useEffect } from 'react';
import { View, Pressable, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';

import {
  useTokens,
  useColorSchemeName,
  radius,
  spacing,
  spring,
  categoryStyle,
  categoryTint,
} from '../../theme';
import { useMoney, useIsRTL } from '../../i18n';
import { haptics } from '../../lib/haptics';
import { useCartStore } from '../../stores/cartStore';
import { Fluent3D, type Fluent3DKey } from '../../assets/3d';
import { Text } from './Text';
import { Icon } from './Icon';
import { Rating } from './Rating';
import { PressableScale } from './PressableScale';

export interface ServiceCardProps {
  /** Category slug — drives the image tint + Fluent 3D icon. */
  categorySlug: string;
  /** Service title (2-line clamp). */
  title: string;
  /** Duration in minutes (shown as a chip). */
  durationMin: number;
  /** Unit price in whole GBP. */
  price: number;
  /** Optional struck-out "was" price in whole GBP. */
  oldPrice?: number;
  /** Optional coral tag, e.g. "POPULAR" / "20% OFF". */
  tag?: string;
  rating?: number;
  ratingCount?: number;
  // Basket wiring -----------------------------------------------------------
  /** Stable cart key (unique per service within a provider). */
  cartKey: string;
  providerId: string;
  providerName: string;
  /** Tap the card body (open the provider / service). */
  onPress?: () => void;
  /** Fixed width (rails); omit to flex in a grid. */
  width?: number;
  style?: StyleProp<ViewStyle>;
}

const COLLAPSED = 36;
const EXPANDED = 108;

/**
 * NOVA v3 "Bookit-original" service card. Tinted image area with the category's
 * Fluent 3D icon, optional coral tag, duration chip, 2-line title, rating and a
 * price row that ends in a round ink "+" which morphs into a "− n +" stepper
 * once the service is in the basket.
 */
export function ServiceCard({
  categorySlug,
  title,
  durationMin,
  price,
  oldPrice,
  tag,
  rating,
  ratingCount,
  cartKey,
  providerId,
  providerName,
  onPress,
  width,
  style,
}: ServiceCardProps) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const money = useMoney();
  const rtl = useIsRTL();
  const art = categoryStyle(categorySlug).art as Fluent3DKey;
  const tint = categoryTint(categorySlug, scheme);

  const qty = useCartStore(
    (s) =>
      (s.providerId === providerId ? s.items.find((i) => i.key === cartKey)?.quantity : 0) ?? 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const decrement = useCartStore((s) => s.decrement);

  const add = () => {
    haptics.medium();
    addItem({ key: cartKey, providerId, providerName, name: title, price, durationMin });
  };
  const remove = () => {
    haptics.selection();
    decrement(cartKey);
  };

  const row: ViewStyle = { flexDirection: rtl ? 'row-reverse' : 'row' };

  return (
    <PressableScale
      onPress={onPress}
      haptic={null}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${money(price)}`}
      style={[
        styles.card,
        { borderColor: t.border, backgroundColor: t.surface },
        width ? { width } : styles.flex,
        style,
      ]}
    >
      <View style={[styles.image, { backgroundColor: tint }]}>
        <Fluent3D name={art} size={64} style={styles.art} />
        {tag ? (
          <View style={[styles.tag, { backgroundColor: t.coral }]}>
            <Text variant="micro" style={{ color: t.onInverse }}>
              {tag}
            </Text>
          </View>
        ) : null}
        <View style={[styles.duration, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Icon name="clock" size={16} color={t.textMuted} />
          <Text variant="caption" tone="muted" tabular>
            {durationMin} min
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text variant="headline" numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        {typeof rating === 'number' ? <Rating value={rating} count={ratingCount} /> : null}
        <View style={[styles.priceRow, row]}>
          <View style={[styles.priceCol, row]}>
            <Text variant="headline" tabular>
              {money(price)}
            </Text>
            {typeof oldPrice === 'number' && oldPrice > price ? (
              <Text variant="footnote" tone="subtle" tabular style={styles.strike}>
                {money(oldPrice)}
              </Text>
            ) : null}
          </View>
          <AddControl qty={qty} title={title} onAdd={add} onRemove={remove} />
        </View>
      </View>
    </PressableScale>
  );
}

function AddControl({
  qty,
  title,
  onAdd,
  onRemove,
}: {
  qty: number;
  title: string;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const t = useTokens();
  const reduced = useReducedMotion();
  const expanded = qty > 0;
  const w = useSharedValue(expanded ? EXPANDED : COLLAPSED);

  useEffect(() => {
    const target = expanded ? EXPANDED : COLLAPSED;
    w.value = reduced ? target : withSpring(target, spring.snappy);
  }, [expanded, reduced, w]);

  const widthStyle = useAnimatedStyle(() => ({ width: w.value }));

  return (
    <Animated.View style={[styles.addPill, { backgroundColor: t.primary }, widthStyle]}>
      {expanded ? (
        <View style={styles.stepperRow}>
          <Pressable
            onPress={onRemove}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Remove one ${title}`}
            style={styles.stepBtn}
          >
            <Icon name="minus" size={20} color={t.onPrimary} />
          </Pressable>
          <Animated.View key={qty} entering={reduced ? undefined : FadeIn.duration(120)}>
            <Text variant="headline" tabular style={{ color: t.onPrimary }}>
              {qty}
            </Text>
          </Animated.View>
          <Pressable
            onPress={onAdd}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Add one ${title}`}
            style={styles.stepBtn}
          >
            <Icon name="plus" size={20} color={t.onPrimary} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={onAdd}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Add ${title}`}
          style={styles.addBtn}
        >
          <Icon name="plus" size={20} color={t.onPrimary} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  flex: { flex: 1 },
  image: { height: 104, alignItems: 'center', justifyContent: 'center' },
  art: {},
  tag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  duration: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { minHeight: 44 },
  priceRow: { alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  priceCol: { alignItems: 'baseline', gap: spacing.xs },
  strike: { textDecorationLine: 'line-through' },
  addPill: { height: COLLAPSED, borderRadius: radius.pill, overflow: 'hidden' },
  addBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stepperRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  stepBtn: { width: 32, height: COLLAPSED, alignItems: 'center', justifyContent: 'center' },
});
