/**
 * Shared domain types for the demo mock data.
 */
export type ProviderCategory = 'cleaning' | 'beauty' | 'tutoring';

export interface Service {
  /** Stable id (optional for older records; falls back to name). */
  id?: string;
  name: string;
  /** Price in whole GBP. */
  price: number;
  durationMin: number;
  /** Short description shown on the service/cart rows. */
  description?: string;
  /** Marks a "Popular" sub-service. */
  popular?: boolean;
}

/** Provider trust / credential badges shown on the profile. */
export type ProviderBadge =
  'verified-id' | 'background-checked' | 'top-rated' | 'insured' | 'fast-responder';

export interface ProviderStats {
  /** Completed jobs on Bookit. */
  jobsDone: number;
  /** Years of professional experience. */
  yearsExperience: number;
  /** Typical response time label, e.g. "within 1 hour". */
  responseTime: string;
  /** Repeat-customer / rebooking rate as a 0–100 percentage. */
  repeatRate?: number;
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
  /** Short one-line tagline. */
  tagline?: string;
  /** Neighbourhood / area label. */
  area?: string;
  /** Gallery of "photos of work" (remote URLs). */
  gallery?: string[];
  /** Trust / credential badges. */
  badges?: ProviderBadge[];
  /** Headline stats shown on the profile. */
  stats?: ProviderStats;
  /** Flags used for the home rails. */
  mostBooked?: boolean;
  isNew?: boolean;
}
