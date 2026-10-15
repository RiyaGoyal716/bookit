import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useTokens, useColorSchemeName, radius, spacing, shadow, spring } from '../../theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { haptics } from '../../lib/haptics';

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

/** Blurred floating tab bar with an animated active pill and badges. */
export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);

  const count = state.routes.length;
  const seg = w > 0 ? w / count : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    if (seg <= 0) return;
    const target = seg * state.index;

    x.value = reduced ? target : withSpring(target, spring.snappy);
  }, [seg, state.index, reduced, x]);

  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }], width: seg }));

  return (
    <View
      style={[styles.wrap, { paddingBottom: insets.bottom || spacing.md }]}
      pointerEvents="box-none"
    >
      <View
        style={[styles.bar, shadow.floating, { borderColor: t.border }]}
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      >
        <BlurView intensity={40} tint={scheme} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.surface, opacity: 0.72 }]} />
        {seg > 0 && (
          <Animated.View style={[styles.pillWrap, pill]}>
            <View style={[styles.pill, { backgroundColor: t.accentSoft }]} />
          </Animated.View>
        )}
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const badge = options.tabBarBadge;
          const iconName = TAB_ICONS[route.name] ?? 'home';

          return (
            <Pressable
              key={route.key}
              style={styles.item}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  haptics.selection();
                  navigation.navigate(route.name);
                }
              }}
            >
              <View>
                <Icon
                  name={iconName}
                  size={24}
                  color={focused ? t.accent : t.textMuted}
                  strokeWidth={focused ? 2 : 1.75}
                />
                {badge != null && (
                  <View
                    style={[styles.badge, { backgroundColor: t.danger, borderColor: t.surface }]}
                  >
                    <Text
                      variant="micro"
                      style={{ color: '#FFFFFF', fontWeight: '700' }}
                      maxFontSizeMultiplier={1.3}
                    >
                      {badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                variant="micro"
                maxFontSizeMultiplier={1.3}
                style={{ color: focused ? t.accent : t.textMuted, fontWeight: '600' }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg },
  bar: {
    flexDirection: 'row',
    height: 62,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  pillWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: { width: 56, height: 40, borderRadius: radius.md },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
