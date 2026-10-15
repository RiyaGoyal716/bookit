import { useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { InterTight_600SemiBold, InterTight_700Bold } from '@expo-google-fonts/inter-tight';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { queryClient } from '../src/lib/queryClient';
import { initMonitoring } from '../src/lib/monitoring';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { ToastHost } from '../src/components/Toast';
import { useColors, useColorSchemeName } from '../src/theme';
import { DirectionProvider } from '../src/i18n';

// Keep the native splash up until fonts are ready.
SplashScreen.preventAutoHideAsync();

// Safe no-op when no Sentry DSN is configured.
initMonitoring();

function ThemedStack() {
  const c = useColors();
  const scheme = useColorSchemeName();

  return (
    <ErrorBoundary scheme={scheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.background.base },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="region" />
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="permissions" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="concierge" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="post-job" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="offers" />
        <Stack.Screen name="search" options={{ animation: 'fade' }} />
        <Stack.Screen name="category/[slug]" />
        <Stack.Screen name="cart" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="referrals" />
        <Stack.Screen name="favourites" />
        <Stack.Screen name="legal" />
        <Stack.Screen name="policies" />
        <Stack.Screen name="provider/[id]" />
        <Stack.Screen name="booking/[providerId]" />
        <Stack.Screen name="booking-detail/[id]" />
        <Stack.Screen name="review" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="addresses" />
        <Stack.Screen name="help" />
        <Stack.Screen name="success" options={{ animation: 'fade', gestureEnabled: false }} />
      </Stack>
      <ToastHost />
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    InterTight_600SemiBold,
    InterTight_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <DirectionProvider>
              <ThemedStack />
            </DirectionProvider>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
