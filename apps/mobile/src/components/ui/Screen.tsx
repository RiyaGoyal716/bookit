import { type PropsWithChildren, useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useTokens, spacing, type NovaTokens } from '../../theme';

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

/** NOVA safe-area screen container applying the themed background and gutter. */
export function Screen({
  style,
  children,
  padded = true,
  edges = ['top', 'bottom'],
  keyboardAvoiding = false,
  ...rest
}: ScreenProps) {
  const t = useTokens();
  const styles = useMemo(() => makeStyles(t), [t]);

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

const makeStyles = (t: NovaTokens) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    flex: { flex: 1 },
    screen: { flex: 1 },
    padded: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  });
