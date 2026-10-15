import { View, StyleSheet } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { Text } from './Text';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

export interface StatusPillProps {
  label: string;
  tone?: StatusTone;
}

/** Status pill with a leading dot. */
export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  const t = useTokens();
  const color: Record<StatusTone, string> = {
    neutral: t.textMuted,
    success: t.success,
    warning: t.warning,
    danger: t.danger,
    info: t.info,
    accent: t.accent,
  };
  const c = color[tone];
  return (
    <View style={[styles.base, { borderColor: t.border }]}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text variant="caption" style={{ color: c, fontWeight: '600' }} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
