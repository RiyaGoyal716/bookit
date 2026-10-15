import { View, StyleSheet } from 'react-native';

import { LogoMark } from './LogoMark';
import { Wordmark } from './Wordmark';

export interface LogoProps {
  /** Mark size in px. Default 32. */
  size?: number;
  /** Show the "bookit" wordmark beside the mark. Default false. */
  withWordmark?: boolean;
  /** Override mark + wordmark colour. */
  color?: string;
}

/** NOVA logo — brand mark, optionally with the wordmark. */
export function Logo({ size = 32, withWordmark = false, color }: LogoProps) {
  if (!withWordmark) return <LogoMark size={size} color={color} />;
  return (
    <View style={styles.row}>
      <LogoMark size={size} color={color} />
      <Wordmark size={size * 0.82} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
