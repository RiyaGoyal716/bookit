/**
 * Natural-language smart-search parser for the AI concierge.
 *
 * Turns input like "deep clean tomorrow under £80, cheapest" into structured
 * filters + display chips. Pure and unit-tested; no side effects.
 */

export type WhenFilter = 'today' | 'tomorrow' | 'this-week' | 'weekend';
export type SortFilter = 'cheapest' | 'soonest' | 'top-rated';

export interface ParsedQuery {
  categorySlug?: string;
  categoryLabel?: string;
  /** Max price in major units (e.g. pounds). */
  maxPrice?: number;
  /** Min price in major units. */
  minPrice?: number;
  when?: WhenFilter;
  sort?: SortFilter;
  keywords: string[];
  chips: { id: string; label: string }[];
}

const CATEGORY_SYNONYMS: { slug: string; label: string; terms: string[] }[] = [
  {
    slug: 'cleaning',
    label: 'Cleaning',
    terms: ['clean', 'cleaning', 'cleaner', 'deep clean', 'housekeep'],
  },
  {
    slug: 'beauty',
    label: 'Beauty & barber',
    terms: ['beauty', 'barber', 'haircut', 'hair', 'nails', 'makeup', 'salon'],
  },
  {
    slug: 'tutoring',
    label: 'Tutoring',
    terms: ['tutor', 'tutoring', 'lesson', 'maths', 'math', 'english', 'teacher'],
  },
  {
    slug: 'handyman',
    label: 'Handyman',
    terms: ['handyman', 'fix', 'repair', 'assemble', 'mount', 'odd job'],
  },
  {
    slug: 'plumbing',
    label: 'Plumbing',
    terms: ['plumber', 'plumbing', 'leak', 'tap', 'boiler', 'drain'],
  },
  {
    slug: 'electrician',
    label: 'Electrician',
    terms: ['electrician', 'electric', 'wiring', 'socket', 'lighting'],
  },
  { slug: 'moving', label: 'Moving', terms: ['moving', 'movers', 'removal', 'move home', 'van'] },
  {
    slug: 'pet-care',
    label: 'Pet care',
    terms: ['pet', 'dog', 'cat', 'grooming', 'walk', 'walker'],
  },
  {
    slug: 'gardening',
    label: 'Gardening',
    terms: ['garden', 'gardening', 'lawn', 'mow', 'hedge', 'weed'],
  },
];

const STOPWORDS = new Set([
  'a',
  'an',
  'the',
  'for',
  'to',
  'me',
  'my',
  'need',
  'want',
  'please',
  'with',
  'and',
  'of',
  'in',
  'on',
  'at',
  'near',
  'around',
  'some',
  'get',
  'book',
  'looking',
  'find',
  'someone',
  'service',
]);

function detectCategory(text: string) {
  for (const cat of CATEGORY_SYNONYMS) {
    if (cat.terms.some((term) => text.includes(term))) return cat;
  }
  return undefined;
}

function detectWhen(text: string): WhenFilter | undefined {
  if (/\btonight\b|\btoday\b/.test(text)) return 'today';
  if (/\btomorrow\b/.test(text)) return 'tomorrow';
  if (/\bweekend\b|\bsaturday\b|\bsunday\b/.test(text)) return 'weekend';
  if (/\bthis week\b|\bthis-week\b/.test(text)) return 'this-week';
  return undefined;
}

function detectSort(text: string): SortFilter | undefined {
  if (/\bcheap(est)?\b|\blow(est)? price\b|\bbudget\b/.test(text)) return 'cheapest';
  if (/\bsoon(est)?\b|\basap\b|\bearliest\b|\bnow\b/.test(text)) return 'soonest';
  if (/\btop[- ]?rated\b|\bbest\b|\bhighest[- ]?rated\b|\btop\b/.test(text)) return 'top-rated';
  return undefined;
}

function detectPrice(text: string): { maxPrice?: number; minPrice?: number } {
  const out: { maxPrice?: number; minPrice?: number } = {};
  const under = text.match(/(?:under|below|less than|up to|max)\s*£?\s*(\d+)/);
  if (under) out.maxPrice = Number(under[1]);
  const over = text.match(/(?:over|above|more than|from|min)\s*£?\s*(\d+)/);
  if (over) out.minPrice = Number(over[1]);
  return out;
}

const SORT_LABEL: Record<SortFilter, string> = {
  cheapest: 'Cheapest',
  soonest: 'Soonest',
  'top-rated': 'Top rated',
};
const WHEN_LABEL: Record<WhenFilter, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  'this-week': 'This week',
  weekend: 'This weekend',
};

/** Parse a free-text query into structured filters + chips. */
export function parseSmartQuery(input: string): ParsedQuery {
  const text = input.toLowerCase().trim();
  const category = detectCategory(text);
  const when = detectWhen(text);
  const sort = detectSort(text);
  const { maxPrice, minPrice } = detectPrice(text);

  const matchedTerms = new Set<string>();
  if (category)
    category.terms.forEach((term) => term.split(' ').forEach((w) => matchedTerms.add(w)));

  const keywords = text
    .replace(/[£,.]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 1 &&
        !STOPWORDS.has(w) &&
        !matchedTerms.has(w) &&
        !/^\d+$/.test(w) &&
        !/^(under|below|less|than|up|max|over|above|more|from|min|today|tonight|tomorrow|weekend|saturday|sunday|week|this|cheap|cheapest|soon|soonest|asap|earliest|now|best|rated|top|highest|budget)$/.test(
          w,
        ),
    );

  const chips: { id: string; label: string }[] = [];
  if (category) chips.push({ id: `cat:${category.slug}`, label: category.label });
  if (when) chips.push({ id: `when:${when}`, label: WHEN_LABEL[when] });
  if (typeof maxPrice === 'number')
    chips.push({ id: `max:${maxPrice}`, label: `Under £${maxPrice}` });
  if (typeof minPrice === 'number')
    chips.push({ id: `min:${minPrice}`, label: `Over £${minPrice}` });
  if (sort) chips.push({ id: `sort:${sort}`, label: SORT_LABEL[sort] });

  return {
    categorySlug: category?.slug,
    categoryLabel: category?.label,
    maxPrice,
    minPrice,
    when,
    sort,
    keywords,
    chips,
  };
}
