import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';

import { useColors, spacing, typography, type Palette } from '../theme';

/**
 * Connectivity banner shown while the device is offline.
 *
 * Uses expo-network: subscribes to state changes where available and also
 * polls as a fallback (Expo Go friendly). Renders nothing when online.
 */
export function OfflineBanner() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;

    const apply = (state: Network.NetworkState) => {
      if (!mounted) return;
      const reachable = state.isInternetReachable ?? state.isConnected ?? true;
      setOffline(!reachable);
    };

    Network.getNetworkStateAsync()
      .then(apply)
      .catch(() => {});

    // Prefer the event subscription when the platform supports it.
    const sub =
      typeof Network.addNetworkStateListener === 'function'
        ? Network.addNetworkStateListener(apply)
        : null;

    // Poll as a fallback so the banner still updates in Expo Go.
    const timer = setInterval(() => {
      Network.getNetworkStateAsync()
        .then(apply)
        .catch(() => {});
    }, 5000);

    return () => {
      mounted = false;
      sub?.remove();
      clearInterval(timer);
    };
  }, []);

  if (!offline) return null;

  return (
    <View style={[styles.banner, { paddingTop: insets.top + spacing.xs }]}>
      <Ionicons name="cloud-offline-outline" size={16} color={c.text.inverse} />
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.lg,
      backgroundColor: c.status.danger,
    },
    text: {
      ...typography.scale.smallMedium,
      color: c.text.inverse,
    },
  });
