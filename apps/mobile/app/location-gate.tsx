import { useEffect, useReducer, useRef, useState } from 'react';
import { View, StyleSheet, AppState, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  useReducedMotion,
  Easing,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';

import { Button, Text, TextField, PressableScale, Icon } from '../src/components/ui';
import { Fluent3D } from '../src/assets/3d';
import { useT } from '../src/i18n';
import { route } from '../src/lib/nav';
import { haptics } from '../src/lib/haptics';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { useLocationStore } from '../src/stores/locationStore';
import {
  gateReducer,
  initialGateState,
  distanceKm,
  LEEDS,
  searchPostcode,
  type ResolvedLocation,
} from '../src/features/location';
import { useTokens, useColorSchemeName, spacing, radius, type NovaTokens } from '../src/theme';

const AnimatedView = Animated.View;

/** Read the current foreground-permission state as the reducer's event shape. */
async function readPermission(): Promise<{ granted: boolean; canAskAgain: boolean }> {
  try {
    const p = await Location.getForegroundPermissionsAsync();
    return { granted: p.status === 'granted', canAskAgain: p.canAskAgain };
  } catch {
    return { granted: false, canAskAgain: true };
  }
}

/** Resolve coords -> a display label via reverse geocode, with graceful fallback. */
async function resolveAddress(coords: {
  latitude: number;
  longitude: number;
}): Promise<ResolvedLocation> {
  let label = 'Your location';
  let city = 'Leeds';
  let postcode: string | undefined;
  try {
    // reverseGeocodeAsync can hang in Expo Go (no native geocoder / slow network),
    // so race it against a short timeout and fall back gracefully.
    const geocode = Location.reverseGeocodeAsync(coords);
    const timeout = new Promise<Location.LocationGeocodedAddress[]>((resolve) =>
      setTimeout(() => resolve([]), 2500),
    );
    const [place] = await Promise.race([geocode, timeout]);
    if (place) {
      city = place.city ?? place.subregion ?? city;
      postcode = place.postalCode ?? undefined;
      const area = place.district ?? place.name ?? place.street ?? '';
      label = area ? `${area}, ${city}` : city;
    }
  } catch {
    // Keep fallback label.
  }
  return {
    label,
    city,
    postcode,
    latitude: coords.latitude,
    longitude: coords.longitude,
    distanceKm: distanceKm(coords, LEEDS),
    source: 'gps',
  };
}

export default function LocationGateScreen() {
  const router = useRouter();
  const t = useT();
  const tok = useTokens();
  const scheme = useColorSchemeName();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const styles = makeStyles(tok);

  const seen = useOnboardingStore((s) => s.seen);
  const setLocation = useLocationStore((s) => s.setLocation);

  const [state, dispatch] = useReducer(gateReducer, initialGateState);
  const [manualOpen, setManualOpen] = useState(false);
  const [postcode, setPostcode] = useState('');
  const [manualError, setManualError] = useState<string | undefined>();
  const navigatedRef = useRef(false);
  const locatingIdRef = useRef(0);

  // --- Animations ---
  const pinDrop = useSharedValue(-120);
  const shake = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      pinDrop.value = 0;
      return;
    }
    pinDrop.value = withDelay(150, withSpring(0, { damping: 9, stiffness: 180, mass: 1 }));
    ring.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    return () => cancelAnimation(ring);
  }, [reduced, pinDrop, ring]);

  // Shake the pin whenever a denial lands (warning haptic fired at the source).
  // This write must come before the worklet that captures `shake`.
  const denied = state.status === 'denied';
  useEffect(() => {
    if (!denied || reduced) return;
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [denied, state.denials, reduced, shake]);

  const pinStyle = useAnimatedStyle(() => ({ transform: [{ translateY: pinDrop.value }] }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  // --- Side effects driven by reducer status ---

  // requesting -> ask the OS, branch on services + permission.
  useEffect(() => {
    if (state.status !== 'requesting') return;
    let cancelled = false;
    (async () => {
      try {
        const servicesOn = await Location.hasServicesEnabledAsync();
        if (cancelled) return;
        if (!servicesOn) {
          dispatch({ type: 'SERVICES_OFF' });
          haptics.warning();
          return;
        }
        const res = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        dispatch({
          type: 'PERMISSION_RESULT',
          granted: res.status === 'granted',
          canAskAgain: res.canAskAgain,
        });
        if (res.status === 'granted') haptics.selection();
        else haptics.warning();
      } catch {
        if (!cancelled) dispatch({ type: 'POSITION_TIMEOUT' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.status]);

  // locating -> get position (8s timeout, last-known fallback) then resolve.
  useEffect(() => {
    if (state.status !== 'locating') return;
    const currentId = ++locatingIdRef.current;
    (async () => {
      try {
        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
        const fix = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          timeout,
        ]);
        let coords = fix?.coords;
        if (!coords) {
          const last = await Location.getLastKnownPositionAsync();
          coords = last?.coords;
        }
        if (locatingIdRef.current !== currentId) return;
        if (!coords) {
          dispatch({ type: 'POSITION_TIMEOUT' });
          return;
        }
        dispatch({ type: 'POSITION_OK' });
        const address = await resolveAddress(coords);
        if (locatingIdRef.current !== currentId) return;
        dispatch({ type: 'RESOLVED', address });
      } catch {
        if (locatingIdRef.current === currentId) dispatch({ type: 'RESOLVE_ERROR' });
      }
    })();
  }, [state.status]);

  useEffect(() => {
    return () => {
      locatingIdRef.current++;
    };
  }, []);

  // success / manual -> persist + continue after a beat.
  useEffect(() => {
    if ((state.status === 'success' || state.status === 'manual') && state.address) {
      setLocation(state.address);
      haptics.success();
      const id = setTimeout(() => {
        if (navigatedRef.current) return;
        navigatedRef.current = true;
        router.replace(seen ? route('/(tabs)') : route('/onboarding'));
      }, 600);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state.status, state.address, setLocation, router, seen]);

  // Re-check permission when returning from Settings (blocked -> granted).
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (next) => {
      if (next !== 'active') return;
      if (state.status === 'blocked' || state.status === 'servicesOff') {
        const perm = await readPermission();
        dispatch({ type: 'APP_ACTIVE', granted: perm.granted, canAskAgain: perm.canAskAgain });
      }
    });
    return () => sub.remove();
  }, [state.status]);

  // Auto-start on mount.
  useEffect(() => {
    dispatch({ type: 'REQUEST' });
  }, []);

  const onAllow = () => {
    haptics.light();
    dispatch({ type: 'REQUEST' });
  };

  const onOpenSettings = () => {
    haptics.light();
    void Linking.openSettings();
  };

  const onTurnOnServices = async () => {
    haptics.light();
    if (Platform.OS === 'android') {
      try {
        await Location.enableNetworkProviderAsync();
        dispatch({ type: 'REQUEST' });
        return;
      } catch {
        // User declined the system dialog; fall through to Settings.
      }
    }
    void Linking.openSettings();
  };

  const onConfirmPostcode = () => {
    const found = searchPostcode(postcode);
    if (!found) {
      setManualError(
        t(
          postcode.trim().length < 5 ? 'locationGate.manualInvalid' : 'locationGate.manualNotFound',
        ),
      );
      haptics.warning();
      return;
    }
    setManualError(undefined);
    haptics.selection();
    setManualOpen(false);
    dispatch({ type: 'MANUAL_CONFIRMED', address: found });
  };

  const onSkipToLeeds = () => {
    haptics.light();
    const leeds: ResolvedLocation = {
      label: 'Headingley, Leeds',
      city: 'Leeds',
      latitude: LEEDS.latitude,
      longitude: LEEDS.longitude,
      distanceKm: 0,
      source: 'manual',
    };
    setLocation(leeds);
    if (!navigatedRef.current) {
      navigatedRef.current = true;
      router.replace(seen ? route('/(tabs)') : route('/onboarding'));
    }
  };

  const busy =
    state.status === 'requesting' || state.status === 'locating' || state.status === 'resolving';

  // --- Per-status content ---
  let title = t('locationGate.title');
  let body = t('locationGate.body');
  let primaryLabel = t('locationGate.allow');
  let primaryAction = onAllow;

  switch (state.status) {
    case 'locating':
      body = t('locationGate.locating');
      break;
    case 'resolving':
      body = t('locationGate.resolving');
      break;
    case 'denied':
      title = t('locationGate.denied');
      body = t('locationGate.deniedBody');
      break;
    case 'blocked':
      title = t('locationGate.blockedTitle');
      body = t('locationGate.blockedBody');
      primaryLabel = t('locationGate.openSettings');
      primaryAction = onOpenSettings;
      break;
    case 'servicesOff':
      title = t('locationGate.servicesOffTitle');
      body = t('locationGate.servicesOffBody');
      primaryLabel = t('locationGate.turnOn');
      primaryAction = onTurnOnServices;
      break;
    case 'timeout':
      title = t('locationGate.timeoutTitle');
      body = t('locationGate.timeoutBody');
      primaryLabel = t('locationGate.tryAgain');
      primaryAction = () => dispatch({ type: 'RETRY' });
      break;
    case 'success':
    case 'manual':
      title = `${t('locationGate.foundPrefix')} ${state.address?.label ?? ''}`;
      body = '';
      break;
    default:
      break;
  }

  const isOutOfArea = state.status === 'outOfArea';
  const resolved = state.status === 'success' || state.status === 'manual';

  return (
    <View
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Animated map grid + pulsing rings behind the pin */}
      <View style={styles.hero} pointerEvents="none">
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Line
              key={`h${i}`}
              x1="0%"
              y1={`${12 + i * 13}%`}
              x2="100%"
              y2={`${12 + i * 13}%`}
              stroke={tok.border}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <Line
              key={`v${i}`}
              x1={`${8 + i * 17}%`}
              y1="0%"
              x2={`${8 + i * 17}%`}
              y2="100%"
              stroke={tok.border}
              strokeWidth={1}
            />
          ))}
        </Svg>
        <PulseRings color={tok.primary} ring={ring} reduced={reduced} />
        <AnimatedView style={[styles.pin, pinStyle, shakeStyle]}>
          <Fluent3D name="round_pushpin" size={88} />
        </AnimatedView>
        {resolved && (
          <View style={[styles.tick, { backgroundColor: tok.success }]}>
            <Icon name="check" size={20} color="#FFFFFF" weight="bold" />
          </View>
        )}
      </View>

      {/* Copy + actions */}
      <View style={styles.sheet}>
        <Text variant="title1" center>
          {title}
        </Text>
        {body ? (
          <Text variant="body" tone="muted" center style={styles.body}>
            {body}
          </Text>
        ) : null}

        {isOutOfArea ? (
          <View style={styles.actions}>
            <Text variant="title2" center>
              {t('locationGate.outOfAreaTitle', { city: state.outOfAreaCity ?? '' })}
            </Text>
            <Text variant="body" tone="muted" center style={styles.body}>
              {t('locationGate.outOfAreaBody')}
            </Text>
            <Button
              label={t('locationGate.notifyMe')}
              onPress={() => {
                haptics.success();
                router.replace(seen ? route('/(tabs)') : route('/onboarding'));
              }}
            />
            <Button
              variant="secondary"
              label={t('locationGate.browseLeeds')}
              onPress={() => {
                haptics.light();
                const leeds: ResolvedLocation = {
                  label: 'Headingley, Leeds',
                  city: 'Leeds',
                  latitude: LEEDS.latitude,
                  longitude: LEEDS.longitude,
                  distanceKm: 0,
                  source: 'manual',
                };
                setLocation(leeds);
                router.replace(seen ? route('/(tabs)') : route('/onboarding'));
              }}
            />
          </View>
        ) : resolved ? null : (
          <View style={styles.actions}>
            <Button label={primaryLabel} onPress={primaryAction} loading={busy} />
            <PressableScale
              onPress={onSkipToLeeds}
              style={styles.secondary}
              accessibilityRole="button"
              accessibilityLabel="Explore Leeds (Demo)"
            >
              <Text variant="body" style={{ color: tok.primary, fontWeight: '600' }}>
                Explore Demo (Leeds)
              </Text>
            </PressableScale>
            {!busy && (
              <PressableScale
                onPress={() => {
                  haptics.light();
                  setManualOpen(true);
                }}
                style={[styles.secondary, { paddingTop: 0 }]}
                accessibilityRole="button"
                accessibilityLabel={t('locationGate.manualCta')}
              >
                <Text variant="footnote" tone="muted">
                  {t('locationGate.manualCta')}
                </Text>
              </PressableScale>
            )}
          </View>
        )}
      </View>

      {/* Manual postcode panel (Apple 5.1.1 fallback) */}
      {manualOpen && (
        <AnimatedView
          style={[styles.manualSheet, { backgroundColor: tok.surface, borderColor: tok.border }]}
        >
          <View style={styles.manualHeader}>
            <Text variant="title2">{t('locationGate.manualTitle')}</Text>
            <PressableScale
              onPress={() => setManualOpen(false)}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <Icon name="close" size={24} color={tok.textMuted} weight="bold" />
            </PressableScale>
          </View>
          <Text variant="footnote" tone="muted">
            {t('locationGate.manualBody')}
          </Text>
          <TextField
            label={t('locationGate.manualLabel')}
            placeholder={t('locationGate.manualPlaceholder')}
            value={postcode}
            autoCapitalize="characters"
            autoCorrect={false}
            error={manualError}
            onChangeText={(v) => {
              setPostcode(v);
              if (manualError) setManualError(undefined);
            }}
            onSubmitEditing={onConfirmPostcode}
          />
          <Button label={t('locationGate.manualConfirm')} onPress={onConfirmPostcode} />
        </AnimatedView>
      )}
    </View>
  );
}

/** Three staggered expanding rings around the pin. */
function PulseRings({
  color,
  ring,
  reduced,
}: {
  color: string;
  ring: SharedValue<number>;
  reduced: boolean;
}) {
  const r0 = useAnimatedStyle(() => {
    const p = ring.value % 1;
    return {
      opacity: reduced ? 0.12 : 0.35 * (1 - p),
      transform: [{ scale: reduced ? 1 : 0.5 + p * 1.6 }],
    };
  });
  const r1 = useAnimatedStyle(() => {
    const p = (ring.value + 0.33) % 1;
    return {
      opacity: reduced ? 0.1 : 0.3 * (1 - p),
      transform: [{ scale: reduced ? 1 : 0.5 + p * 1.6 }],
    };
  });
  const r2 = useAnimatedStyle(() => {
    const p = (ring.value + 0.66) % 1;
    return {
      opacity: reduced ? 0.08 : 0.25 * (1 - p),
      transform: [{ scale: reduced ? 1 : 0.5 + p * 1.6 }],
    };
  });
  return (
    <>
      <AnimatedView style={[ringStyles.ring, { borderColor: color }, r0]} />
      <AnimatedView style={[ringStyles.ring, { borderColor: color }, r1]} />
      <AnimatedView style={[ringStyles.ring, { borderColor: color }, r2]} />
    </>
  );
}

const ringStyles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
});

const makeStyles = (t: NovaTokens) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg, paddingHorizontal: spacing.lg },
    hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    pin: { alignItems: 'center', justifyContent: 'center' },
    tick: {
      position: 'absolute',
      top: '50%',
      marginTop: -8,
      marginLeft: 40,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheet: { gap: spacing.md, paddingBottom: spacing.lg },
    body: { maxWidth: 340, alignSelf: 'center' },
    actions: { gap: spacing.sm, marginTop: spacing.md },
    secondary: { alignItems: 'center', paddingVertical: spacing.md },
    manualSheet: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: StyleSheet.hairlineWidth,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    manualHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  });
