/**
 * Pure price formatting. Kept separate from PriceTag.tsx so it can be imported
 * (and unit tested) without pulling in reanimated.
 *
 * Format a minor-unit amount (e.g. pence) into a currency string with grouped
 * thousands and tabular-friendly output.
 */
export function formatPrice(
  minor: number,
  opts: { symbol?: string; fractionDigits?: number } = {},
): string {
  const { symbol = '£', fractionDigits = 2 } = opts;
  const sign = minor < 0 ? '-' : '';
  const abs = Math.abs(minor);
  const major = abs / 100;
  const fixed = major.toFixed(fractionDigits);
  const [whole, frac] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${symbol}${grouped}${frac ? '.' + frac : ''}`;
}
