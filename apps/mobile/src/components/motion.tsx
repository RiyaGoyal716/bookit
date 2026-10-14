import {
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Text,
  type AccessibilityRole,
  type Insets,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import * as Haptics from 'expo-haptics';

/**
 * Shared motion primitives for Bookit's advanced UI layer.
 *
 * Everything here is Expo Go safe: {@link PressableScale} animates on the UI
 * thread via moti/reanimated worklets (no off-thread shared-value writes), moti
 * powers entrance reveals, and a count-up ticker drives animated prices and
 * rating counts. All helpers honour the OS "reduce motion" setting via
 * {@link useReducedMotion} so content is never left stuck mid-animation.
 */

/** True when the OS "reduce motion" accessibility setting is enabled. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setReduced(v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => setReduced(v));
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'none';

function fireHaptic(style: HapticStyle) {
  if (style === 'none') return;
  if (style === 'selection') {
    Haptics.selectionAsync().catch(() => {});
    return;
  }
  const map = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  } as const;
  Haptics.impactAsync(map[style]).catch(() => {});
}

export interface PressableScaleProps {
  onPress?: () => void;
  onLongPress?: () => void;
  /** Scale target while pressed. Default 0.96. */
  scaleTo?: number;
  /** Haptic fired on press. Default 'light'. */
  haptic?: HapticStyle;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: Record<string, boolean | undefined>;
  children?: ReactNode;
}

/**
 * Tactile pressable with a spring scale-down on press + a light haptic, driven
 * on the UI thread by moti's interaction worklet. The default micro-interaction
 * for anything tappable.
 */
export function PressableScale({
  onPress,
  onLongPress,
  scaleTo = 0.96,
  haptic = 'light',
  disabled = false,
  style,
  hitSlop,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  children,
}: PressableScaleProps) {
  const reduced = useReducedMotion();

  const animate = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        'worklet';
        return { scale: pressed && !reduced ? scaleTo : 1 };
      },
    [scaleTo, reduced],
  );

  const insets: Insets | undefined = useMemo(
    () =>
      hitSlop != null
        ? { top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }
        : undefined,
    [hitSlop],
  );

  const handlePress = () => {
    if (disabled) return;
    fireHaptic(haptic);
    onPress?.();
  };

  return (
    <MotiPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={insets}
      animate={animate}
      transition={{ type: 'spring', damping: 15, stiffness: 280, mass: 0.5 }}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      style={style}
    >
      {children}
    </MotiPressable>
  );
}

export interface AnimatedCounterProps {
  /** Target numeric value. Changes animate from the previous value. */
  value: number;
  /** Format the (possibly fractional) interpolated value for display. */
  format?: (v: number) => string;
  /** Count-up duration in ms. Default 650. */
  duration?: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  accessibilityLabel?: string;
}

/**
 * Number ticker — counts up (or down) to {@link value} with an ease-out curve.
 * Used for animated prices/totals and rating/review counts. Renders the final
 * value instantly when reduce-motion is on.
 */
export function AnimatedCounter({
  value,
  format,
  duration = 650,
  style,
  numberOfLines,
  accessibilityLabel,
}: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to || reduced) {
      fromRef.current = to;
      return;
    }
    const start = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      fromRef.current = to;
    };
  }, [value, duration, reduced]);

  const shown = reduced ? value : display;
  const text = format ? format(shown) : String(Math.round(shown));
  return (
    <Text
      style={style}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel ?? text}
    >
      {text}
    </Text>
  );
}

export interface RevealProps {
  /** Order index for a staggered cascade (multiplied by {@link step}). */
  index?: number;
  /** Per-index stagger in ms. Default 55. */
  step?: number;
  /** Base delay in ms before the cascade. Default 0. */
  delay?: number;
  /** Initial vertical offset in px. Default 14. */
  offsetY?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Entrance reveal — fades + rises into place on mount with an optional stagger.
 * Content resolves to its resting state immediately under reduce-motion, so it
 * is never stranded at opacity 0.
 */
export function Reveal({
  index = 0,
  step = 55,
  delay = 0,
  offsetY = 14,
  style,
  children,
}: PropsWithChildren<RevealProps>) {
  const reduced = useReducedMotion();
  const transition = useMemo(
    () =>
      ({
        type: 'timing',
        duration: 380,
        delay: delay + index * step,
      }) as const,
    [delay, index, step],
  );

  if (reduced) {
    return <MotiView style={style}>{children}</MotiView>;
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: offsetY }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={transition}
      style={style}
    >
      {children}
    </MotiView>
  );
}
