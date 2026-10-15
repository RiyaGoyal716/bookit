import * as LocalAuthentication from 'expo-local-authentication';

/** Whether the device has enrolled biometrics available. */
export async function hasBiometrics(): Promise<boolean> {
  try {
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return has && enrolled;
  } catch {
    return false;
  }
}

/** Prompt the OS biometric sheet. Resolves true on success. */
export async function authenticate(reason = 'Unlock Bookit'): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}
