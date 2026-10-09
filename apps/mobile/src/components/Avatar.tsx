import { Image } from 'expo-image';
import { StyleSheet, type ImageStyle } from 'react-native';

import { colors, radius } from '../theme';

export interface AvatarProps {
  uri: string;
  size?: number;
  /** Corner radius; defaults to a rounded square. */
  rounded?: number;
  style?: ImageStyle;
}

/** Remote avatar rendered via expo-image with a graceful placeholder. */
export function Avatar({ uri, size = 56, rounded = radius.md, style }: AvatarProps) {
  return (
    <Image
      source={{ uri }}
      style={[{ width: size, height: size, borderRadius: rounded }, styles.image, style]}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.skeleton,
  },
});
