import { createMMKV } from 'react-native-mmkv';

/**
 * App-wide key/value storage backed by MMKV. Scaffolding only — no app data
 * is read or written yet.
 */
export const storage = createMMKV({ id: 'bookit-storage' });
