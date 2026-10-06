import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

/**
 * Minimal Sentry initialisation.
 *
 * Safe to call without a DSN configured — in that case Sentry is simply not
 * initialised and the app continues to run normally. No business logic.
 */
export function initMonitoring(): void {
  const dsn =
    process.env.EXPO_PUBLIC_SENTRY_DSN ??
    (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)?.sentryDsn;

  if (!dsn) {
    // No DSN configured — skip init so development doesn't crash.
    return;
  }

  Sentry.init({
    dsn,
    // Keep tracing off by default for scaffolding.
    tracesSampleRate: 0,
  });
}
