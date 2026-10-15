import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { useTokens, spacing } from '../../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Leading icon name. */
  icon?: IconName;
  /** Tint for the leading icon tile. */
  iconTone?: 'neutral' | 'accent' | 'danger';
  /** Trailing value text. */
  value?: string;
  /** Right accessory. Default a chevron when onPress is set. */
  accessory?: 'chevron' | 'none';
  right?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Inset grouped list row (iOS settings style). 56pt min height. */
export function ListRow({
  title,
  subtitle,
  icon,
  iconTone = 'neutral',
  value,
  accessory,
  right,
  onPress,
  style,
}: ListRowProps) {
  const t = useTokens();
  const showChevron = (accessory ?? (onPress ? 'chevron' : 'none')) === 'chevron';
  const tileBg =
    iconTone === 'accent' ? t.accentSoft : iconTone === 'danger' ? t.accentSoft : t.bgSubtle;
  const iconColor = iconTone === 'accent' ? t.accent : iconTone === 'danger' ? t.danger : t.text;

  const content = (
    <View style={[styles.row, style]}>
      {icon && (
        <View style={[styles.tile, { backgroundColor: tileBg }]}>
          <Icon name={icon} size={20} color={iconColor} />
        </View>
      )}
      <View style={styles.texts}>
        <Text variant="body" numberOfLines={1} style={{ fontWeight: '500' }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="footnote" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text variant="callout" tone="muted" numberOfLines={1}>
          {value}
        </Text>
      )}
      {right}
      {showChevron && <Icon name="chevron-right" size={20} color={t.textSubtle} />}
    </View>
  );

  if (!onPress) return content;
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  tile: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 1 },
});
