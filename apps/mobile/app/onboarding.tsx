import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '../src/components';
import { track } from '../src/lib/analytics';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { useColors, radius, spacing, typography, type Palette } from '../src/theme';

type RowIcon = keyof typeof Ionicons.glyphMap;

const SLIDES: { icon: RowIcon; title: string; body: string }[] = [
  {
    icon: 'search',
    title: 'Find trusted help',
    body: 'Browse verified cleaners, barbers and tutors rated by your Leeds neighbours.',
  },
  {
    icon: 'calendar',
    title: 'Book in a minute',
    body: 'Pick a service, choose a time and confirm — no phone calls, no waiting.',
  },
  {
    icon: 'sparkles',
    title: 'Sit back and relax',
    body: 'Track your booking end to end and pay securely when the job is done.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(c), [c]);
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const finish = () => {
    track('onboarding_complete', { lastSlide: index });
    useOnboardingStore.getState().markSeen();
    router.replace('/');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
    } else {
      finish();
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[c.brand.primary, c.brand.primaryDark]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          onPress={finish}
          hitSlop={8}
          style={styles.skip}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.flex}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={slide.icon} size={64} color={c.text.inverse} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Button
          label={index === SLIDES.length - 1 ? 'Get started' : 'Next'}
          icon="arrow-forward"
          variant="secondary"
          onPress={onNext}
        />
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.brand.primaryDark },
    flex: { flex: 1 },
    header: {
      paddingHorizontal: spacing.lg,
      alignItems: 'flex-end',
    },
    skip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
    skipText: {
      ...typography.scale.smallMedium,
      color: 'rgba(255,255,255,0.9)',
    },
    slide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.lg,
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: radius.pill,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.scale.display,
      color: c.text.inverse,
      textAlign: 'center',
    },
    body: {
      ...typography.scale.body,
      color: 'rgba(255,255,255,0.85)',
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: spacing.lg,
      gap: spacing.lg,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.4)',
    },
    dotActive: {
      width: 22,
      backgroundColor: c.text.inverse,
    },
  });
