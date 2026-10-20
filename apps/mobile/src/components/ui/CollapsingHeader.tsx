import { type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

import { useTokens, useColorSchemeName, spacing, type NovaTokens } from '../../theme';
import { Text } from './Text';

/** Compact sticky-bar height below the safe-area inset. */
export const COLLAPSING_BAR_HEIGHT = 48;

export interface CollapsingHeaderProps {
  title: string;
  /** Drives the fade: large title scrolls away, compact title fades in. */
  scrollY: SharedValue<number>;
  /** Trailing controls (icon buttons). */
  right?: ReactNode;
  /** Leading control (e.g. a back button). */
  left?: ReactNode;
}

/**
 * iOS-style collapsing large title with a blurred sticky bar. The large title
 * lives in the scroll content via <LargeTitle>; this renders the sticky bar
 * that blurs/borders in and fades the compact title in as you scroll, so
 * content never sits under the header.
 */
export function CollapsingHeader({ title, scrollY, right, left }: CollapsingHeaderProps) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(t);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [24, 64], [0, 1], Extrapolation.CLAMP),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 72], [0, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [40, 72], [8, 0], Extrapolation.CLAMP) }],
  }));

  return (
    <View
      style={[styles.bar, { height: insets.top + COLLAPSING_BAR_HEIGHT, paddingTop: insets.top }]}
      pointerEvents="box-none"
    >
      <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
        <BlurView intensity={40} tint={scheme} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.barFill]} />
        <View style={[styles.hairline, { backgroundColor: t.border }]} />
      </Animated.View>
      <View style={styles.row}>
        <View style={styles.side}>{left}</View>
        <Animated.View style={[styles.titleWrap, titleStyle]} pointerEvents="none">
          <Text variant="headline" numberOfLines={1}>
            {title}
          </Text>
        </Animated.View>
        <View style={[styles.side, styles.right]}>{right}</View>
      </View>
    </View>
  );
}

/** The large collapsing title, placed as the first item of the scroll content. */
export function LargeTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={largeStyles.wrap}>
      <Text variant="display">{title}</Text>
      {subtitle ? (
        <Text variant="footnote" tone="muted" style={largeStyles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = (t: NovaTokens) =>
  StyleSheet.create({
    bar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    barFill: { backgroundColor: t.surface, opacity: 0.6 },
    hairline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: StyleSheet.hairlineWidth,
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
    },
    side: { minWidth: 44, flexDirection: 'row', alignItems: 'center' },
    right: { justifyContent: 'flex-end', gap: spacing.xs },
    titleWrap: { flex: 1, alignItems: 'center' },
  });

const largeStyles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: 2 },
  subtitle: { marginTop: 2 },
});
