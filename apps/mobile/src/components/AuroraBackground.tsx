import { type PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

import { useColors } from '../theme';

export interface AuroraBackgroundProps {
  /** Soft decorative blobs over the gradient. Default true. */
  blobs?: boolean;
  style?: ViewStyle;
}

/**
 * Full-bleed signature gradient backdrop with optional soft "aurora" blobs.
 * Used on hero / opening screens. Colours come from the active palette.
 */
export function AuroraBackground({
  blobs = true,
  style,
  children,
}: PropsWithChildren<AuroraBackgroundProps>) {
  const c = useColors();
  const tint = useMemo(() => c.text.onBrand, [c]);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        colors={[c.brand.gradient[0], c.brand.primaryDark, c.brand.gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {blobs ? (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle cx="12%" cy="18%" r="120" fill={tint} opacity={0.08} />
          <Circle cx="92%" cy="30%" r="90" fill={tint} opacity={0.06} />
          <Circle cx="78%" cy="88%" r="140" fill={tint} opacity={0.05} />
        </Svg>
      ) : null}
      {children}
    </View>
  );
}
