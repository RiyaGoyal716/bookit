import { View, StyleSheet } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

/** Small pill label. */
export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const t = useTokens();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: t.bgSubtle, fg: t.textMuted },
    accent: { bg: t.accentSoft, fg: t.accent },
    success: { bg: t.accentSoft, fg: t.success },
    warning: { bg: t.accentSoft, fg: t.warning },
    danger: { bg: t.accentSoft, fg: t.danger },
    info: { bg: t.accentSoft, fg: t.info },
  };
  const { bg, fg } = map[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <Text variant="caption" style={{ color: fg, fontWeight: '600' }} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
