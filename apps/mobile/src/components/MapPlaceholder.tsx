import { useMemo } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Rect, Line, Path, Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

export interface MapPin {
  id: string;
  /** Normalised position 0..1 within the panel. */
  x: number;
  y: number;
  label?: string;
  tone?: 'brand' | 'accent' | 'muted';
}

export interface MapPlaceholderProps {
  height?: number;
  /** Caption shown in the bottom glass bar. */
  caption?: string;
  pins?: MapPin[];
  style?: ViewStyle;
  /** Show the central "you are here" marker. Default: true. */
  showYou?: boolean;
  rounded?: number;
}

/**
 * Expo Go-safe map placeholder — a styled SVG panel (no react-native-maps).
 * Renders a stylised street grid with optional pins and a caption bar. Used
 * anywhere a map would appear (category map toggle, address book, safety).
 */
export function MapPlaceholder({
  height = 180,
  caption,
  pins = [],
  style,
  showYou = true,
  rounded = radius.lg,
}: MapPlaceholderProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const W = 320;
  const H = height;

  const toneColor = (tone?: MapPin['tone']) =>
    tone === 'accent' ? c.brand.accent : tone === 'muted' ? c.text.muted : c.brand.primary;

  return (
    <View
      style={[styles.wrap, { height, borderRadius: rounded }, style]}
      accessibilityRole="image"
      accessibilityLabel={caption ? `Map preview. ${caption}` : 'Map preview'}
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect x={0} y={0} width={W} height={H} fill={c.background.muted} />
        {/* parks */}
        <Rect x={18} y={20} width={70} height={48} rx={8} fill={c.status.successSoft} />
        <Rect x={W - 96} y={H - 70} width={78} height={52} rx={8} fill={c.status.successSoft} />
        {/* water */}
        <Path
          d={`M0 ${H - 30} Q ${W * 0.3} ${H - 54} ${W * 0.6} ${H - 28} T ${W} ${H - 34} L ${W} ${H} L 0 ${H} Z`}
          fill={c.status.infoSoft}
          opacity={0.7}
        />
        {/* grid roads */}
        <G stroke={c.border} strokeWidth={6} opacity={0.9}>
          <Line x1={0} y1={H * 0.35} x2={W} y2={H * 0.35} />
          <Line x1={0} y1={H * 0.7} x2={W} y2={H * 0.7} />
          <Line x1={W * 0.28} y1={0} x2={W * 0.28} y2={H} />
          <Line x1={W * 0.62} y1={0} x2={W * 0.62} y2={H} />
        </G>
        <G stroke={c.background.surface} strokeWidth={2} opacity={0.8}>
          <Line x1={0} y1={H * 0.35} x2={W} y2={H * 0.35} strokeDasharray="8 8" />
          <Line x1={W * 0.62} y1={0} x2={W * 0.62} y2={H} strokeDasharray="8 8" />
        </G>
        {/* you are here */}
        {showYou ? (
          <>
            <Circle cx={W / 2} cy={H / 2} r={16} fill={c.brand.primary} opacity={0.18} />
            <Circle
              cx={W / 2}
              cy={H / 2}
              r={7}
              fill={c.brand.primary}
              stroke={c.background.surface}
              strokeWidth={2.5}
            />
          </>
        ) : null}
        {/* pins */}
        {pins.map((p) => (
          <G key={p.id}>
            <Circle
              cx={p.x * W}
              cy={p.y * H}
              r={6}
              fill={toneColor(p.tone)}
              stroke={c.background.surface}
              strokeWidth={2}
            />
          </G>
        ))}
      </Svg>

      <View style={styles.badge} pointerEvents="none">
        <Ionicons name="map-outline" size={13} color={c.text.secondary} />
        <Text style={styles.badgeText}>Map preview</Text>
      </View>

      {caption ? (
        <View style={styles.caption} pointerEvents="none">
          <Ionicons name="location" size={14} color={c.brand.tint} />
          <Text style={styles.captionText} numberOfLines={1}>
            {caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.background.muted,
    },
    badge: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 3,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: c.glass,
      borderWidth: 1,
      borderColor: c.border,
    },
    badgeText: { ...typography.scale.caption, fontSize: 10, color: c.text.secondary },
    caption: {
      position: 'absolute',
      left: spacing.sm,
      right: spacing.sm,
      bottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    captionText: { flex: 1, ...typography.scale.caption, color: c.text.secondary },
  });
