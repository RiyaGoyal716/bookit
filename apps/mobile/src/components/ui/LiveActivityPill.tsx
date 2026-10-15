import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useTokens, radius, spacing, shadow } from '../../theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { Icon } from './Icon';
import { Avatar } from './Avatar';

export interface LiveActivityPillProps {
  providerName: string;
  avatarUri?: string;
  /** ETA label, e.g. "8 min". */
  eta: string;
  /** 0..1 progress. */
  progress: number;
  status?: string;
  onPress?: () => void;
}

/** Live-Activity style pill (pro avatar, ETA, progress). Tap to expand tracking. */
export function LiveActivityPill({
  providerName,
  avatarUri,
  eta,
  progress,
  status = 'On the way',
  onPress,
}: LiveActivityPillProps) {
  const t = useTokens();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <Animated.View entering={FadeInDown.springify().damping(20)} exiting={FadeOutDown}>
      <PressableScale
        onPress={onPress}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${status}: ${providerName}, ${eta}`}
        style={[
          styles.pill,
          shadow.floating,
          { backgroundColor: t.surface, borderColor: t.border },
        ]}
      >
        <Avatar uri={avatarUri} name={providerName} size={36} />
        <View style={styles.body}>
          <View style={styles.row}>
            <Text variant="caption" tone="accent" style={{ fontWeight: '700' }}>
              {status.toUpperCase()}
            </Text>
            <Text variant="caption" tone="muted" tabular>
              {eta}
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: t.bgSubtle }]}>
            <View
              style={[styles.fill, { backgroundColor: t.accent, width: `${clamped * 100}%` }]}
            />
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={t.textSubtle} />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
});
