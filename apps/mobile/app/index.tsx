import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Svg, { Rect, Path, G } from 'react-native-svg';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AuroraBackground } from '../src/components';
import { route } from '../src/lib/nav';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { useColors, typography, spacing, type Palette } from '../src/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Total length budget for the stroked glyph paths (over-estimate is fine).
const DRAW_LEN = 180;

/**
 * Animated in-app splash. The logo mark draws itself (reanimated stroke), the
 * rounded square "morphs" in behind it, then we redirect into the flow. The
 * native splash (expo-splash-screen) already covered the font load.
 */
export default function SplashScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const seen = useOnboardingStore((s) => s.seen);
  const [done, setDone] = useState(false);

  const draw = useSharedValue(DRAW_LEN);
  const square = useSharedValue(0);
  const wordmark = useSharedValue(0);

  useEffect(() => {
    square.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.back(1.4)) });
    draw.value = withDelay(
      260,
      withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
    );
    wordmark.value = withDelay(1000, withTiming(1, { duration: 500 }));
    // Finish and redirect.
    square.value = withDelay(
      1700,
      withSequence(
        withTiming(1.06, { duration: 160 }),
        withTiming(1, { duration: 160 }, (finished) => {
          if (finished) runOnJS(setDone)(true);
        }),
      ),
    );
  }, [draw, square, wordmark]);

  const pathProps = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));
  const squareProps = useAnimatedProps(() => ({ opacity: square.value }));
  const squareStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.6 + square.value * 0.4 }],
    opacity: Math.min(1, square.value),
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: (1 - wordmark.value) * 10 }],
  }));

  if (done) {
    return <Redirect href={seen ? route('/(tabs)') : route('/onboarding')} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AuroraBackground />
      <View style={styles.center}>
        <Animated.View style={squareStyle}>
          <Svg width={132} height={132} viewBox="0 0 64 64">
            <AnimatedRect
              x={2}
              y={2}
              width={60}
              height={60}
              rx={17}
              fill={c.text.onBrand}
              animatedProps={squareProps}
            />
            <G
              stroke={c.brand.primary}
              strokeWidth={3.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={DRAW_LEN}
            >
              <AnimatedPath d="M17 27 h30" animatedProps={pathProps} />
              <AnimatedPath d="M24 16 V24" animatedProps={pathProps} />
              <AnimatedPath d="M40 16 V24" animatedProps={pathProps} />
              <AnimatedPath
                d="M17 22 h30 v26 a4 4 0 0 1 -4 4 h-22 a4 4 0 0 1 -4 -4 Z"
                animatedProps={pathProps}
              />
              <AnimatedPath d="M24.5 40 L30 45.5 L41 34.5" animatedProps={pathProps} />
            </G>
          </Svg>
        </Animated.View>
        <Animated.View style={wordmarkStyle}>
          <Text style={styles.wordmark}>Bookit</Text>
          <Text style={styles.sub}>Aurora</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.brand.primaryDark },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
    wordmark: {
      ...typography.scale.hero,
      color: c.text.onBrand,
      textAlign: 'center',
      letterSpacing: -1,
    },
    sub: {
      ...typography.scale.h2,
      color: c.text.onBrand,
      opacity: 0.85,
      textAlign: 'center',
      letterSpacing: 6,
      textTransform: 'uppercase',
    },
  });
