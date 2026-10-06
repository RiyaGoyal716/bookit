import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../src/lib/queryClient';
import { initMonitoring } from '../src/lib/monitoring';

// Safe no-op when no Sentry DSN is configured.
initMonitoring();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Bookit' }} />
      </Stack>
    </QueryClientProvider>
  );
}
