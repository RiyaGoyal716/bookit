import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Text, StyleSheet, type ViewStyle } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

import { useColors, radius, spacing, typography, type Palette } from '../theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: (string | number)[];
  children?: ReactNode;
  contentStyle?: ViewStyle;
}

/**
 * Themed wrapper around @gorhom/bottom-sheet's modal — used for service/time
 * pickers and quick menus. Controlled via `visible` / `onClose`. Requires
 * BottomSheetModalProvider in the tree (added in the root layout).
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  snapPoints,
  children,
  contentStyle,
}: BottomSheetProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const ref = useRef<BottomSheetModal>(null);
  const points = useMemo(() => snapPoints ?? undefined, [snapPoints]);

  useEffect(() => {
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={points}
      enableDynamicSizing={!points}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheet}
    >
      <BottomSheetView style={[styles.content, contentStyle]}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    sheet: {
      backgroundColor: c.background.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
    },
    handle: {
      backgroundColor: c.border,
      width: 40,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xxl,
      gap: spacing.sm,
    },
    title: {
      ...typography.scale.h2,
      color: c.text.primary,
      marginBottom: spacing.sm,
    },
  });
