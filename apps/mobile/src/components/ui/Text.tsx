import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { useTokens, typography, tabular as tabularStyle } from '../../theme';

export type TextVariant =
  | 'display'
  | 'title1'
  | 'title2'
  | 'headline'
  | 'body'
  | 'callout'
  | 'footnote'
  | 'caption'
  | 'micro';

export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'accent'
  | 'onPrimary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'inverse';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Use tabular figures (prices, times, counts). */
  tabular?: boolean;
  /** Centre the text. */
  center?: boolean;
}

/**
 * The NOVA Text primitive. Raw react-native `<Text>` is banned outside this
 * file — every string flows through a variant + semantic tone.
 */
export function Text({
  variant = 'body',
  tone = 'default',
  tabular,
  center,
  style,
  ...rest
}: TextProps) {
  const t = useTokens();
  const toneColor: Record<TextTone, string> = {
    default: t.text,
    muted: t.textMuted,
    subtle: t.textSubtle,
    accent: t.accent,
    onPrimary: t.onPrimary,
    success: t.success,
    warning: t.warning,
    danger: t.danger,
    inverse: t.onPrimary,
  };

  return (
    <RNText
      style={[
        typography.scale[variant],
        { color: toneColor[tone] },
        tabular && tabularStyle,
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({ center: { textAlign: 'center' } });
