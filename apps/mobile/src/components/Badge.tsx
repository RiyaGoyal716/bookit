import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useColors, radius, spacing, typography, type Palette } from '../theme';
import type { BookingStatus } from '../stores/bookingsStore';

type Tone = { bg: string; fg: string };

function toneFor(c: Palette, status: BookingStatus): Tone {
  switch (status) {
    case 'Requested':
      return { bg: c.status.warningSoft, fg: c.status.warning };
    case 'Accepted':
      return { bg: c.status.infoSoft, fg: c.status.info };
    case 'Completed':
      return { bg: c.status.successSoft, fg: c.status.success };
  }
}

export interface BadgeProps {
  status: BookingStatus;
}

/** Status pill: Requested (amber), Accepted (blue), Completed (green). */
export function Badge({ status }: BadgeProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const tone = toneFor(c, status);
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <View style={[styles.dot, { backgroundColor: tone.fg }]} />
      <Text style={[styles.label, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

const makeStyles = (_c: Palette) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    label: {
      ...typography.scale.caption,
      fontFamily: typography.font.bold,
      fontWeight: '700',
    },
  });
