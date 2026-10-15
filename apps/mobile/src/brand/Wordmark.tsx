import { View, Text, StyleSheet } from 'react-native';

import { useTokens, font } from '../theme';

export interface WordmarkProps {
  /** Cap height in px (drives font size). Default 24. */
  size?: number;
  /** Override the text colour. Defaults to the current text colour. */
  color?: string;
}

/**
 * NOVA wordmark — "bookit", lowercase, Inter Tight 700, tight tracking, with
 * the dot of the "i" in the accent colour.
 */
export function Wordmark({ size = 24, color }: WordmarkProps) {
  const t = useTokens();
  const textColor = color ?? t.text;
  const dot = size * 0.13;

  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="bookit">
      <Text
        allowFontScaling={false}
        style={[styles.word, { color: textColor, fontSize: size, letterSpacing: -size * 0.04 }]}
      >
        booki
      </Text>
      <View>
        <Text
          allowFontScaling={false}
          style={[styles.word, { color: textColor, fontSize: size, letterSpacing: -size * 0.04 }]}
        >
          t
        </Text>
      </View>
      {/* Accent dot sitting over the dotless-looking "i" junction */}
      <View
        style={{
          position: 'absolute',
          left: size * 2.33,
          top: size * 0.08,
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: t.accent,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  word: { fontFamily: font.titleBold, fontWeight: '700' },
});
