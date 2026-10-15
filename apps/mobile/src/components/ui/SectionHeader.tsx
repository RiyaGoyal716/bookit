import { View, StyleSheet } from 'react-native';

import { spacing } from '../../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export interface SectionHeaderProps {
  title: string;
  /** Optional "See all" action. */
  onSeeAll?: () => void;
  seeAllLabel?: string;
}

/** Section title with an optional trailing "See all". */
export function SectionHeader({ title, onSeeAll, seeAllLabel = 'See all' }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text variant="title2">{title}</Text>
      {onSeeAll && (
        <PressableScale
          onPress={onSeeAll}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel={`${seeAllLabel}: ${title}`}
          hitArea
        >
          <Text variant="callout" tone="accent" style={{ fontWeight: '600' }}>
            {seeAllLabel}
          </Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});
