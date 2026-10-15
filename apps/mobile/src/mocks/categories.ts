import type { ProviderCategory } from './types';
import type { IconName as UiIconName } from '../components/ui/Icon';

export type IconName = UiIconName;

export interface SubService {
  id: string;
  name: string;
  /** "From" price in whole GBP. */
  priceFrom: number;
  durationMin: number;
  description: string;
  popular?: boolean;
}

/** A bundled multi-service package shown on the category page. */
export interface Package {
  id: string;
  name: string;
  /** Bundle price in whole GBP. */
  price: number;
  /** Undiscounted value, for the strikethrough "save" badge. */
  wasPrice: number;
  durationMin: number;
  /** What's included in the bundle. */
  includes: string[];
  popular?: boolean;
}

export interface Category {
  /** URL slug used by /category/[slug]. */
  slug: string;
  /** Display label. */
  label: string;
  icon: IconName;
  /** Live categories map to a provider category; coming-soon ones don't. */
  providerCategory?: ProviderCategory;
  /** False => "Coming soon" (not yet bookable). */
  live: boolean;
  /** Short tagline for the category hero. */
  tagline: string;
  /** Curated sub-services shown on the category page. */
  subServices: SubService[];
  /** Bundled packages (live categories only). */
  packages?: Package[];
}

/** The eight home-grid categories — three live, five coming soon. */
export const categories: Category[] = [
  {
    slug: 'cleaning',
    label: 'Cleaning',
    icon: 'sparkles',
    providerCategory: 'cleaning',
    live: true,
    tagline: 'Vetted cleaners for a spotless home',
    subServices: [
      {
        id: 'regular-clean',
        name: 'Regular clean',
        priceFrom: 18,
        durationMin: 60,
        description: 'Weekly or fortnightly tidy-up',
        popular: true,
      },
      {
        id: 'deep-clean',
        name: 'Deep clean',
        priceFrom: 45,
        durationMin: 150,
        description: 'Top-to-bottom reset for your home',
        popular: true,
      },
      {
        id: 'end-of-tenancy',
        name: 'End of tenancy',
        priceFrom: 85,
        durationMin: 240,
        description: 'Deposit-back standard move-out clean',
      },
      {
        id: 'oven-clean',
        name: 'Oven clean',
        priceFrom: 48,
        durationMin: 120,
        description: 'Degreased racks, door and interior',
      },
      {
        id: 'carpet-clean',
        name: 'Carpet & upholstery',
        priceFrom: 48,
        durationMin: 90,
        description: 'Shampoo and refresh carpets or sofas',
      },
    ],
    packages: [
      {
        id: 'move-in-bundle',
        name: 'Move-in ready bundle',
        price: 110,
        wasPrice: 140,
        durationMin: 300,
        includes: ['Deep clean', 'Inside oven', 'Inside windows', 'Carpet refresh'],
        popular: true,
      },
      {
        id: 'spring-reset',
        name: 'Spring reset',
        price: 75,
        wasPrice: 90,
        durationMin: 210,
        includes: ['Deep clean', 'Inside windows', 'Ironing (30 min)'],
      },
    ],
  },
  {
    slug: 'beauty',
    label: 'Beauty',
    icon: 'scissors',
    providerCategory: 'beauty',
    live: true,
    tagline: 'Barber, hair and beauty pros near you',
    subServices: [
      {
        id: 'haircut',
        name: 'Haircut & styling',
        priceFrom: 16,
        durationMin: 45,
        description: 'Cuts, fades and blow-dries',
        popular: true,
      },
      {
        id: 'nails',
        name: 'Nails',
        priceFrom: 22,
        durationMin: 60,
        description: 'Gel manicures and pedicures',
        popular: true,
      },
      {
        id: 'lashes-brows',
        name: 'Lashes & brows',
        priceFrom: 18,
        durationMin: 45,
        description: 'Lifts, tints and shaping',
      },
      {
        id: 'facial',
        name: 'Facial & skincare',
        priceFrom: 20,
        durationMin: 45,
        description: 'Express and deep-cleanse facials',
      },
      {
        id: 'waxing',
        name: 'Waxing',
        priceFrom: 24,
        durationMin: 45,
        description: 'Smooth, salon-quality waxing',
      },
    ],
    packages: [
      {
        id: 'glow-up',
        name: 'Glow-up day',
        price: 65,
        wasPrice: 82,
        durationMin: 150,
        includes: ['Haircut & styling', 'Gel manicure', 'Express facial'],
        popular: true,
      },
      {
        id: 'event-ready',
        name: 'Event ready',
        price: 48,
        wasPrice: 58,
        durationMin: 105,
        includes: ['Blow-dry', 'Lashes & brows'],
      },
    ],
  },
  {
    slug: 'tutoring',
    label: 'Tutoring',
    icon: 'graduation-cap',
    providerCategory: 'tutoring',
    live: true,
    tagline: 'Expert tutors for every subject',
    subServices: [
      {
        id: 'maths',
        name: 'Maths',
        priceFrom: 22,
        durationMin: 60,
        description: 'KS2 to A-level maths',
        popular: true,
      },
      {
        id: 'english',
        name: 'English',
        priceFrom: 26,
        durationMin: 60,
        description: 'Comprehension, essays and exams',
        popular: true,
      },
      {
        id: 'science',
        name: 'Science',
        priceFrom: 30,
        durationMin: 60,
        description: 'Physics, chemistry and biology',
      },
      {
        id: 'languages',
        name: 'Languages',
        priceFrom: 27,
        durationMin: 60,
        description: 'Spanish, French and more',
      },
      {
        id: 'music',
        name: 'Music',
        priceFrom: 24,
        durationMin: 30,
        description: 'Piano, guitar and theory',
      },
    ],
    packages: [
      {
        id: 'exam-booster',
        name: 'Exam booster (5 sessions)',
        price: 125,
        wasPrice: 150,
        durationMin: 300,
        includes: ['5× 1-hour sessions', 'Progress report', 'Past-paper pack'],
        popular: true,
      },
      {
        id: 'term-starter',
        name: 'Term starter (3 sessions)',
        price: 78,
        wasPrice: 90,
        durationMin: 180,
        includes: ['3× 1-hour sessions', 'Study plan'],
      },
    ],
  },
  {
    slug: 'handyman',
    label: 'Handyman',
    icon: 'hammer',
    live: false,
    tagline: 'Odd jobs and repairs, done right',
    subServices: [],
  },
  {
    slug: 'plumbing',
    label: 'Plumbing',
    icon: 'droplet',
    live: false,
    tagline: 'Leaks, taps and installations',
    subServices: [],
  },
  {
    slug: 'electrician',
    label: 'Electrician',
    icon: 'zap',
    live: false,
    tagline: 'Certified electrical work',
    subServices: [],
  },
  {
    slug: 'moving',
    label: 'Moving',
    icon: 'box',
    live: false,
    tagline: 'Man-and-van and removals',
    subServices: [],
  },
  {
    slug: 'pet-care',
    label: 'Pet care',
    icon: 'paw',
    live: false,
    tagline: 'Walking, sitting and grooming',
    subServices: [],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/** Map a live provider-category back to its category metadata. */
export function getCategoryForProvider(pc: ProviderCategory): Category | undefined {
  return categories.find((c) => c.providerCategory === pc);
}
