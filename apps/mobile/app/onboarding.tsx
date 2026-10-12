import { useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { AuroraBackground, GradientButton } from '../src/components';
import {
  IllustrationFindPros,
  IllustrationBook,
  IllustrationPaySecure,
} from '../src/assets/illustrations';
import { useT } from '../src/i18n';
import { route } from '../src/lib/nav';
import { useColors, typography, spacing, radius, type Palette } from '../src/theme';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const c = useColors();
  const t = useT();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const slides = useMemo(
    () => [
      { Art: IllustrationFindPros, title: t('intro.slide1Title'), body: t('intro.slide1Body') },
      { Art: IllustrationBook, title: t('intro.slide2Title'), body: t('intro.slide2Body') },
      { Art: IllustrationPaySecure, title: t('intro.slide3Title'), body: t('intro.slide3Body') },
    ],
    [t],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      x.value = e.contentOffset.x;
    },
  });

  const finish = () => router.replace(route('/region'));
  const isLast = index === slides.length - 1;

  const next = () => {
    if (isLast) return finish();
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AuroraBackground />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={finish} hitSlop={12} accessibilityRole="button">
          <Text style={styles.skip}>{t('common.skip')}</Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={styles.flex}
      >
        {slides.map((s, i) => (
          <Slide key={i} index={i} scrollX={x} styles={styles}>
            <s.Art size={Math.min(260, width * 0.66)} />
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.body}>{s.body}</Text>
          </Slide>
        ))}
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.progress}>
          {slides.map((_, i) => (
            <ProgressBar key={i} index={i} scrollX={x} styles={styles} />
          ))}
        </View>
        <GradientButton label={isLast ? t('common.getStarted') : t('common.next')} onPress={next} />
      </View>
    </View>
  );
}

function Slide({
  index,
  scrollX,
  styles,
  children,
}: {
  index: number;
  scrollX: SharedValue<number>;
  styles: ReturnType<typeof makeStyles>;
  children: React.ReactNode;
}) {
  const artStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      transform: [
        { translateX: interpolate(scrollX.value, input, [width * 0.4, 0, -width * 0.4]) },
        { scale: interpolate(scrollX.value, input, [0.8, 1, 0.8]) },
      ],
      opacity: interpolate(scrollX.value, input, [0.2, 1, 0.2]),
    };
  });
  const textStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      transform: [
        { translateX: interpolate(scrollX.value, input, [width * 0.2, 0, -width * 0.2]) },
      ],
      opacity: interpolate(scrollX.value, input, [0, 1, 0]),
    };
  });
  const [art, ...rest] = Array.isArray(children) ? children : [children];
  return (
    <View style={styles.slide}>
      <Animated.View style={artStyle}>{art}</Animated.View>
      <Animated.View style={[styles.copy, textStyle]}>{rest}</Animated.View>
    </View>
  );
}

function ProgressBar({
  index,
  scrollX,
  styles,
}: {
  index: number;
  scrollX: SharedValue<number>;
  styles: ReturnType<typeof makeStyles>;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, input, [10, 28, 10], 'clamp'),
      opacity: interpolate(scrollX.value, input, [0.4, 1, 0.4], 'clamp'),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.brand.primaryDark },
    flex: { flex: 1 },
    header: { alignItems: 'flex-end', paddingHorizontal: spacing.xl },
    skip: { ...typography.scale.bodyMedium, color: c.text.onBrand, opacity: 0.9 },
    slide: {
      width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.xxl,
    },
    copy: { alignItems: 'center', gap: spacing.md },
    title: { ...typography.scale.display, color: c.text.onBrand, textAlign: 'center' },
    body: {
      ...typography.scale.body,
      color: c.text.onBrand,
      opacity: 0.85,
      textAlign: 'center',
      maxWidth: 320,
    },
    footer: { paddingHorizontal: spacing.xl, gap: spacing.xl },
    progress: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
    dot: { height: 10, borderRadius: radius.pill, backgroundColor: c.text.onBrand },
  });
