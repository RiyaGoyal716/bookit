import { useEffect } from 'react';
import { View, StyleSheet, RefreshControl, type RefreshControlProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';

import { useTokens, spacing } from '../../theme';
import { LogoMark } from '../../brand';

/**
 * Branded refresh indicator: the Bookit logo mark "draws on" (scales + sweeps)
 * and gently pulses while a list is refreshing. Overlay it at the top of a
 * scroll view; it renders nothing when idle. Honours Reduce Motion.
 */
export function LogoRefresh({
  refreshing,
  topInset = 0,
}: {
  refreshing: boolean;
  topInset?: number;
}) {
  const t = useTokens();
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      progress.value = reduced
        ? 1
        : withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
      if (!reduced) {
        spin.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
            withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
        );
      }
    } else {
      cancelAnimation(spin);
      spin.value = 0;
      progress.value = reduced ? 0 : withTiming(0, { duration: 180 });
    }
    return () => cancelAnimation(spin);
  }, [refreshing, reduced, progress, spin]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.7 + progress.value * 0.3 }, { translateY: (1 - progress.value) * -8 }],
  }));

  if (!refreshing) return null;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: topInset + spacing.sm }]}>
      <Animated.View
        style={[styles.badge, { backgroundColor: t.surfaceRaised, borderColor: t.border }, style]}
      >
        <LogoMark size={22} color={t.accent} />
      </Animated.View>
    </View>
  );
}

/** A RefreshControl pre-tinted with the brand accent for consistency. */
export function brandRefreshControl(
  t: { accent: string; surface: string },
  props: Pick<RefreshControlProps, 'refreshing' | 'onRefresh'>,
) {
  return (
    <RefreshControl
      refreshing={props.refreshing}
      onRefresh={props.onRefresh}
      tintColor={t.accent}
      colors={[t.accent]}
      progressBackgroundColor={t.surface}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
