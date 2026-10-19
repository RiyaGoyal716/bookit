import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { SlideInDown, SlideOutDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTokens, radius, spacing, shadow } from '../../theme';
import { useIsRTL } from '../../i18n';
import { Text } from './Text';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { PressableScale } from './PressableScale';

export interface LivePillProps {
  providerName: string;
  avatarUri?: string;
  /** 0..1 — how full the ETA ring is. */
  progress: number;
  /** Status line, e.g. "is on the way". */
  statusText?: string;
  /** Short ETA label shown under the status (e.g. "8 min"). */
  etaLabel?: string;
  onPress?: () => void;
  /** Extra bottom offset above the safe-area inset (e.g. clearing a tab bar). */
  offset?: number;
}

const RING = 48;
const STROKE = 3;
const R = (RING - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/**
 * NOVA v3 live-activity pill shown during an active booking: the pro's avatar
 * inside an ETA ring that fills as they approach. Tapping opens tracking.
 */
export function LivePill({
  providerName,
  avatarUri,
  progress,
  statusText = 'is on the way',
  etaLabel,
  onPress,
  offset = 86,
}: LivePillProps) {
  const t = useTokens();
  const rtl = useIsRTL();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const frac = Math.max(0, Math.min(1, progress));
  const dir = rtl ? ('row-reverse' as const) : ('row' as const);

  return (
    <Animated.View
      entering={reduced ? undefined : SlideInDown.springify().damping(20)}
      exiting={reduced ? undefined : SlideOutDown.duration(200)}
      style={[styles.wrap, { left: spacing.lg, right: spacing.lg, bottom: insets.bottom + offset }]}
      pointerEvents="box-none"
    >
      <PressableScale
        onPress={onPress}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${providerName} ${statusText}${etaLabel ? `, ${etaLabel}` : ''}`}
        style={[
          styles.pill,
          shadow.floating,
          { backgroundColor: t.surface, borderColor: t.border, flexDirection: dir },
        ]}
      >
        <View style={styles.ringWrap}>
          <Svg width={RING} height={RING} style={StyleSheet.absoluteFill}>
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={t.border}
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={R}
              stroke={t.brandGreen}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - frac)}
              transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            />
          </Svg>
          <Avatar uri={avatarUri} name={providerName} size={40} />
        </View>
        <View style={styles.body}>
          <Text variant="headline" numberOfLines={1}>
            {providerName} {statusText}
          </Text>
          {etaLabel ? (
            <Text variant="caption" tone="success" tabular style={styles.eta}>
              {etaLabel}
            </Text>
          ) : null}
        </View>
        <Icon name={rtl ? 'chevron-left' : 'chevron-right'} size={20} color={t.textSubtle} />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  pill: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ringWrap: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  eta: { fontWeight: '700' },
});
