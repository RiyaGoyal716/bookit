import { View, TextInput, Pressable, StyleSheet } from 'react-native';

import { useTokens, radius, spacing, typography } from '../../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export interface SearchFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** When set, the field acts as a button (navigates to full-screen search). */
  onPress?: () => void;
  showMic?: boolean;
  onMic?: () => void;
  autoFocus?: boolean;
}

/** Search bar. When `onPress` is set it is a tap target (not an input). */
export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  onPress,
  showMic = true,
  onMic,
  autoFocus,
}: SearchFieldProps) {
  const t = useTokens();

  const inner = (
    <View style={[styles.base, { backgroundColor: t.bgSubtle, borderColor: t.border }]}>
      <Icon name="search" size={20} color={t.textMuted} />
      {onPress ? (
        <View style={styles.flex}>
          <Text variant="body" style={{ color: t.textMuted }} numberOfLines={1}>
            {placeholder}
          </Text>
        </View>
      ) : (
        <TextInput
          style={[styles.input, { color: t.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.textMuted}
          autoFocus={autoFocus}
          returnKeyType="search"
          accessibilityLabel={placeholder}
        />
      )}
      {showMic && (
        <Pressable
          onPress={onMic}
          accessibilityRole="button"
          accessibilityLabel="Voice search"
          hitSlop={8}
        >
          <Icon name="mic" size={20} color={t.accent} />
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="search" accessibilityLabel={placeholder}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  flex: { flex: 1 },
  input: {
    flex: 1,
    fontFamily: typography.font.regular,
    fontSize: 15,
    padding: 0,
  },
});
