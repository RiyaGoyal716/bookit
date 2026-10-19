import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens, radius, spacing, spring, shadow } from '../../theme';
import { useMoney, useIsRTL } from '../../i18n';
import { route } from '../../lib/nav';
import { useCartStore } from '../../stores/cartStore';
import { Text } from './Text';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';

export interface BookingBarProps {
  /** Extra bottom offset above the safe-area inset (e.g. clearing a tab bar). */
  offset?: number;
  /** Override the default navigation to checkout at the Time step. */
  onPress?: () => void;
}

/**
 * NOVA v3 floating ink basket capsule. Reads the cart store: slides up when the
 * first service is added, bumps on change, and hides at zero. Tapping opens
 * checkout at the Time step.
 */
export function BookingBar({ offset = 86, onPress }: BookingBarProps) {
  const t = useTokens();
  const money = useMoney();
  const rtl = useIsRTL();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const total = useCartStore((s) => s.breakdown().total);

  const bump = useSharedValue(1);
  useEffect(() => {
    if (reduced || count === 0) return;
    bump.value = withSequence(withTiming(1.05, { duration: 110 }), withSpring(1, spring.snappy));
  }, [count, reduced, bump]);
  const bumpStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

  if (count === 0) return null;

  const go = onPress ?? (() => router.push(route('/checkout?step=time')));
  const dir = rtl ? ('row-reverse' as const) : ('row' as const);

  return (
    <Animated.View
      entering={reduced ? undefined : SlideInDown.springify().damping(20)}
      exiting={reduced ? undefined : SlideOutDown.duration(200)}
      style={[styles.wrap, { left: spacing.lg, right: spacing.lg, bottom: insets.bottom + offset }]}
      pointerEvents="box-none"
    >
      <Animated.View style={bumpStyle}>
        <PressableScale
          onPress={go}
          haptic="medium"
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel={`${count} services, ${money(total)}. Pick a time`}
          style={[styles.bar, shadow.floating, { backgroundColor: t.primary, flexDirection: dir }]}
        >
          <View style={[styles.badge, { backgroundColor: t.brandGreen }]}>
            <Text variant="caption" tabular style={{ color: t.onInverse, fontWeight: '800' }}>
              {count}
            </Text>
          </View>
          <View style={styles.center}>
            <Text variant="caption" style={{ color: t.onPrimary, opacity: 0.85 }} numberOfLines={1}>
              {count} {count === 1 ? 'service' : 'services'} · {money(total)}
            </Text>
          </View>
          <View style={[styles.cta, { flexDirection: dir }]}>
            <Text variant="headline" style={{ color: t.onPrimary }}>
              Pick a time
            </Text>
            <Icon name={rtl ? 'chevron-left' : 'chevron-right'} size={20} color={t.onPrimary} />
          </View>
        </PressableScale>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  bar: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  badge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1 },
  cta: { alignItems: 'center', gap: spacing.xs },
});
