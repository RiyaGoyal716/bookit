import { StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { useTokens, radius } from '../../theme';
import { PressableScale } from './PressableScale';
import { Icon, type IconName, type IconSize } from './Icon';

export interface IconButtonProps {
  name: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: IconSize;
  /** Visual button diameter. Default 44 (min hit target). */
  diameter?: number;
  variant?: 'plain' | 'surface' | 'subtle';
  color?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Round icon button with a 44pt hit area and press feedback. */
export function IconButton({
  name,
  onPress,
  accessibilityLabel,
  size = 20,
  diameter = 44,
  variant = 'plain',
  color,
  disabled,
  style,
}: IconButtonProps) {
  const t = useTokens();
  const bg = variant === 'surface' ? t.surface : variant === 'subtle' ? t.bgSubtle : 'transparent';

  return (
    <PressableScale
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          width: diameter,
          height: diameter,
          borderRadius: radius.pill,
          backgroundColor: bg,
          borderWidth: variant === 'surface' ? StyleSheet.hairlineWidth : 0,
          borderColor: t.border,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Icon name={name} size={size} color={color ?? t.text} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
