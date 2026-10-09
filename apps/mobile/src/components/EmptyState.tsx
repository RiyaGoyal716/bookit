import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';

import { useColors, radius, spacing, typography, type Palette } from '../theme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  /** Optional call-to-action button. */
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly empty / no-results placeholder with an SVG illustration + CTA. */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        {icon ? (
          <Ionicons name={icon} size={36} color={c.brand.tint} />
        ) : (
          <Svg width={72} height={72} viewBox="0 0 72 72">
            <Circle cx={36} cy={36} r={34} fill={c.brand.primarySoft} />
            <G
              stroke={c.brand.tint}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <Rect x={22} y={24} width={28} height={26} rx={5} />
              <Path d="M28 20 V26" />
              <Path d="M44 20 V26" />
              <Path d="M22 32 H50" />
              <Path d="M30 40 L34 44 L43 36" />
            </G>
          </Svg>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} style={styles.cta} />
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    illustration: {
      width: 72,
      height: 72,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      ...typography.scale.bodyMedium,
      color: c.text.primary,
    },
    message: {
      ...typography.scale.small,
      color: c.text.secondary,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
    cta: {
      marginTop: spacing.md,
      minWidth: 180,
    },
  });
