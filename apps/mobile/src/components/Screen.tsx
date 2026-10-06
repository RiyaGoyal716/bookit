import { type PropsWithChildren } from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';

import { colors, spacing } from '../theme';

export type ScreenProps = PropsWithChildren<ViewProps>;

/**
 * A simple screen container that applies the base background and padding.
 * Placeholder shared component — no logic.
 */
export function Screen({ style, children, ...rest }: ScreenProps) {
  return (
    <View style={[styles.screen, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.base,
    padding: spacing.lg,
  },
});
