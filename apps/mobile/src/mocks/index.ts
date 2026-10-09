import providersData from './providers.json';
import type { Provider } from './types';

/** Typed access to the demo provider catalogue. */
export const providers: Provider[] = providersData as Provider[];

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export type { Provider, Service, ProviderCategory } from './types';
