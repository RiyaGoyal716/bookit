import { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';

import { useTokens, radius, spacing, typography, getEasing } from '../../theme';
import { Text } from './Text';
import { haptics } from '../../lib/haptics';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  helper?: string;
}

/** Labelled input with inline validation + a shake/error haptic on error. */
export function TextField({
  label,
  error,
  helper,
  value,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const t = useTokens();
  const reduced = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!error) return;
    haptics.warning();
    if (reduced) return;
    shake.value = withSequence(
      withTiming(-6, { duration: 50, easing: getEasing() }),
      withTiming(6, { duration: 50, easing: getEasing() }),
      withTiming(-4, { duration: 50, easing: getEasing() }),
      withTiming(0, { duration: 50, easing: getEasing() }),
    );
  }, [error, reduced, shake]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const borderColor = error ? t.danger : focused ? t.accent : t.border;

  return (
    <View style={styles.wrap}>
      <Text variant="footnote" tone={error ? 'danger' : 'muted'} style={{ fontWeight: '600' }}>
        {label}
      </Text>
      <Animated.View
        style={[styles.field, { borderColor, backgroundColor: t.surface }, shakeStyle]}
      >
        <TextInput
          style={[styles.input, { color: t.text }]}
          value={value}
          placeholderTextColor={t.textSubtle}
          accessibilityLabel={label}
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
      </Animated.View>
      {(error || helper) && (
        <Text variant="caption" tone={error ? 'danger' : 'subtle'}>
          {error ?? helper}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  field: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    height: 48,
    justifyContent: 'center',
  },
  input: {
    fontFamily: typography.font.regular,
    fontSize: typography.scale.body.fontSize,
    padding: 0,
  },
});
