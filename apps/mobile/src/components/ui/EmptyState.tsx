import { View, StyleSheet } from 'react-native';

import { spacing } from '../../theme';
import { Text } from './Text';
import { Button } from './Button';
import {
  IllustrationEmpty,
  IllustrationError,
  IllustrationSpot,
  IllustrationFindPros,
} from '../../assets/illustrations';

export type EmptyArt = 'empty' | 'error' | 'spot' | 'search';

export interface EmptyStateProps {
  art?: EmptyArt;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ART = {
  empty: IllustrationEmpty,
  error: IllustrationError,
  spot: IllustrationSpot,
  search: IllustrationFindPros,
};

/** Centered empty / status state with a line illustration. */
export function EmptyState({
  art = 'empty',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const Art = ART[art];
  return (
    <View style={styles.wrap}>
      <Art size={168} />
      <Text variant="title2" center>
        {title}
      </Text>
      {message && (
        <Text variant="body" tone="muted" center>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} fullWidth={false} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  action: { marginTop: spacing.sm },
});
