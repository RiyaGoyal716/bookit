/**
 * Shared domain types for the demo mock data.
 */
export type ProviderCategory = 'cleaning' | 'beauty' | 'tutoring';

export interface Service {
  name: string;
  /** Price in whole GBP. */
  price: number;
  durationMin: number;
}

export interface Provider {
  id: string;
  name: string;
  category: ProviderCategory;
  /** Remote avatar URL. */
  photo: string;
  rating: number;
  reviewCount: number;
  /** "From" price in whole GBP. */
  priceFrom: number;
  distanceKm: number;
  bio: string;
  verified: boolean;
  services: Service[];
}
