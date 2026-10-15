import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { useTokens, radius, spacing, shadow } from '../../theme';

export type CardVariant = 'flat' | 'outlined' | 'raised';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}

/** NOVA surface card. Depth from borders + layered surfaces, not shadows. */
export function Card({ children, variant = 'outlined', padding = spacing.lg, style }: CardProps) {
  const t = useTokens();
  const base: ViewStyle = {
    backgroundColor: variant === 'flat' ? t.bgSubtle : t.surface,
    borderRadius: radius.lg,
    padding,
    borderWidth: variant === 'outlined' ? StyleSheet.hairlineWidth : 0,
    borderColor: t.border,
  };
  return <View style={[base, variant === 'raised' && shadow.floating, style]}>{children}</View>;
}
