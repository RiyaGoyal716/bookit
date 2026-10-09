import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useToastStore } from '../stores/toastStore';
import { useColors, radius, shadow, spacing, typography, type Palette } from '../theme';

/**
 * Global toast host. Mount once near the app root. Listens to the toast store
 * and slides a themed banner in from the bottom, auto-dismissing after ~2.4s.
 */
export function ToastHost() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [shown, setShown] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translate] = useState(() => new Animated.Value(20));

  // Subscribe imperatively: reacting to an external store change (not a
  // synchronous effect body) is the recommended place to call setState.
  useEffect(() => {
    const unsubscribe = useToastStore.subscribe((state) => {
      if (state.message) {
        setShown(state.message);
        setVisible(true);
        state.clear();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translate, { toValue: 0, useNativeDriver: true, friction: 7 }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translate, { toValue: 20, duration: 180, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }, 2400);
    return () => clearTimeout(timer);
  }, [visible, opacity, translate]);

  if (!visible || !shown) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { bottom: insets.bottom + spacing.xl, opacity, transform: [{ translateY: translate }] },
      ]}
    >
      <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
        <Ionicons name="checkmark-circle" size={18} color={c.brand.tint} />
        <Text style={styles.text} numberOfLines={2}>
          {shown}
        </Text>
      </View>
    </Animated.View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      alignItems: 'center',
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      maxWidth: '100%',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      backgroundColor: c.background.surface,
      borderWidth: 1,
      borderColor: c.border,
      ...shadow.floating,
    },
    text: {
      flexShrink: 1,
      ...typography.scale.smallMedium,
      color: c.text.primary,
    },
  });
