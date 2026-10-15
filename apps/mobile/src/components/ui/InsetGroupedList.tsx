import { Fragment } from 'react';
import { View, StyleSheet } from 'react-native';

import { useTokens, radius, spacing } from '../../theme';
import { Text } from './Text';
import { Divider } from './Divider';

export interface InsetGroupedListProps {
  /** Optional group header (uppercase label). */
  header?: string;
  /** Optional footer note. */
  footer?: string;
  children: React.ReactNode[] | React.ReactNode;
}

/** iOS-style inset grouped list container with hairline separators. */
export function InsetGroupedList({ header, footer, children }: InsetGroupedListProps) {
  const t = useTokens();
  const rows = Array.isArray(children) ? children.filter(Boolean) : [children];

  return (
    <View style={styles.wrap}>
      {header && (
        <Text variant="caption" tone="subtle" style={styles.header}>
          {header.toUpperCase()}
        </Text>
      )}
      <View style={[styles.group, { backgroundColor: t.surface, borderColor: t.border }]}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {row}
            {i < rows.length - 1 && <Divider inset={spacing.lg} />}
          </Fragment>
        ))}
      </View>
      {footer && (
        <Text variant="footnote" tone="subtle" style={styles.footer}>
          {footer}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  header: { marginLeft: spacing.lg, letterSpacing: 0.4 },
  footer: { marginHorizontal: spacing.lg },
  group: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
