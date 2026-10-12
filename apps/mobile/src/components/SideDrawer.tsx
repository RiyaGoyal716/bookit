import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

export interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  /** Header content (e.g. the user card). */
  header?: ReactNode;
  children?: ReactNode;
}

/**
 * Custom left side drawer — a Modal with a tappable overlay and an Animated
 * slide-in panel. No new deps (core RN Animated + Modal).
 */
export function SideDrawer({ visible, onClose, header, children }: SideDrawerProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const panelWidth = Math.min(320, width * 0.82);

  // Keep the Modal mounted through the exit animation.
  const [mounted, setMounted] = useState(visible);
  const [translate] = useState(() => new Animated.Value(-panelWidth));
  const [overlay] = useState(() => new Animated.Value(0));

  // Mount on open during render (lint-safe, same pattern as SortFilterSheet).
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translate, { toValue: 0, useNativeDriver: true, friction: 9, tension: 70 }),
        Animated.timing(overlay, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translate, {
          toValue: -panelWidth,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlay, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, panelWidth, translate, overlay]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: overlay }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.panel,
            {
              width: panelWidth,
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateX: translate }],
            },
          ]}
        >
          {header ? <View style={styles.header}>{header}</View> : null}
          <View style={styles.content}>{children}</View>
          <Text style={styles.version}>Bookit · v1.0.0</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.overlay,
    },
    panel: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: c.background.surface,
      borderTopRightRadius: radius.xl,
      borderBottomRightRadius: radius.xl,
      paddingHorizontal: spacing.lg,
    },
    header: {
      marginBottom: spacing.lg,
    },
    content: {
      flex: 1,
      gap: spacing.xs,
    },
    version: {
      ...typography.scale.caption,
      color: c.text.muted,
      textAlign: 'center',
    },
  });
