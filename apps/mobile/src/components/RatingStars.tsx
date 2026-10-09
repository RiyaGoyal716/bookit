import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColors } from '../theme';

export interface RatingStarsProps {
  /** Rating value 0–5. */
  value: number;
  size?: number;
}

/** Five-star rating row with half-star support, drawn with vector icons. */
export function RatingStars({ value, size = 14 }: RatingStarsProps) {
  const c = useColors();
  const rounded = Math.round(value * 2) / 2;

  return (
    <View
      style={styles.row}
      accessibilityRole="image"
      accessibilityLabel={`Rated ${value.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const name = rounded >= i ? 'star' : rounded >= i - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={i} name={name} size={size} color={c.brand.star} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
});
