import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { useTokens, radius } from '../../theme';
import { Text } from './Text';

export interface AvatarProps {
  uri?: string;
  /** Fallback initials. */
  name?: string;
  size?: number;
}

function initials(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Circular avatar with an initials fallback (expo-image). */
export function Avatar({ uri, name, size = 44 }: AvatarProps) {
  const t = useTokens();
  const style = { width: size, height: size, borderRadius: radius.pill };
  if (uri) {
    return (
      <Image
        source={uri}
        style={style}
        contentFit="cover"
        transition={150}
        accessibilityLabel={name}
      />
    );
  }
  return (
    <View style={[style, styles.fallback, { backgroundColor: t.accentSoft }]}>
      <Text variant="footnote" style={{ color: t.accent, fontWeight: '700' }}>
        {initials(name)}
      </Text>
    </View>
  );
}

export interface AvatarStackProps {
  items: { uri?: string; name?: string }[];
  size?: number;
  max?: number;
}

/** Overlapping avatar stack. */
export function AvatarStack({ items, size = 28, max = 4 }: AvatarStackProps) {
  const t = useTokens();
  const shown = items.slice(0, max);
  return (
    <View style={styles.stack}>
      {shown.map((it, i) => (
        <View
          key={i}
          style={{
            marginLeft: i === 0 ? 0 : -size / 3,
            borderRadius: radius.pill,
            borderWidth: 2,
            borderColor: t.surface,
          }}
        >
          <Avatar uri={it.uri} name={it.name} size={size} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  stack: { flexDirection: 'row', alignItems: 'center' },
});
