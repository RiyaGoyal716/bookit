import { type PropsWithChildren, useMemo } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import { useColors, radius, shadow, spacing, type Palette } from '../theme';

export interface CardProps {
  style?: ViewStyle;
}

/** Rounded surface with subtle shadow + border. */
export function Card({ children, style }: PropsWithChildren<CardProps>) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return <View style={[styles.card, style]}>{children}</View>;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.background.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      ...shadow.card,
    },
  });
