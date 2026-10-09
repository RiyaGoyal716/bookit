import { type PropsWithChildren, useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useColors, spacing, type Palette } from '../theme';

export type ScreenProps = PropsWithChildren<
  ViewProps & {
    /** Apply the default horizontal/vertical padding. Default: true. */
    padded?: boolean;
    /** Safe-area edges to inset. Default: top + bottom. */
    edges?: readonly Edge[];
    /** Wrap children in a KeyboardAvoidingView (for form screens). */
    keyboardAvoiding?: boolean;
  }
>;

/** Safe-area aware screen container applying the themed background and padding. */
export function Screen({
  style,
  children,
  padded = true,
  edges = ['top', 'bottom'],
  keyboardAvoiding = false,
  ...rest
}: ScreenProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const inner = (
    <View style={[styles.screen, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background.base,
    },
    flex: { flex: 1 },
    screen: {
      flex: 1,
    },
    padded: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
    },
  });
