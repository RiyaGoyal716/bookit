import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { useIsRTL } from '../../i18n';
import { Text } from './Text';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { Rating } from './Rating';
import { PressableScale } from './PressableScale';

export interface ProCardProps {
  name: string;
  avatarUri?: string;
  rating: number;
  ratingCount?: number;
  /** Distance in km. */
  distanceKm?: number;
  /** Blue verified tick next to the name. */
  verified?: boolean;
  /** Next-availability line, shown in green (e.g. "Free today 4:30 pm"). */
  freeText?: string;
  onPress?: () => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
}

/** NOVA v3 pro card: avatar, verified name, rating, distance and next-free slot. */
export function ProCard({
  name,
  avatarUri,
  rating,
  ratingCount,
  distanceKm,
  verified,
  freeText,
  onPress,
  width,
  style,
}: ProCardProps) {
  const t = useTokens();
  const rtl = useIsRTL();
  const dir = rtl ? ('row-reverse' as const) : ('row' as const);

  return (
    <PressableScale
      onPress={onPress}
      haptic={null}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${name}, rated ${rating.toFixed(1)}`}
      style={[
        styles.card,
        { borderColor: t.border, backgroundColor: t.surface },
        width ? { width } : styles.flex,
        style,
      ]}
    >
      <View style={[styles.top, { flexDirection: dir }]}>
        <Avatar uri={avatarUri} name={name} size={48} />
        <View style={styles.info}>
          <View style={[styles.nameRow, { flexDirection: dir }]}>
            <Text variant="headline" numberOfLines={1} style={styles.name}>
              {name}
            </Text>
            {verified ? <Icon name="badge-check" size={16} color={t.sky} weight="fill" /> : null}
          </View>
          <View style={[styles.meta, { flexDirection: dir }]}>
            <Rating value={rating} count={ratingCount} />
            {typeof distanceKm === 'number' ? (
              <Text variant="footnote" tone="muted" tabular>
                · {distanceKm} km
              </Text>
            ) : null}
          </View>
        </View>
      </View>
      {freeText ? (
        <View style={[styles.freeRow, { flexDirection: dir }]}>
          <Icon name="clock" size={16} color={t.success} />
          <Text variant="footnote" tone="success" style={styles.free}>
            {freeText}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  flex: { flex: 1 },
  top: { alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  nameRow: { alignItems: 'center', gap: spacing.xs },
  name: { flexShrink: 1 },
  meta: { alignItems: 'center', gap: spacing.xs },
  freeRow: { alignItems: 'center', gap: spacing.xs },
  free: { fontWeight: '700' },
});
