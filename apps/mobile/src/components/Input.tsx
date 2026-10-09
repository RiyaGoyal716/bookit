import { forwardRef, useMemo, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  /** Error message — shown in danger colour and draws a danger focus ring. */
  error?: string;
  /** Helper text shown below when there is no error. */
  helper?: string;
  containerStyle?: ViewStyle;
  /** Left adornment (e.g. a country prefix or icon). */
  left?: ReactNode;
}

/** Labelled text field with helper/error text and a focus ring. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, helper, containerStyle, left, style, onFocus, onBlur, multiline, ...rest },
  ref,
) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {left}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={c.text.muted}
          multiline={multiline}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    label: {
      ...typography.scale.smallMedium,
      color: c.text.secondary,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 56,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background.surface,
    },
    fieldMultiline: {
      minHeight: 96,
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
    },
    fieldFocused: {
      borderColor: c.brand.primary,
      backgroundColor: c.background.surface,
    },
    fieldError: {
      borderColor: c.status.danger,
    },
    input: {
      flex: 1,
      ...typography.scale.body,
      color: c.text.primary,
      padding: 0,
      textAlignVertical: 'top',
    },
    helper: {
      ...typography.scale.caption,
      color: c.text.muted,
    },
    error: {
      ...typography.scale.caption,
      color: c.status.danger,
    },
  });
