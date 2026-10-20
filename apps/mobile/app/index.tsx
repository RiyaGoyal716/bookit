import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplash, Wordmark } from '../src/brand';
import { route } from '../src/lib/nav';
import { useColorSchemeName, useTokens } from '../src/theme';

/**
 * Cold-start entry. Shows the NOVA in-app animated splash (mark draws on, check
 * pops, light haptic), then redirects into the LOCATION GATE — the first screen
 * on every launch. The gate resolves a location (GPS or manual postcode) and
 * then continues into onboarding (first launch) or the tabs. The native splash
 * (expo-splash-screen) already covered the font load.
 */
export default function Entry() {
  const t = useTokens();
  const scheme = useColorSchemeName();
  const [done, setDone] = useState(false);

  if (done) {
    return <Redirect href={route('/location-gate')} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.wordmark}>
        <Wordmark size={28} />
      </View>
      <AnimatedSplash onDone={() => setDone(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  wordmark: {
    position: 'absolute',
    bottom: 72,
    alignSelf: 'center',
    zIndex: 1,
  },
});
