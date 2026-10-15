import { useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
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

import { Text, Button, PressableScale, Chip } from '../src/components/ui';
import { LogoMark } from '../src/brand';
import { IllustrationFindPros, IllustrationBook } from '../src/assets/illustrations';
import { categories } from '../src/mocks';
import { useT } from '../src/i18n';
import { route } from '../src/lib/nav';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { useTokens, spacing, radius } from '../src/theme';

const { width } = Dimensions.get('window');
const PAGES = 3; // 2 slides + the needs picker

export default function OnboardingScreen() {
  const router = useRouter();
  const t = useTokens();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const setNeeds = useOnboardingStore((s) => s.setNeeds);
  const markSeen = useOnboardingStore((s) => s.markSeen);

  const slides = useMemo(
    () => [
      { Art: IllustrationFindPros, title: tr('intro.slide1Title'), body: tr('intro.slide1Body') },
      { Art: IllustrationBook, title: tr('intro.slide2Title'), body: tr('intro.slide2Body') },
    ],
    [tr],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      x.value = e.contentOffset.x;
    },
  });

  const finish = () => {
    setNeeds(selected);
    markSeen();
    router.replace(route('/region'));
  };

  const isLast = index === PAGES - 1;
  const next = () => {
    if (isLast) return finish();
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  };

  const toggle = (slug: string) =>
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar style="auto" />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <LogoMark size={28} />
        <PressableScale
          onPress={finish}
          haptic={null}
          accessibilityRole="button"
          accessibilityLabel={tr('common.skip')}
        >
          <Text variant="footnote" tone="muted">
            {tr('common.skip')}
          </Text>
        </PressableScale>
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
          <Slide key={i} index={i} scrollX={x}>
            <s.Art size={Math.min(240, width * 0.6)} />
            <View style={styles.copy}>
              <Text variant="title1" center>
                {s.title}
              </Text>
              <Text variant="body" tone="muted" center style={styles.body}>
                {s.body}
              </Text>
            </View>
          </Slide>
        ))}

        {/* Needs multi-select */}
        <View style={styles.needsPage}>
          <Text variant="title1" center>
            What do you need help with?
          </Text>
          <Text variant="footnote" tone="muted" center style={styles.body}>
            {"Pick a few and we'll put them first on your home screen."}
          </Text>
          <View style={styles.chips}>
            {categories.map((cat) => (
              <Chip
                key={cat.slug}
                label={cat.label}
                icon={cat.icon}
                selected={selected.includes(cat.slug)}
                onPress={() => toggle(cat.slug)}
              />
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.progress}>
          {Array.from({ length: PAGES }).map((_, i) => (
            <ProgressDot key={i} index={i} scrollX={x} color={t.primary} />
          ))}
        </View>
        <Button
          label={isLast ? tr('common.getStarted') : tr('common.next')}
          icon={isLast ? 'arrow-right' : undefined}
          iconPosition="right"
          onPress={next}
        />
      </View>
    </View>
  );
}

function Slide({
  index,
  scrollX,
  children,
}: {
  index: number;
  scrollX: SharedValue<number>;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      transform: [{ scale: interpolate(scrollX.value, input, [0.85, 1, 0.85]) }],
      opacity: interpolate(scrollX.value, input, [0.3, 1, 0.3]),
    };
  });
  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.slideInner, style]}>{children}</Animated.View>
    </View>
  );
}

function ProgressDot({
  index,
  scrollX,
  color,
}: {
  index: number;
  scrollX: SharedValue<number>;
  color: string;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, input, [8, 28, 8], 'clamp'),
      opacity: interpolate(scrollX.value, input, [0.3, 1, 0.3], 'clamp'),
    };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideInner: { alignItems: 'center', gap: spacing.xxl },
  copy: { alignItems: 'center', gap: spacing.md },
  body: { maxWidth: 320 },
  needsPage: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  footer: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { height: 8, borderRadius: radius.pill },
});
