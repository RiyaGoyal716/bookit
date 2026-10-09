import { type PropsWithChildren } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '../theme';

export interface CardProps {
  style?: ViewStyle;
}

/** Rounded surface with subtle shadow + border. */
export function Card({ children, style }: PropsWithChildren<CardProps>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadow.card,
  },
});
