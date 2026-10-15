import { View, StyleSheet } from 'react-native';

import { useTokens } from '../../theme';

export interface DividerProps {
  /** Left inset in px. Default 0. */
  inset?: number;
}

/** Hairline divider using the border token. */
export function Divider({ inset = 0 }: DividerProps) {
  const t = useTokens();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: t.border,
        marginLeft: inset,
      }}
    />
  );
}
