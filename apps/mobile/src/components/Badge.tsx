import { View, Text, StyleSheet } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { BookingStatus } from '../stores/bookingsStore';

const STATUS_STYLE: Record<BookingStatus, { bg: string; fg: string }> = {
  Requested: { bg: colors.status.warningSoft, fg: colors.status.warning },
  Accepted: { bg: colors.status.infoSoft, fg: colors.status.info },
  Completed: { bg: colors.status.successSoft, fg: colors.status.success },
};

export interface BadgeProps {
  status: BookingStatus;
}

/** Status pill: Requested (amber), Accepted (blue), Completed (green). */
export function Badge({ status }: BadgeProps) {
  const palette = STATUS_STYLE[status];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <View style={[styles.dot, { backgroundColor: palette.fg }]} />
      <Text style={[styles.label, { color: palette.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
});
