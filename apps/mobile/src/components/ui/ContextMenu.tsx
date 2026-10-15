import { type ReactNode, useState } from 'react';
import { Modal, Pressable, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, ZoomIn, useReducedMotion } from 'react-native-reanimated';

import { useTokens, useColorSchemeName, radius, spacing, shadow } from '../../theme';
import { haptics } from '../../lib/haptics';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

export interface ContextMenuAction {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
}

export interface ContextMenuProps {
  /** The inline card (also shown as the scaled peek preview). */
  children: ReactNode;
  /** Actions shown under the preview. */
  actions: ContextMenuAction[];
  /** Normal tap handler (e.g. navigate). */
  onPress?: () => void;
  /** Fired on open — e.g. navigate to a peek, or analytics. */
  onPeek?: () => void;
  /** Accessible name for the long-press target. */
  accessibilityLabel?: string;
  scaleTo?: number;
  style?: object;
}

/**
 * Long-press context menu: a blurred backdrop, a scaled preview of the card and
 * a list of quick actions (favourite / share / compare). Honours Reduce Motion.
 */
export function ContextMenu({
  children,
  actions,
  onPress,
  onPeek,
  accessibilityLabel,
  scaleTo = 0.98,
  style,
}: ContextMenuProps) {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  const show = () => {
    haptics.medium();
    onPeek?.();
    setOpen(true);
  };
  const close = () => setOpen(false);

  return (
    <>
      <PressableScale
        onPress={onPress}
        onLongPress={show}
        delayLongPress={300}
        scaleTo={scaleTo}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Long press for quick actions"
        style={style}
      >
        {children}
      </PressableScale>

      <Modal visible={open} transparent animationType="none" onRequestClose={close}>
        <Animated.View
          entering={reduced ? undefined : FadeIn.duration(160)}
          exiting={reduced ? undefined : FadeOut.duration(120)}
          style={StyleSheet.absoluteFill}
        >
          <BlurView intensity={28} tint={scheme} style={StyleSheet.absoluteFill} />
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Dismiss menu">
            <Animated.View
              entering={reduced ? undefined : ZoomIn.springify().damping(18)}
              style={styles.preview}
            >
              <View
                pointerEvents="none"
                style={[styles.previewCard, { backgroundColor: t.surface }]}
              >
                {children}
              </View>

              <View
                style={[
                  styles.actions,
                  { backgroundColor: t.surfaceRaised, borderColor: t.border },
                  shadow.floating,
                ]}
              >
                {actions.map((a, i) => (
                  <PressableScale
                    key={a.label}
                    haptic="selection"
                    onPress={() => {
                      close();
                      a.onPress();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={a.label}
                    style={[
                      styles.action,
                      i > 0 && {
                        borderTopColor: t.border,
                        borderTopWidth: StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <Text
                      variant="body"
                      tone={a.tone === 'danger' ? 'danger' : 'default'}
                      style={styles.actionLabel}
                    >
                      {a.label}
                    </Text>
                    <Icon name={a.icon} size={20} color={a.tone === 'danger' ? t.danger : t.text} />
                  </PressableScale>
                ))}
              </View>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.lg },
  preview: { gap: spacing.md },
  previewCard: { borderRadius: radius.lg, overflow: 'hidden' },
  actions: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  actionLabel: { flex: 1 },
});
