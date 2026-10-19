import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { Fluent3D, type Fluent3DKey } from '../../assets/3d';
import { Text } from './Text';
import { PressableScale } from './PressableScale';

export type OfferTone = 'coral' | 'sky' | 'sunshine';

export interface OfferCardProps {
  tone: OfferTone;
  /** Fluent 3D illustration shown in the corner. */
  art: Fluent3DKey;
  title: string;
  /** Promo code shown in a chip (e.g. "BOOKIT10"). */
  code?: string;
  subtitle?: string;
  onPress?: () => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

/** NOVA v3 full-colour offer card with a corner Fluent 3D illustration. */
export function OfferCard({
  tone,
  art,
  title,
  code,
  subtitle,
  onPress,
  width,
  style,
}: OfferCardProps) {
  const t = useTokens();
  const bg = tone === 'coral' ? t.coralSoft : tone === 'sky' ? t.skySoft : t.sunshineSoft;

  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={code ? `${title}, code ${code}` : title}
      style={[styles.card, { backgroundColor: bg }, width ? { width } : null, style]}
    >
      <Fluent3D name={art} size={72} style={styles.art} />
      <View style={styles.content}>
        <Text variant="headline" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {code ? (
          <View style={[styles.chip, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text variant="caption" style={styles.code}>
              {code}
            </Text>
          </View>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 128,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  art: { position: 'absolute', right: -8, top: -6 },
  content: { gap: spacing.xs, alignItems: 'flex-start' },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
  code: { fontWeight: '800', letterSpacing: 1 },
});
