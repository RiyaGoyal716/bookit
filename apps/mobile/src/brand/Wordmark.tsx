import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTokens, font } from '../theme';

export interface WordmarkProps {
  /** Cap height in px (drives font size). Default 24. */
  size?: number;
  /** Override the text colour. Defaults to the current text colour. */
  color?: string;
}

/**
 * Bookit wordmark — "bookit", lowercase, Bricolage Grotesque 800, −3% tracking,
 * with the second "o" replaced by the green check circle (x-height diameter).
 */
export function Wordmark({ size = 24, color }: WordmarkProps) {
  const t = useTokens();
  const textColor = color ?? t.text;
  const d = size * 0.6; // x-height circle diameter

  const word = (chars: string) => (
    <Text
      allowFontScaling={false}
      style={[styles.word, { color: textColor, fontSize: size, letterSpacing: -size * 0.03 }]}
    >
      {chars}
    </Text>
  );

  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="bookit">
      {word('bo')}
      <Svg width={d} height={d} viewBox="0 0 24 24" style={styles.o}>
        <Circle cx={12} cy={12} r={11} fill={t.brandGreen} />
        <Path
          d="M7 12.5l3.2 3.2 6.4-6.6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      {word('kit')}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  word: { fontFamily: font.titleBold, fontWeight: '800' },
  o: { marginHorizontal: 1, marginBottom: 1 },
});
