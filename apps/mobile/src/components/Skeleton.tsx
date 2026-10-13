import { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  type LayoutChangeEvent,
  type ViewStyle,
  type DimensionValue,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors, radius, type Palette } from '../theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
  style?: ViewStyle;
}

/**
 * Shimmering placeholder block. A highlight band sweeps across the base using
 * moti (pure-JS on reanimated — Expo Go safe). Falls back to the base block
 * until the width is measured.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  rounded = radius.sm,
  style,
}: SkeletonProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [w, setW] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const measured = e.nativeEvent.layout.width;
    if (measured && Math.abs(measured - w) > 1) setW(measured);
  };

  const band = Math.max(60, w * 0.5);

  return (
    <View
      onLayout={onLayout}
      style={[styles.block, { width, height, borderRadius: rounded }, style]}
    >
      {w > 0 ? (
        <MotiView
          from={{ translateX: -band }}
          animate={{ translateX: w }}
          transition={{ type: 'timing', duration: 1100, loop: true, repeatReverse: false }}
          style={[StyleSheet.absoluteFill, { width: band }]}
        >
          <LinearGradient
            colors={['transparent', c.background.surface, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </MotiView>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    block: {
      backgroundColor: c.skeleton,
      overflow: 'hidden',
    },
  });
