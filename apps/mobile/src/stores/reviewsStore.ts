import { create } from 'zustand';

import { track } from '../lib/analytics';

export interface Review {
  id: string;
  providerId: string;
  author: string;
  rating: number;
  text: string;
  /** Human-readable date, e.g. "3 Oct 2026". */
  date: string;
}

const seeded: Review[] = [
  {
    id: 'r1',
    providerId: 'p1',
    author: 'Priya S.',
    rating: 5,
    text: 'Spotless deep clean and really friendly. Booked again for next month.',
    date: '2 Oct 2026',
  },
  {
    id: 'r2',
    providerId: 'p1',
    author: 'Tom H.',
    rating: 4,
    text: 'Great job on the kitchen, arrived right on time.',
    date: '28 Sep 2026',
  },
  {
    id: 'r3',
    providerId: 'p5',
    author: 'Marcus D.',
    rating: 5,
    text: 'Best fade in Headingley, no question. Sharp and quick.',
    date: '1 Oct 2026',
  },
  {
    id: 'r4',
    providerId: 'p9',
    author: 'Aisha K.',
    rating: 5,
    text: 'My son went up two grades. Patient and clear explanations.',
    date: '30 Sep 2026',
  },
];

interface ReviewsState {
  reviews: Review[];
  forProvider: (providerId: string) => Review[];
  addReview: (input: Omit<Review, 'id' | 'date'>) => void;
}

function today(): string {
  const d = new Date();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Mock reviews store (session-only), seeded per provider. */
export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: seeded,
  forProvider: (providerId: string) => get().reviews.filter((r) => r.providerId === providerId),
  addReview: (input) =>
    set((state) => {
      track('write_review', { providerId: input.providerId, rating: input.rating });
      const review: Review = { ...input, id: `r${Date.now()}`, date: today() };
      return { reviews: [review, ...state.reviews] };
    }),
}));
