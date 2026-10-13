import providersData from './providers.json';
import type { Provider } from './types';

/** Typed access to the demo provider catalogue. */
export const providers: Provider[] = providersData as Provider[];

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

/** All providers in a given category (by provider-category key). */
export function getProvidersByCategory(category: Provider['category']): Provider[] {
  return providers.filter((p) => p.category === category);
}

export type { Provider, Service, ProviderCategory, ProviderBadge, ProviderStats } from './types';
export {
  categories,
  getCategoryBySlug,
  getCategoryForProvider,
  type Category,
  type SubService,
  type Package,
} from './categories';
