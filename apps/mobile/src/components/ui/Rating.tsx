import { View, StyleSheet } from 'react-native';

import { useTokens, spacing } from '../../theme';
import { Text } from './Text';
import { Icon } from './Icon';

export interface RatingProps {
  value: number;
  /** Optional review count. */
  count?: number;
  size?: 16 | 20;
}

/** Compact star rating with a tabular value and optional count. */
export function Rating({ value, count, size = 16 }: RatingProps) {
  const t = useTokens();
  return (
    <View style={styles.row} accessible accessibilityLabel={`Rated ${value} out of 5`}>
      <Icon name="star" size={size} color={t.warning} />
      <Text variant="footnote" tabular style={{ fontWeight: '700' }}>
        {value.toFixed(1)}
      </Text>
      {typeof count === 'number' && (
        <Text variant="footnote" tone="muted" tabular>
          ({count})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
