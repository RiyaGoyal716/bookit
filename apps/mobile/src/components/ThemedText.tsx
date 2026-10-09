import { Text, type TextProps, StyleSheet } from 'react-native';

import { useColors, typography } from '../theme';

export type ThemedTextVariant =
  'display' | 'h1' | 'h2' | 'body' | 'bodyMedium' | 'small' | 'smallMedium' | 'caption';

export type ThemedTextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'tint';

export interface ThemedTextProps extends TextProps {
  variant?: ThemedTextVariant;
  /** Semantic colour from the active palette. Default: primary. */
  color?: ThemedTextColor;
}

/**
 * Typographic Text primitive. Variants map to the type scale (Inter) and the
 * colour follows the active light/dark palette — so there are no raw font
 * sizes or hex colours in screens.
 */
export function ThemedText({
  variant = 'body',
  color = 'primary',
  style,
  ...rest
}: ThemedTextProps) {
  const c = useColors();
  const palette = {
    primary: c.text.primary,
    secondary: c.text.secondary,
    muted: c.text.muted,
    inverse: c.text.inverse,
    tint: c.brand.tint,
  } as const;

  return <Text style={[styles[variant], { color: palette[color] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  display: typography.scale.display,
  h1: typography.scale.h1,
  h2: typography.scale.h2,
  body: typography.scale.body,
  bodyMedium: typography.scale.bodyMedium,
  small: typography.scale.small,
  smallMedium: typography.scale.smallMedium,
  caption: typography.scale.caption,
});
