import { StyleSheet } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** FilterChip style shows a trailing count or chevron. */
  trailingCount?: number;
}

/** Selectable chip / filter chip. Selection haptic. */
export function Chip({ label, selected = false, onPress, icon, trailingCount }: ChipProps) {
  const t = useTokens();
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={0.96}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          backgroundColor: selected ? t.primary : t.bgSubtle,
          borderColor: selected ? t.primary : t.border,
        },
      ]}
    >
      {icon && <Icon name={icon} size={16} color={selected ? t.onPrimary : t.text} />}
      <Text
        variant="callout"
        maxFontSizeMultiplier={1.3}
        style={{ color: selected ? t.onPrimary : t.text, fontWeight: '600' }}
      >
        {label}
      </Text>
      {typeof trailingCount === 'number' && trailingCount > 0 && (
        <Text
          variant="caption"
          maxFontSizeMultiplier={1.3}
          style={{ color: selected ? t.onPrimary : t.textMuted, fontWeight: '700' }}
        >
          {trailingCount}
        </Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
