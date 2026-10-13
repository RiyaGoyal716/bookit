import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const W = 320;
const H = 200;

/** Route waypoints (pro → you), normalised to the viewBox. */
const POINTS: { x: number; y: number }[] = [
  { x: 36, y: 40 },
  { x: 96, y: 56 },
  { x: 120, y: 120 },
  { x: 190, y: 132 },
  { x: 214, y: 78 },
  { x: 284, y: 160 },
];

const ROUTE_D = POINTS.reduce(
  (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
  '',
);

/** Cumulative segment fractions along the polyline (0..1). */
function cumulative(): number[] {
  const dists: number[] = [0];
  let total = 0;
  for (let i = 1; i < POINTS.length; i += 1) {
    const dx = POINTS[i].x - POINTS[i - 1].x;
    const dy = POINTS[i].y - POINTS[i - 1].y;
    total += Math.hypot(dx, dy);
    dists.push(total);
  }
  return dists.map((d) => d / total);
}

export interface RouteMapTrackerProps {
  /** Target progress of the pro along the route, 0..1. */
  progress: number;
  height?: number;
}

/**
 * Expo Go-safe live-tracking map: an animated pro marker that eases along an
 * SVG route placeholder (no react-native-maps). The marker position is derived
 * in a reanimated worklet by interpolating `progress` across the polyline
 * waypoints, so it moves smoothly as the booking status advances.
 */
export function RouteMapTracker({ progress, height = H }: RouteMapTrackerProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const fracs = useMemo(() => cumulative(), []);
  const xs = useMemo(() => POINTS.map((p) => p.x), []);
  const ys = useMemo(() => POINTS.map((p) => p.y), []);
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(1, progress)), {
      duration: 1400,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [progress, p]);

  const markerProps = useAnimatedProps(() => {
    const cx = interpolate(p.value, fracs, xs);
    const cy = interpolate(p.value, fracs, ys);
    return { cx, cy };
  });

  const haloProps = useAnimatedProps(() => {
    const cx = interpolate(p.value, fracs, xs);
    const cy = interpolate(p.value, fracs, ys);
    return { cx, cy };
  });

  return (
    <View
      style={[styles.wrap, { height }]}
      accessibilityRole="image"
      accessibilityLabel="Live tracking map"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect x={0} y={0} width={W} height={height} fill={c.background.muted} />
        {/* blocks */}
        <G opacity={0.6}>
          <Rect x={20} y={20} width={64} height={44} rx={6} fill={c.background.surface} />
          <Rect x={150} y={24} width={54} height={40} rx={6} fill={c.background.surface} />
          <Rect x={230} y={30} width={64} height={48} rx={6} fill={c.status.successSoft} />
          <Rect x={60} y={140} width={70} height={46} rx={6} fill={c.background.surface} />
        </G>
        <G stroke={c.border} strokeWidth={5} opacity={0.7}>
          <Line x1={0} y1={100} x2={W} y2={100} />
          <Line x1={140} y1={0} x2={140} y2={height} />
        </G>
        {/* route */}
        <Path d={ROUTE_D} stroke={c.border} strokeWidth={6} fill="none" strokeLinecap="round" />
        <Path
          d={ROUTE_D}
          stroke={c.brand.primary}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
        {/* destination (you) */}
        <Circle
          cx={POINTS[POINTS.length - 1].x}
          cy={POINTS[POINTS.length - 1].y}
          r={8}
          fill={c.brand.accent}
          stroke={c.background.surface}
          strokeWidth={2.5}
        />
        {/* pro marker */}
        <AnimatedCircle animatedProps={haloProps} r={16} fill={c.brand.primary} opacity={0.18} />
        <AnimatedCircle
          animatedProps={markerProps}
          r={8}
          fill={c.brand.primary}
          stroke={c.background.surface}
          strokeWidth={3}
        />
      </Svg>

      <View style={styles.legend} pointerEvents="none">
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: c.brand.primary }]} />
          <Text style={styles.legendText}>Pro</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="location" size={12} color={c.brand.accent} />
          <Text style={styles.legendText}>You</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    legend: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      flexDirection: 'row',
      gap: spacing.md,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { ...typography.scale.caption, fontSize: 10, color: c.text.secondary },
  });
