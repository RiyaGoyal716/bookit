import { type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { useTokens, spacing } from '../../theme';
import { useIsRTL } from '../../i18n';
import { Text } from './Text';
import { IconButton } from './IconButton';

export interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  /** Show the back chevron. Default: true. */
  back?: boolean;
  onBack?: () => void;
  /** Optional trailing element (e.g. an IconButton). */
  right?: ReactNode;
  /** Large inline title (title1) instead of the compact centred one. */
  large?: boolean;
}

/** Compact NOVA navigation header: back control, title and a trailing slot. */
export function ScreenHeader({
  title,
  subtitle,
  back = true,
  onBack,
  right,
  large = false,
}: ScreenHeaderProps) {
  const t = useTokens();
  const router = useRouter();
  const rtl = useIsRTL();

  const handleBack = onBack ?? (() => router.back());

  if (large) {
    return (
      <View style={styles.largeWrap}>
        <View style={[styles.row, rtl && styles.rowRtl]}>
          {back ? (
            <IconButton
              name={rtl ? 'chevron-right' : 'chevron-left'}
              accessibilityLabel="Go back"
              variant="subtle"
              onPress={handleBack}
            />
          ) : (
            <View style={styles.spacer} />
          )}
          {right ?? <View style={styles.spacer} />}
        </View>
        {title ? (
          <Text variant="title1" style={styles.largeTitle}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="footnote" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.compact, rtl && styles.rowRtl, { borderColor: t.border }]}>
      {back ? (
        <IconButton
          name={rtl ? 'chevron-right' : 'chevron-left'}
          accessibilityLabel="Go back"
          variant="subtle"
          onPress={handleBack}
        />
      ) : (
        <View style={styles.spacer} />
      )}
      <View style={styles.titleWrap}>
        {title ? (
          <Text variant="headline" numberOfLines={1} center>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1} center>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowRtl: { flexDirection: 'row-reverse' },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  titleWrap: { flex: 1, alignItems: 'center' },
  largeWrap: { paddingHorizontal: spacing.lg, gap: spacing.xs, paddingVertical: spacing.sm },
  largeTitle: { marginTop: spacing.xs },
  spacer: { width: 44, height: 44 },
});
