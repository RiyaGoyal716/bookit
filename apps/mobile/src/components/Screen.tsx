import { type PropsWithChildren } from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

export type ScreenProps = PropsWithChildren<
  ViewProps & {
    /** Apply the default horizontal/vertical padding. Default: true. */
    padded?: boolean;
    /** Safe-area edges to inset. Default: top + bottom. */
    edges?: readonly Edge[];
  }
>;

/**
 * Safe-area aware screen container applying the base background and padding.
 */
export function Screen({
  style,
  children,
  padded = true,
  edges = ['top', 'bottom'],
  ...rest
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.screen, padded && styles.padded, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  screen: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
