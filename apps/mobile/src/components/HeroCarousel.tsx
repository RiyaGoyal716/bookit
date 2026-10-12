import { useEffect, useMemo, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Two-stop gradient. */
  colors: [string, string];
  onPress?: () => void;
}

export interface HeroCarouselProps {
  banners: HeroBanner[];
  /** Auto-scroll interval in ms. Default 4000; 0 disables. */
  interval?: number;
  /** Outer horizontal padding the carousel sits within. */
  sidePadding?: number;
}

/**
 * Custom promo hero carousel — a paged horizontal ScrollView with auto-scroll
 * and dot indicators. Built with core RN + expo-linear-gradient (no new deps).
 */
export function HeroCarousel({
  banners,
  interval = 4000,
  sidePadding = spacing.lg,
}: HeroCarouselProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { width } = useWindowDimensions();
  const cardWidth = width - sidePadding * 2;
  const pageWidth = cardWidth + spacing.md;
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const dragging = useRef(false);

  useEffect(() => {
    if (interval <= 0 || banners.length <= 1) return;
    const timer = setInterval(() => {
      if (dragging.current) return;
      setIndex((prev) => {
        const next = (prev + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * pageWidth, animated: true });
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [interval, banners.length, pageWidth]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    setIndex(Math.max(0, Math.min(i, banners.length - 1)));
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={{ paddingHorizontal: sidePadding }}
        onScrollBeginDrag={() => {
          dragging.current = true;
        }}
        onScrollEndDrag={() => {
          dragging.current = false;
        }}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {banners.map((b, i) => (
          <Pressable
            key={b.id}
            onPress={b.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${b.title}. ${b.subtitle}`}
            style={[
              styles.card,
              { width: cardWidth, marginRight: i === banners.length - 1 ? 0 : spacing.md },
            ]}
          >
            <LinearGradient
              colors={b.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <View style={styles.cardBody}>
                <Text style={styles.title}>{b.title}</Text>
                <Text style={styles.subtitle}>{b.subtitle}</Text>
                <View style={styles.ctaPill}>
                  <Text style={styles.ctaText}>{b.cta}</Text>
                  <Ionicons name="arrow-forward" size={14} color={c.text.primary} />
                </View>
              </View>
              <View style={styles.iconWrap}>
                <Ionicons name={b.icon} size={64} color="rgba(255,255,255,0.35)" />
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((b, i) => (
            <View key={b.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      height: 150,
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    gradient: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    cardBody: {
      flex: 1,
      gap: spacing.xs,
    },
    title: {
      ...typography.scale.h2,
      color: c.text.inverse,
    },
    subtitle: {
      ...typography.scale.small,
      color: 'rgba(255,255,255,0.9)',
      marginBottom: spacing.sm,
    },
    ctaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
    },
    ctaText: {
      ...typography.scale.caption,
      fontFamily: typography.font.bold,
      fontWeight: '700',
      color: c.text.primary,
    },
    iconWrap: {
      marginLeft: spacing.md,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.border,
    },
    dotActive: {
      width: 18,
      backgroundColor: c.brand.primary,
    },
  });
