import { Text, type TextProps, StyleSheet } from 'react-native';

import { colors, typography } from '../theme';

export type ThemedTextVariant = 'title' | 'subtitle' | 'body' | 'caption';

export interface ThemedTextProps extends TextProps {
  variant?: ThemedTextVariant;
}

/**
 * A minimal themed Text wrapper. Placeholder shared component — no logic.
 */
export function ThemedText({ variant = 'body', style, ...rest }: ThemedTextProps) {
  return <Text style={[styles.base, styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  body: {
    fontSize: typography.fontSize.md,
    fontWeight: '400',
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    color: colors.text.secondary,
  },
});
