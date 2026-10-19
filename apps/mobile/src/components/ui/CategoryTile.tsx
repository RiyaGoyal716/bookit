import { View, StyleSheet } from 'react-native';

import {
  useTokens,
  radius,
  spacing,
  categoryStyle,
  categoryTint,
  useColorSchemeName,
} from '../../theme';
import { Fluent3D, type Fluent3DKey } from '../../assets/3d';
import { Text } from './Text';
import { PressableScale } from './PressableScale';

export interface CategoryTileProps {
  categorySlug: string;
  label: string;
  /** Renders a "SOON" tag and dims the tile. */
  soon?: boolean;
  onPress?: () => void;
}

/** NOVA v3 category grid tile: a tinted squircle with a 52pt Fluent 3D icon. */
export function CategoryTile({ categorySlug, label, soon, onPress }: CategoryTileProps) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const art = categoryStyle(categorySlug).art as Fluent3DKey;
  const tint = categoryTint(categorySlug, scheme);

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ disabled: soon }}
      accessibilityLabel={soon ? `${label}, coming soon` : label}
      style={styles.tile}
    >
      <View style={[styles.squircle, { backgroundColor: tint, opacity: soon ? 0.6 : 1 }]}>
        <Fluent3D name={art} size={52} />
        {soon ? (
          <View style={[styles.tag, { backgroundColor: t.text }]}>
            <Text variant="micro" style={{ color: t.bg }}>
              SOON
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="caption" numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: { width: '25%', alignItems: 'center', gap: spacing.xs },
  squircle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: spacing.xs + 1,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  label: { fontWeight: '600', textAlign: 'center' },
});
