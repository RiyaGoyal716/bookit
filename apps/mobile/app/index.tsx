import { StyleSheet, View } from 'react-native';

import { Screen, ThemedText } from '../src/components';
import { spacing } from '../src/theme';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <ThemedText variant="title">Bookit</ThemedText>
        <ThemedText variant="subtitle">Book trusted local services near you</ThemedText>
        <ThemedText variant="caption">
          Hyperlocal services marketplace — launching in Leeds.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
});
