import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';

import { useTokens, useColorSchemeName, radius, spacing, shadow, spring } from '../../theme';
import { useIsRTL } from '../../i18n';
import { Icon, type IconName, type IconWeightProp } from './Icon';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { haptics } from '../../lib/haptics';
import { useAuthStore } from '../../stores/authStore';
import { TAB_BAR_HEIGHT, TAB_BAR_BOTTOM_GAP, tabBarOffset, scrollTabToTop } from './useTabBarInset';

/** Minimal structural type for the props expo-router's Tabs passes to `tabBar`. */
export interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string; tabBarBadge?: number | string } }>;
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

const TAB_ICONS: Record<string, IconName> = {
  index: 'home',
  explore: 'search',
  bookings: 'calendar',
  inbox: 'messages',
  account: 'user',
};

type Anim = 'squash' | 'rotate' | 'flip' | 'pop' | 'ring';
const TAB_ANIM: Record<string, Anim> = {
  index: 'squash',
  explore: 'rotate',
  bookings: 'flip',
  inbox: 'pop',
  account: 'ring',
};

const AnimatedView = Animated.View;

/** Icon-only blurred floating tab bar: sliding pill, dot, per-tab micro-anims. */
export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const rtl = useIsRTL();
  const user = useAuthStore((s) => s.user);
  const [w, setW] = useState(0);
  const [tooltip, setTooltip] = useState<number | null>(null);

  const count = state.routes.length;
  const seg = w > 0 ? w / count : 0;
  const x = useSharedValue(0);
  const stretch = useSharedValue(1);

  // RTL mirrors the visual order; map a visual slot to the data index.
  const slotFor = (i: number) => (rtl ? count - 1 - i : i);

  useEffect(() => {
    if (seg <= 0) return;
    const target = seg * slotFor(state.index);
    if (reduced) {
      x.value = target;
    } else {
      x.value = withSpring(target, spring.snappy);
      // Pill stretches slightly while travelling, then settles.
      stretch.value = withSequence(
        withTiming(1.18, { duration: 120 }),
        withSpring(1, spring.bouncy),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seg, state.index, reduced, rtl]);

  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { scaleX: stretch.value }],
    width: seg,
  }));

  const barStyle = useAnimatedStyle(() => ({ transform: [{ translateY: tabBarOffset.value }] }));

  return (
    <AnimatedView
      style={[
        styles.wrap,
        { bottom: (insets.bottom || spacing.sm) + TAB_BAR_BOTTOM_GAP },
        barStyle,
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[styles.bar, shadow.floating, { borderColor: t.border }]}
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      >
        <BlurView intensity={40} tint={scheme} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.surface, opacity: 0.72 }]} />
        {seg > 0 && (
          <AnimatedView style={[styles.pillWrap, pill]}>
            <View style={[styles.pill, { backgroundColor: t.primarySoft }]} />
          </AnimatedView>
        )}
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const badge = options.tabBarBadge;
          return (
            <TabItem
              key={route.key}
              route={route.name}
              label={label}
              focused={focused}
              badge={badge}
              anim={TAB_ANIM[route.name] ?? 'pop'}
              icon={TAB_ICONS[route.name] ?? 'home'}
              isAccount={route.name === 'account'}
              userName={user?.name}
              userAvatar={user?.avatar}
              showTooltip={tooltip === i}
              onLongPress={() => {
                haptics.light();
                setTooltip(i);
                setTimeout(() => setTooltip((cur) => (cur === i ? null : cur)), 1400);
              }}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (focused) {
                  // Re-tap active tab -> scroll to top (+ light haptic inside).
                  scrollTabToTop(route.name);
                  return;
                }
                if (!event.defaultPrevented) {
                  haptics.selection();
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </AnimatedView>
  );
}

interface TabItemProps {
  route: string;
  label: string;
  focused: boolean;
  badge?: number | string;
  anim: Anim;
  icon: IconName;
  isAccount: boolean;
  userName?: string;
  userAvatar?: string;
  showTooltip: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({
  label,
  focused,
  badge,
  anim,
  icon,
  isAccount,
  userName,
  userAvatar,
  showTooltip,
  onPress,
  onLongPress,
}: TabItemProps) {
  const t = useTokens();
  const reduced = useReducedMotion();
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      progress.value = focused ? 1 : 0;
      return;
    }
    if (focused) {
      progress.value = 0;
      progress.value = withSpring(1, spring.bouncy);
    } else {
      progress.value = withTiming(0, { duration: 160 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, reduced]);

  const iconStyle = useAnimatedStyle(() => {
    const p = progress.value;
    switch (anim) {
      case 'squash':
        return { transform: [{ scaleX: 1 + 0.18 * p }, { scaleY: 1 - 0.12 * p }] };
      case 'rotate':
        return { transform: [{ rotate: `${interpolate(p, [0, 1], [0, 25])}deg` }] };
      case 'flip':
        return {
          transform: [{ perspective: 400 }, { rotateX: `${interpolate(p, [0, 1], [0, 180])}deg` }],
        };
      case 'pop':
        return { transform: [{ scale: 1 + 0.22 * p }] };
      default:
        return { transform: [{ scale: 1 + 0.08 * p }] };
    }
  });

  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: t.primary,
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.7, 1]) }],
  }));

  const weight: IconWeightProp = focused ? 'fill' : 'regular';

  return (
    <Pressable
      style={styles.item}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
    >
      {showTooltip && (
        <View style={[styles.tooltip, { backgroundColor: t.inverse }]}>
          <Text variant="micro" style={{ color: t.onInverse, fontWeight: '700' }}>
            {label}
          </Text>
        </View>
      )}
      <View style={styles.iconSlot}>
        {isAccount ? (
          <View>
            <AnimatedView style={[styles.accountRing, ringStyle]} pointerEvents="none" />
            <Avatar name={userName ?? 'You'} uri={userAvatar} size={30} />
          </View>
        ) : (
          <AnimatedView style={iconStyle}>
            <Icon name={icon} size={26} color={focused ? t.primary : t.textMuted} weight={weight} />
          </AnimatedView>
        )}
        {badge != null && (
          <View style={[styles.badge, { backgroundColor: t.coral, borderColor: t.surface }]}>
            <Text variant="micro" style={styles.badgeText} maxFontSizeMultiplier={1.3}>
              {badge}
            </Text>
          </View>
        )}
      </View>
      <AnimatedView style={[styles.dot, { backgroundColor: t.primary }, dotStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconSlot: { alignItems: 'center', justifyContent: 'center' },
  pillWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: { width: 56, height: 44, borderRadius: radius.lg },
  dot: { width: 4, height: 4, borderRadius: 2, position: 'absolute', bottom: 8 },
  accountRing: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: radius.pill,
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeText: { color: '#FFFFFF', fontWeight: '700' },
  tooltip: {
    position: 'absolute',
    top: -34,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
});
