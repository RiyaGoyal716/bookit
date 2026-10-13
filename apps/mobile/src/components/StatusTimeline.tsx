import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';

import { useColors, spacing, typography, type Palette } from '../theme';
import { useDirectionalStyles } from '../i18n';

export interface TimelineStep {
  key: string;
  label: string;
  /** Optional sub-caption, e.g. a timestamp. */
  caption?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
  /** Index of the current/active step (0-based). Earlier steps = done. */
  currentIndex: number;
}

/**
 * Vertical status timeline with a staggered reveal (moti). Completed steps show
 * a filled check, the current step pulses, future steps are muted. Direction
 * aware (mirrors in RTL).
 */
export function StatusTimeline({ steps, currentIndex }: StatusTimelineProps) {
  const c = useColors();
  const dir = useDirectionalStyles();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View>
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const last = i === steps.length - 1;
        const tone = done || active ? c.brand.primary : c.border;
        return (
          <MotiView
            key={step.key}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 320, delay: i * 90 }}
            style={[styles.row, dir.row]}
          >
            <View style={styles.railCol}>
              <View
                style={[
                  styles.node,
                  {
                    borderColor: tone,
                    backgroundColor: done || active ? tone : c.background.surface,
                  },
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color={c.text.inverse} />
                ) : active ? (
                  <View style={styles.pulse} />
                ) : (
                  <Ionicons name={step.icon ?? 'ellipse-outline'} size={12} color={c.text.muted} />
                )}
              </View>
              {!last ? (
                <View
                  style={[styles.line, { backgroundColor: done ? c.brand.primary : c.border }]}
                />
              ) : null}
            </View>
            <View style={[styles.content, { alignItems: dir.rtl ? 'flex-end' : 'flex-start' }]}>
              <Text
                style={[
                  styles.label,
                  dir.textAlign,
                  (done || active) && { color: c.text.primary },
                  active && { fontFamily: typography.font.bold, fontWeight: '700' },
                ]}
              >
                {step.label}
              </Text>
              {step.caption ? (
                <Text style={[styles.caption, dir.textAlign]}>{step.caption}</Text>
              ) : null}
            </View>
          </MotiView>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.md },
    railCol: { alignItems: 'center', width: 28 },
    node: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.text.inverse },
    line: { width: 2, flex: 1, minHeight: 24, marginVertical: 2 },
    content: { flex: 1, paddingBottom: spacing.lg, paddingTop: 2 },
    label: { ...typography.scale.bodyMedium, color: c.text.muted },
    caption: { ...typography.scale.caption, color: c.text.muted, marginTop: 2 },
  });
