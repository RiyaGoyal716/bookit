import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  FadeOut,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import { useTokens, radius, spacing, shadow, spring } from '../../theme';
import { useToastQueueStore, type ToastItem } from '../../stores/toastQueueStore';
import { Text } from './Text';
import { PressableScale } from './PressableScale';

function ToastRow({ item }: { item: ToastItem }) {
  const t = useTokens();
  const dismiss = useToastQueueStore((s) => s.dismiss);
  const runAction = useToastQueueStore((s) => s.runAction);
  const x = useSharedValue(0);

  useEffect(() => {
    if (!item.duration) return;
    const id = setTimeout(() => dismiss(item.id), item.duration);
    return () => clearTimeout(id);
  }, [item.id, item.duration, dismiss]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 120) {
        x.value = withSpring(e.translationX > 0 ? 400 : -400, spring.snappy);
        runOnJS(dismiss)(item.id);
      } else {
        x.value = withSpring(0, spring.snappy);
      }
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const accent = item.tone === 'danger' ? t.danger : item.tone === 'success' ? t.success : t.text;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        entering={FadeInUp.springify().damping(22)}
        exiting={FadeOut}
        layout={LinearTransition}
        style={[
          styles.toast,
          shadow.floating,
          { backgroundColor: t.surfaceRaised, borderColor: t.border },
          style,
        ]}
      >
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text variant="callout" style={{ flex: 1, fontWeight: '500' }} numberOfLines={2}>
          {item.message}
        </Text>
        {item.actionLabel && (
          <PressableScale
            onPress={() => runAction(item.id)}
            haptic="selection"
            accessibilityRole="button"
            accessibilityLabel={item.actionLabel}
            hitArea
          >
            <Text variant="callout" tone="accent" style={{ fontWeight: '700' }}>
              {item.actionLabel}
            </Text>
          </PressableScale>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

/** Renders the stacked toast queue above the tab bar. Mount once in the root. */
export function ToastQueueHost() {
  const insets = useSafeAreaInsets();
  const toasts = useToastQueueStore((s) => s.toasts);

  return (
    <View style={[styles.host, { bottom: insets.bottom + 92 }]} pointerEvents="box-none">
      {toasts.map((item) => (
        <ToastRow key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: spacing.lg, right: spacing.lg, gap: spacing.sm },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
