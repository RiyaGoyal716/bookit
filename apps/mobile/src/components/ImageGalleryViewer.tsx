import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { spacing, typography } from '../theme';

export interface ImageGalleryViewerProps {
  visible: boolean;
  images: string[];
  /** Index to open on. */
  initialIndex?: number;
  onClose: () => void;
}

/**
 * Full-screen image viewer — a Modal with a horizontally paged ScrollView.
 * Built with core RN + expo-image (no new deps). Dark backdrop, close button
 * and an "n of m" counter.
 */
export function ImageGalleryViewer({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageGalleryViewerProps) {
  const styles = useMemo(() => makeStyles(), []);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(initialIndex);

  // Reset the page index on open during render (lint-safe pattern).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible && !wasVisible) {
    setWasVisible(true);
    setIndex(initialIndex);
  }
  if (!visible && wasVisible) setWasVisible(false);

  useEffect(() => {
    if (visible) {
      // Jump to the initial page once laid out.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ x: initialIndex * width, animated: false });
      });
    }
  }, [visible, initialIndex, width]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
        >
          {images.map((uri, i) => (
            <View key={`${uri}-${i}`} style={{ width, height, justifyContent: 'center' }}>
              <Image
                source={{ uri }}
                style={{ width, height: height * 0.7 }}
                contentFit="contain"
                transition={150}
                cachePolicy="memory-disk"
                accessibilityIgnoresInvertColors
              />
            </View>
          ))}
        </ScrollView>

        <Pressable
          onPress={onClose}
          hitSlop={10}
          style={[styles.close, { top: insets.top + spacing.md }]}
          accessibilityRole="button"
          accessibilityLabel="Close gallery"
        >
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </Pressable>

        {images.length > 1 ? (
          <View style={[styles.counter, { bottom: insets.bottom + spacing.xl }]}>
            <Text style={styles.counterText}>
              {index + 1} of {images.length}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
    },
    close: {
      position: 'absolute',
      right: spacing.lg,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    counter: {
      position: 'absolute',
      alignSelf: 'center',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    counterText: {
      ...typography.scale.smallMedium,
      color: '#FFFFFF',
    },
  });
