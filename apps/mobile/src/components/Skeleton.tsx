import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, type ViewStyle, type DimensionValue } from 'react-native';

import { useColors, radius, type Palette } from '../theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
  style?: ViewStyle;
}

/** Pulsing placeholder block (core Animated API — Expo Go safe). */
export function Skeleton({
  width = '100%',
  height = 16,
  rounded = radius.sm,
  style,
}: SkeletonProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.block, { width, height, borderRadius: rounded, opacity }, style]}
    />
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    block: {
      backgroundColor: c.skeleton,
    },
  });
