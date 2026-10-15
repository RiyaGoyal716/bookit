import { parseSmartQuery } from '../src/features/search/parser';

describe('parseSmartQuery', () => {
  it('parses category, time and max price from natural language', () => {
    const r = parseSmartQuery('deep clean tomorrow under £80');
    expect(r.categorySlug).toBe('cleaning');
    expect(r.when).toBe('tomorrow');
    expect(r.maxPrice).toBe(80);
    expect(r.chips.map((c) => c.label)).toEqual(
      expect.arrayContaining(['Cleaning', 'Tomorrow', 'Under £80']),
    );
  });

  it('detects sort intents', () => {
    expect(parseSmartQuery('cheapest barber today').sort).toBe('cheapest');
    expect(parseSmartQuery('soonest plumber for a leak').sort).toBe('soonest');
    expect(parseSmartQuery('top rated tutor').sort).toBe('top-rated');
  });

  it('maps synonyms to the right category', () => {
    expect(parseSmartQuery('haircut this weekend').categorySlug).toBe('beauty');
    expect(parseSmartQuery('need a dog walker').categorySlug).toBe('pet-care');
    expect(parseSmartQuery('lawn mowing').categorySlug).toBe('gardening');
  });

  it('parses a price range', () => {
    const r = parseSmartQuery('electrician over £30 under £120');
    expect(r.minPrice).toBe(30);
    expect(r.maxPrice).toBe(120);
  });

  it('returns keywords without stopwords, prices or filter words', () => {
    const r = parseSmartQuery('I need an emergency cleaner today under £50');
    expect(r.keywords).toContain('emergency');
    expect(r.keywords).not.toContain('today');
    expect(r.keywords).not.toContain('under');
    expect(r.keywords).not.toContain('50');
  });

  it('handles an empty / unknown query gracefully', () => {
    const r = parseSmartQuery('');
    expect(r.categorySlug).toBeUndefined();
    expect(r.chips).toEqual([]);
    expect(r.keywords).toEqual([]);
  });
});
