import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTokens, radius, spacing, shadow } from '../../theme';
import { useCoachmarkStore, type CoachmarkKey } from '../../stores/coachmarkStore';
import { Text } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';

export interface CoachmarkProps {
  coachKey: CoachmarkKey;
  title: string;
  message: string;
  /** Vertical offset from the top of the parent. */
  top?: number;
}

/**
 * First-run coachmark card. Renders once per session for its key, then
 * dismisses. Mount inside a relatively-positioned parent.
 */
export function Coachmark({ coachKey, title, message, top = 120 }: CoachmarkProps) {
  const t = useTokens();
  const hasSeen = useCoachmarkStore((s) => s.seen[coachKey] === true);
  const markSeen = useCoachmarkStore((s) => s.markSeen);

  if (hasSeen) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      exiting={FadeOut}
      style={[styles.wrap, { top }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.card,
          shadow.floating,
          { backgroundColor: t.surfaceRaised, borderColor: t.border },
        ]}
      >
        <View style={[styles.icon, { backgroundColor: t.accentSoft }]}>
          <Icon name="sparkles" size={20} color={t.accent} />
        </View>
        <Text variant="headline">{title}</Text>
        <Text variant="footnote" tone="muted" style={{ marginBottom: spacing.sm }}>
          {message}
        </Text>
        <Button label="Got it" size="sm" onPress={() => markSeen(coachKey)} fullWidth={false} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 50,
  },
  card: {
    width: '100%',
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
});
