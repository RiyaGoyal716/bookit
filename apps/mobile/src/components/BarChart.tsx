import { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarDatum[];
  height?: number;
  /** Formats the max-value gridline caption (e.g. a money formatter). */
  formatValue?: (v: number) => string;
  /** Index of a bar to highlight (e.g. "today"). */
  highlightIndex?: number;
  style?: ViewStyle;
}

/**
 * Custom bar chart drawn with react-native-svg (no chart library). Bars use the
 * Aurora indigo→cyan gradient; a highlighted bar uses the coral accent. Scales
 * to the container width. Used for weekly earnings and wallet activity.
 */
export function BarChart({
  data,
  height = 160,
  formatValue = (v) => `${v}`,
  highlightIndex,
  style,
}: BarChartProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const W = 320;
  const chartH = height - 28;
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length || 1;
  const slot = W / n;
  const barW = Math.min(28, slot * 0.5);

  return (
    <View style={[styles.wrap, style]} accessibilityRole="image">
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.brand.gradient[0]} />
            <Stop offset="1" stopColor={c.brand.gradient[1]} />
          </LinearGradient>
        </Defs>
        {/* gridlines */}
        {[0, 0.5, 1].map((g) => (
          <Line
            key={g}
            x1={0}
            y1={chartH - chartH * g}
            x2={W}
            y2={chartH - chartH * g}
            stroke={c.border}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}
        {data.map((d, i) => {
          const h = Math.max(2, (d.value / max) * (chartH - 6));
          const x = i * slot + (slot - barW) / 2;
          const y = chartH - h;
          const highlighted = i === highlightIndex;
          return (
            <Rect
              key={d.label}
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={6}
              fill={highlighted ? c.brand.accent : 'url(#barGrad)'}
            />
          );
        })}
      </Svg>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <Text
            key={d.label}
            style={[styles.label, i === highlightIndex && styles.labelActive]}
            numberOfLines={1}
          >
            {d.label}
          </Text>
        ))}
      </View>
      <Text style={styles.max}>{formatValue(max)}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { position: 'relative' },
    labels: {
      flexDirection: 'row',
      marginTop: spacing.xs,
    },
    label: {
      flex: 1,
      textAlign: 'center',
      ...typography.scale.caption,
      fontSize: 10,
      color: c.text.muted,
    },
    labelActive: { color: c.brand.accent, fontFamily: typography.font.bold, fontWeight: '700' },
    max: {
      position: 'absolute',
      top: -2,
      right: 0,
      ...typography.scale.caption,
      fontSize: 10,
      color: c.text.muted,
      backgroundColor: c.background.surface,
      paddingHorizontal: 4,
      borderRadius: radius.sm,
    },
  });
