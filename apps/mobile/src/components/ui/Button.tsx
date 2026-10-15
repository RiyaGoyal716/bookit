import { ActivityIndicator, View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHTS: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };

/** NOVA button. One primary action per screen; tokens only. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const t = useTokens();
  const isDisabled = disabled || loading;

  const bg: Record<ButtonVariant, string> = {
    primary: t.primary,
    secondary: t.bgSubtle,
    tertiary: 'transparent',
    destructive: t.danger,
  };
  const fg: Record<ButtonVariant, string> = {
    primary: t.onPrimary,
    secondary: t.text,
    tertiary: t.accent,
    destructive: '#FFFFFF',
  };
  const border = variant === 'secondary' ? t.border : 'transparent';
  const iconColor = fg[variant];

  return (
    <PressableScale
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          height: HEIGHTS[size],
          backgroundColor: bg[variant],
          borderColor: border,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          opacity: isDisabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          paddingHorizontal: size === 'sm' ? spacing.md : spacing.xl,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.row}>
          {icon && iconPosition === 'left' && <Icon name={icon} size={20} color={iconColor} />}
          <Text
            variant={size === 'lg' ? 'headline' : 'callout'}
            style={{ color: iconColor, fontWeight: '600' }}
            maxFontSizeMultiplier={1.3}
          >
            {label}
          </Text>
          {icon && iconPosition === 'right' && <Icon name={icon} size={20} color={iconColor} />}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
