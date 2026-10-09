import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, G } from 'react-native-svg';

import { useColors, typography } from '../theme';

export interface LogoProps {
  /** Pixel size of the square icon mark. Default 48. */
  size?: number;
  /** Render the "Bookit" wordmark beside the mark. Default false. */
  withWordmark?: boolean;
  /** Override the mark's square fill colour. Defaults to brand primary. */
  square?: string;
  /** Override the glyph colour. Defaults to white. */
  glyph?: string;
}

/**
 * Bookit logo — a rounded teal square with a white calendar-check glyph,
 * drawn with react-native-svg so it scales crisply at any size and theme.
 */
export function Logo({ size = 48, withWordmark = false, square, glyph }: LogoProps) {
  const c = useColors();
  const squareFill = square ?? c.brand.primary;
  const glyphColor = glyph ?? c.text.inverse;

  const mark = (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityRole="image"
      accessibilityLabel="Bookit logo"
    >
      <Rect x={2} y={2} width={60} height={60} rx={17} fill={squareFill} />
      <G
        stroke={glyphColor}
        strokeWidth={3.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <Rect x={17} y={22} width={30} height={28} rx={5} />
        <Path d="M24 16 V24" />
        <Path d="M40 16 V24" />
        <Path d="M17 31 H47" />
        <Path d="M24.5 40 L30 45.5 L41 34.5" />
      </G>
    </Svg>
  );

  if (!withWordmark) return mark;

  return (
    <View style={styles.row}>
      {mark}
      <Text style={[styles.wordmark, { color: c.text.primary }]}>
        Book<Text style={{ color: c.brand.tint }}>it</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordmark: {
    fontFamily: typography.font.bold,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});
