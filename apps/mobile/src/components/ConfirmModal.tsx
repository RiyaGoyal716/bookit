import { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useColors, radius, shadow, spacing, typography, type Palette } from '../theme';
import { Button } from './Button';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style the confirm button as destructive. */
  destructive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Centered confirmation dialog (core RN Modal) with confirm/cancel actions. */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={styles.card}>
          {icon ? (
            <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
              <Ionicons
                name={icon}
                size={26}
                color={destructive ? c.status.danger : c.brand.tint}
              />
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="secondary" onPress={onCancel} style={styles.btn} />
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              style={{
                ...styles.btn,
                ...(destructive ? { backgroundColor: c.status.danger } : {}),
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: c.overlay,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.xl,
      borderRadius: radius.xl,
      backgroundColor: c.background.surface,
      ...shadow.floating,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.brand.primarySoft,
      marginBottom: spacing.xs,
    },
    iconWrapDanger: {
      backgroundColor: c.status.dangerSoft,
    },
    title: {
      ...typography.scale.h2,
      color: c.text.primary,
      textAlign: 'center',
    },
    message: {
      ...typography.scale.small,
      color: c.text.secondary,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.md,
      alignSelf: 'stretch',
    },
    btn: {
      flex: 1,
    },
  });
